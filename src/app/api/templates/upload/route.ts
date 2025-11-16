import { NextRequest, NextResponse } from "next/server";
import { writeFile, readdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("template") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Get the public/certificates directory
    const certificatesDir = path.join(process.cwd(), "public", "certificates");

    // Ensure directory exists
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    // Find the next available template number
    const existingFiles = await readdir(certificatesDir);
    const templateNumbers = existingFiles
      .filter((file) => file.match(/^template\d+\.png$/))
      .map((file) => {
        const match = file.match(/^template(\d+)\.png$/);
        return match ? parseInt(match[1]) : 0;
      })
      .sort((a, b) => a - b);

    // Find next number
    let nextNumber = 1;
    for (const num of templateNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    // Check if we've reached the limit
    if (nextNumber > 20) {
      return NextResponse.json(
        { error: "Maximum number of templates (20) reached" },
        { status: 400 }
      );
    }

    // Create filename
    const filename = `template${nextNumber}.png`;
    const filepath = path.join(certificatesDir, filename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file
    await writeFile(filepath, buffer);

    return NextResponse.json(
      {
        success: true,
        message: "Template uploaded successfully",
        filename,
        templateNumber: nextNumber,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload template" },
      { status: 500 }
    );
  }
}
