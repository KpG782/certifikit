import { NextRequest, NextResponse } from "next/server";
import { getEmailQueueByIds, updateEmailQueueStatus } from "@/lib/db";

/**
 * POST /api/send-one
 * Body: { id: number }
 *
 * Sends a single queued email through the n8n webhook and atomically
 * updates the row's status: pending → sending → (sent | failed).
 * Only `pending` rows are accepted — `sent`, `sending`, `cancelled`,
 * and `failed` rows are rejected so the caller can re-queue first.
 */
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (typeof id !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing 'id' (must be a number)" },
        { status: 400 }
      );
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: "Email service not configured (N8N_WEBHOOK_URL missing)" },
        { status: 500 }
      );
    }

    const [item] = await getEmailQueueByIds([id]);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (item.status !== "pending") {
      return NextResponse.json(
        {
          error: `Cannot send: row is '${item.status}'. Retry it back to 'pending' first.`,
          status: item.status,
        },
        { status: 409 }
      );
    }

    await updateEmailQueueStatus({ id: item.id, status: "sending" });

    const payload: Record<string, unknown> = {
      id: item.id,
      recipient_email: item.recipientEmail,
      recipient_name: item.recipientName,
      certificate_image: item.certificateImage,
      subject: item.subject,
      message: item.message,
      timestamp: new Date().toISOString(),
      primary_color: "hsla(220, 90%, 56%, 1)",
      secondary_color: "hsla(220, 90%, 35%, 1)",
      accent_color: "hsla(45, 100%, 51%, 1)",
      highlight_color: "hsla(352, 99%, 44%, 1)",
    };

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updated = await updateEmailQueueStatus({
          id: item.id,
          status: "sent",
          sentAt: new Date().toISOString(),
        });
        return NextResponse.json(
          { success: true, message: "Email sent", data: updated },
          { status: 200 }
        );
      }

      const errorText = await response.text();
      const updated = await updateEmailQueueStatus({
        id: item.id,
        status: "failed",
        errorMessage: `Webhook error: ${errorText}`,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Webhook returned ${response.status}`,
          details: errorText,
          data: updated,
        },
        { status: 502 }
      );
    } catch (networkError) {
      const errMsg =
        networkError instanceof Error
          ? networkError.message
          : "Unknown network error";
      const updated = await updateEmailQueueStatus({
        id: item.id,
        status: "failed",
        errorMessage: `Network error: ${errMsg}`,
      });
      return NextResponse.json(
        { success: false, error: errMsg, data: updated },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("send-one error:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
