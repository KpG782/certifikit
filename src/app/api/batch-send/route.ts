import { NextRequest, NextResponse } from "next/server";
import {
  getEmailQueueByIds,
  updateEmailQueueStatus,
} from "@/lib/db";

/**
 * POST /api/batch-send
 * Body: { ids: number[] }
 *
 * Sends queued emails sequentially, one per n8n webhook call. Each row
 * transitions pending → sending → sent/failed on its own, so the queue
 * page's 5s polling shows them flip live in order. A failure on one item
 * does NOT poison the others — the loop continues and records per-item
 * errors on the failed rows.
 */
export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No items selected" }, { status: 400 });
    }

    if (ids.length > 50) {
      return NextResponse.json(
        {
          error: "Batch size limit exceeded",
          message: "Maximum 50 emails can be sent at once",
          requested: ids.length,
          limit: 50,
        },
        { status: 429 }
      );
    }

    const webhookUrl =
      process.env.N8N_BULK_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        {
          error:
            "N8N_BULK_WEBHOOK_URL not configured (legacy N8N_WEBHOOK_URL also unset)",
        },
        { status: 500 }
      );
    }

    const allItems = await getEmailQueueByIds(ids);
    const pending = allItems.filter((it) => it.status === "pending");
    const skipped = allItems
      .filter((it) => it.status !== "pending")
      .map((it) => ({ id: it.id, status: it.status }));

    if (pending.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No pending items to send",
          results: { success: 0, failed: 0, skipped, errors: [] },
        },
        { status: 200 }
      );
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: { id: number; error: string }[] = [];

    const batchStart = Date.now();
    console.log(
      `[batch-send] starting: ${pending.length} pending, ${skipped.length} skipped`
    );

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      const itemStart = Date.now();
      const tag = `[batch-send ${i + 1}/${pending.length} id=${item.id}]`;
      console.log(
        `${tag} → sending to ${item.recipientEmail} (${item.recipientName})`
      );

      await updateEmailQueueStatus({ id: item.id, status: "sending" });

      const payload = {
        id: item.id,
        recipient_email: item.recipientEmail,
        recipient_name: item.recipientName,
        certificate_image: item.certificateImage,
        subject: item.subject,
        message: item.message,
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const ms = Date.now() - itemStart;

        if (response.ok) {
          await updateEmailQueueStatus({
            id: item.id,
            status: "sent",
            sentAt: new Date().toISOString(),
          });
          successCount++;
          console.log(`${tag} ✓ sent in ${ms}ms`);
        } else {
          const errBody = await response.text();
          const errMsg = `Webhook ${response.status}: ${errBody.slice(0, 500)}`;
          await updateEmailQueueStatus({
            id: item.id,
            status: "failed",
            errorMessage: errMsg,
          });
          failedCount++;
          errors.push({ id: item.id, error: errMsg });
          console.error(`${tag} ✗ failed in ${ms}ms — ${errMsg}`);
        }
      } catch (err) {
        const ms = Date.now() - itemStart;
        const errMsg = `Network error: ${
          err instanceof Error ? err.message : String(err)
        }`;
        await updateEmailQueueStatus({
          id: item.id,
          status: "failed",
          errorMessage: errMsg,
        });
        failedCount++;
        errors.push({ id: item.id, error: errMsg });
        console.error(`${tag} ✗ network error in ${ms}ms — ${errMsg}`);
      }
    }

    const totalMs = Date.now() - batchStart;
    const avg = pending.length > 0 ? Math.round(totalMs / pending.length) : 0;
    console.log(
      `[batch-send] done: ${successCount} sent, ${failedCount} failed in ${totalMs}ms (avg ${avg}ms/email)`
    );

    const skippedSuffix =
      skipped.length > 0 ? ` (${skipped.length} skipped, not pending)` : "";

    const allOk = failedCount === 0;
    return NextResponse.json(
      {
        success: allOk,
        message: allOk
          ? `Sent ${successCount} emails${skippedSuffix}`
          : `Sent ${successCount}, failed ${failedCount}${skippedSuffix}`,
        results: {
          success: successCount,
          failed: failedCount,
          skipped,
          errors,
        },
      },
      { status: allOk ? 200 : 207 }
    );
  } catch (error) {
    console.error("Batch send error:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
