import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import fs from "fs";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Validate filename format (must be templateX.png)
    if (!filename.match(/^template\d+\.png$/)) {
      return NextResponse.json(
        { error: "Invalid filename format" },
        { status: 400 }
      );
    }

    // Get the file path
    const filepath = path.join(
      process.cwd(),
      "public",
      "certificates",
      filename
    );

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Delete the file
    await unlink(filepath);

    return NextResponse.json(
      {
        success: true,
        message: "Template deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
