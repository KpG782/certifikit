import { NextRequest, NextResponse } from "next/server";
import {
  getEmailQueueByIds,
  updateEmailQueueStatus,
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No items selected" }, { status: 400 });
    }

    // 50-item cap matches the queue cap and keeps the bulk payload bounded.
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

    // Prefer the bulk webhook; fall back to the legacy single URL so existing
    // deployments don't break before the env var is renamed.
    const bulkUrl =
      process.env.N8N_BULK_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    if (!bulkUrl) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Only `pending` rows are eligible. Anything else (sent / sending / failed /
    // cancelled) is skipped so a stale selection can't trample an in-flight job.
    const allItems = await getEmailQueueByIds(ids);
    const items = allItems.filter((it) => it.status === "pending");
    const skipped = allItems
      .filter((it) => it.status !== "pending")
      .map((it) => ({ id: it.id, status: it.status }));

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No pending items to send",
          results: { success: 0, failed: 0, skipped, errors: [] },
        },
        { status: 200 }
      );
    }

    // Optimistically mark every eligible item as "sending" before we POST,
    // so the UI can't double-send while the webhook is in flight.
    await Promise.all(
      items.map((it) =>
        updateEmailQueueStatus({ id: it.id, status: "sending" })
      )
    );

    // The bulk workflow's `Split Items` node splits on `body.items`, so we
    // POST a single payload with all items rather than looping per item.
    const payload = {
      items: items.map((it) => ({
        id: it.id,
        recipient_email: it.recipientEmail,
        recipient_name: it.recipientName,
        certificate_image: it.certificateImage,
        subject: it.subject,
        message: it.message,
      })),
    };

    let webhookOk = false;
    let webhookError = "";
    try {
      const response = await fetch(bulkUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        webhookOk = true;
      } else {
        const errBody = await response.text();
        webhookError = `Webhook ${response.status}: ${errBody.slice(0, 500)}`;
      }
    } catch (err) {
      webhookError = `Network error: ${
        err instanceof Error ? err.message : String(err)
      }`;
    }

    // All-or-nothing: the bulk webhook currently returns aggregate success only.
    // If/when the workflow returns per-item results, this branch can be replaced
    // with a per-id update loop.
    const now = new Date().toISOString();
    await Promise.all(
      items.map((it) =>
        updateEmailQueueStatus({
          id: it.id,
          status: webhookOk ? "sent" : "failed",
          sentAt: webhookOk ? now : null,
          errorMessage: webhookOk ? null : webhookError,
        })
      )
    );

    const skippedSuffix =
      skipped.length > 0 ? ` (${skipped.length} skipped, not pending)` : "";

    return NextResponse.json(
      {
        success: webhookOk,
        message: webhookOk
          ? `Sent ${items.length} emails${skippedSuffix}`
          : `Failed to send ${items.length} emails${skippedSuffix}`,
        results: {
          success: webhookOk ? items.length : 0,
          failed: webhookOk ? 0 : items.length,
          skipped,
          errors: webhookOk
            ? []
            : items.map((it) => ({ id: it.id, error: webhookError })),
        },
      },
      { status: webhookOk ? 200 : 502 }
    );
  } catch (error) {
    console.error("Batch send error:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
