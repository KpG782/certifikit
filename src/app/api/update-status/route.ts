import { NextRequest, NextResponse } from "next/server";
import { updateEmailQueueStatus } from "@/lib/db";

/**
 * API endpoint for n8n to update email status after sending
 * POST /api/update-status
 *
 * Request body:
 * {
 *   "id": 123,
 *   "status": "sent" | "failed",
 *   "errorMessage": "Optional error message",
 *   "sentAt": "2024-11-16T10:30:00Z"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, errorMessage, sentAt } = body;

    // Validation
    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "Invalid or missing 'id' field (must be a number)" },
        { status: 400 }
      );
    }

    if (!status || !["sent", "failed", "pending"].includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid 'status' field (must be 'sent', 'failed', or 'pending')",
        },
        { status: 400 }
      );
    }

    // Update status in database
    const result = await updateEmailQueueStatus({
      id,
      status,
      errorMessage: errorMessage || null,
      sentAt: sentAt || (status === "sent" ? new Date().toISOString() : null),
    });

    return NextResponse.json(
      {
        success: true,
        message: `Status updated to '${status}' for email ID ${id}`,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json(
      {
        error: "Failed to update status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Batch update endpoint for n8n
 * Allows updating multiple emails at once
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Invalid 'updates' field (must be a non-empty array)" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { id, status, errorMessage, sentAt } = update;

        if (!id || !status) {
          errors.push({ id, error: "Missing required fields" });
          continue;
        }

        const result = await updateEmailQueueStatus({
          id,
          status,
          errorMessage: errorMessage || null,
          sentAt:
            sentAt || (status === "sent" ? new Date().toISOString() : null),
        });

        results.push({ id, success: true, data: result });
      } catch (err) {
        errors.push({
          id: update.id,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Updated ${results.length} emails, ${errors.length} errors`,
        results,
        errors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to batch update status:", error);
    return NextResponse.json(
      {
        error: "Failed to batch update status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
