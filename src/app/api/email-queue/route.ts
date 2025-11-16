import { NextRequest, NextResponse } from "next/server";
import {
  getEmailQueue,
  getEmailQueueStats,
  insertEmailQueue,
  updateEmailQueueStatus,
  deleteEmailQueue,
} from "@/lib/db";

// GET - Fetch all email queue items with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    // Fetch items with filters
    const items = await getEmailQueue({
      status,
      search,
      dateFrom,
      dateTo,
    });

    // Get statistics
    const stats = await getEmailQueueStats();

    return NextResponse.json(
      { success: true, data: items, stats },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch email queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch email queue" },
      { status: 500 }
    );
  }
}

// POST - Add new item to queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipientEmail,
      recipientName,
      subject,
      message,
      certificateImage,
    } = body;

    if (
      !recipientEmail ||
      !recipientName ||
      !subject ||
      !message ||
      !certificateImage
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await insertEmailQueue({
      recipientEmail,
      recipientName,
      subject,
      message,
      certificateImage,
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("Failed to add to queue:", error);
    return NextResponse.json(
      { error: "Failed to add to queue" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from queue
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing ID parameter" },
        { status: 400 }
      );
    }

    await deleteEmailQueue(parseInt(id, 10));

    return NextResponse.json(
      { success: true, message: "Item deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

// PATCH - Update item status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, errorMessage, sentAt } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await updateEmailQueueStatus({
      id,
      status,
      errorMessage,
      sentAt,
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Failed to update item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}
