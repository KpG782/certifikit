# AI Implementation Guide: Drag-and-Drop Certificate Bulk Generator

## 📋 Feature Overview

This guide provides a comprehensive blueprint for implementing a **Drag-and-Drop Certificate Bulk Generator** feature in any web application. This feature allows users to:

- Design certificates with a visual drag-and-drop editor
- Upload CSV/JSON files with recipient data
- Generate certificates in bulk with personalized information
- Download certificates as ZIP files or send them via email
- Support for multiple templates and customizable text/image elements
- Real-time preview with canvas rendering

## 🎯 Core Capabilities

### 1. Visual Certificate Designer
- Drag-and-drop text elements
- Drag-and-drop image elements (logos, signatures)
- Live canvas preview
- Template selection
- Font, color, size, and alignment controls
- Multi-line text support with word wrapping

### 2. Bulk Generation System
- CSV and JSON file upload
- Batch processing with progress tracking
- Personalized text replacement ({{name}}, {{email}}, {{date}}, etc.)
- Generate hundreds of certificates in one go
- Smart text scaling and centering

### 3. Distribution Methods
- Download all certificates as ZIP
- Queue certificates for email delivery
- Individual certificate download
- Email customization with templates

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Generator  │  │    Canvas    │  │  Batch Generator │ │
│  │     Page     │──│   Component  │──│    Component     │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
│         │                  │                   │           │
│         │                  │                   │           │
│  ┌──────▼──────────────────▼───────────────────▼────────┐  │
│  │          Batch Generation Library                    │  │
│  │  (Canvas Rendering, Image Processing, ZIP Creation) │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ API Calls
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Backend (Next.js API Routes)             │
├─────────────────────────────────────────────────────────────┤
│  /api/batch-send        │  Email batch processing          │
│  /api/email-queue       │  Queue management                │
│  /api/send-certificate  │  Single certificate sending      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "next": "^16.0.0",
    "framer-motion": "^12.0.0",
    "jszip": "^3.10.1",
    "lucide-react": "^0.548.0",
    "file-saver": "^2.0.5",
    "html2canvas": "^1.4.1",
    "papaparse": "^5.5.3"
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7",
    "typescript": "^5.0.0"
  }
}
```

---

## 📁 File Structure

Create the following directory structure in your project:

```
src/
├── app/
│   └── generator/
│       └── page.tsx                    # Main generator page
├── components/
│   └── certificate/
│       ├── canvas.tsx                  # Canvas component for live preview
│       ├── batch-generator.tsx         # Bulk generation UI
│       ├── text-controls.tsx           # Text styling controls
│       ├── image-controls.tsx          # Image manipulation controls
│       ├── template-selector.tsx       # Template picker
│       ├── download-button.tsx         # Download handler
│       └── email-dialog.tsx            # Email configuration
├── lib/
│   └── batch-generator.ts              # Core batch generation logic
├── types/
│   ├── certificates.ts                 # Type definitions for certificates
│   └── batch.ts                        # Type definitions for batch processing
└── public/
    └── certificates/
        ├── template1.png               # Certificate templates
        ├── template2.png
        └── ...
```

---

## 🔧 Implementation Steps

### Step 1: Create Type Definitions

#### File: `src/types/certificates.ts`

```typescript
export interface Position {
  x: number;
  y: number;
}

export interface TextElement {
  id: string;
  text: string;
  position: Position;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  maxWidth?: number;          // Bounding box width
  showBoundingBox?: boolean;  // Visual guide in editor
}

export interface ImageElement {
  id: string;
  src: string;
  position: Position;
  width: number;
  height: number;
  type: "signature" | "logo" | "custom";
}

export interface CertificateTemplate {
  id: string;
  name: string;
  backgroundImage: string;
  width: number;
  height: number;
}

export interface Certificate {
  id: string;
  template: CertificateTemplate;
  textElements: TextElement[];
  imageElements: ImageElement[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### File: `src/types/batch.ts`

```typescript
export interface BatchRecipient {
  name: string;
  email: string;
  title?: string;
  date?: string;
  customFields?: Record<string, string>;
}

export interface BatchProgress {
  total: number;
  current: number;
  status: "idle" | "processing" | "complete" | "error";
  currentName?: string;
  error?: string;
}

export const BATCH_JSON_EXAMPLE = {
  recipients: [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      title: "JavaScript Developer",
      date: "January 28, 2026"
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      title: "React Developer",
      date: "January 28, 2026"
    }
  ]
};

export const BATCH_CSV_EXAMPLE = `name,email,title,date
John Doe,john.doe@example.com,JavaScript Developer,January 28 2026
Jane Smith,jane.smith@example.com,React Developer,January 28 2026`;
```

---

### Step 2: Create Batch Generation Library

#### File: `src/lib/batch-generator.ts`

```typescript
import JSZip from "jszip";
import { BatchRecipient, BatchProgress } from "@/types/batch";
import { TextElement, ImageElement, CertificateTemplate } from "@/types/certificates";

/**
 * Parse recipients file (JSON format)
 */
export async function parseRecipientsFile(file: File): Promise<BatchRecipient[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (!data.recipients || !Array.isArray(data.recipients)) {
          throw new Error('Invalid JSON structure. Expected { "recipients": [...] }');
        }

        const recipients = data.recipients.map((recipient: any, index: number) => {
          if (!recipient.name || typeof recipient.name !== "string") {
            throw new Error(`Recipient at index ${index} is missing a valid "name" field`);
          }
          if (!recipient.email || typeof recipient.email !== "string") {
            throw new Error(`Recipient at index ${index} is missing a valid "email" field`);
          }
          // Basic email validation
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
            throw new Error(`Recipient at index ${index} has an invalid email: ${recipient.email}`);
          }
          return {
            name: recipient.name,
            email: recipient.email,
            title: recipient.title || "",
            date: recipient.date || "",
            customFields: recipient.customFields || {},
          };
        });

        resolve(recipients);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Parse CSV file
 */
export function parseCSV(text: string): BatchRecipient[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIndex = headers.indexOf("name");
  const emailIndex = headers.indexOf("email");
  const titleIndex = headers.indexOf("title");
  const dateIndex = headers.indexOf("date");

  if (nameIndex === -1) throw new Error('CSV must have a "name" column');
  if (emailIndex === -1) throw new Error('CSV must have an "email" column');

  // Parse data rows
  const recipients: BatchRecipient[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const name = values[nameIndex];
    const email = values[emailIndex];

    if (!name || !email) {
      throw new Error(`Row ${i + 1}: Missing name or email`);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(`Row ${i + 1}: Invalid email format: ${email}`);
    }

    recipients.push({
      name,
      email,
      title: titleIndex !== -1 ? values[titleIndex] : "",
      date: dateIndex !== -1 ? values[dateIndex] : "",
      customFields: {},
    });
  }

  return recipients;
}

/**
 * Replace placeholders in text with recipient data
 */
function replacePlaceholders(text: string, recipient: BatchRecipient): string {
  let result = text;
  result = result.replace(/\{\{name\}\}/gi, recipient.name);
  result = result.replace(/\{\{title\}\}/gi, recipient.title || "");
  result = result.replace(/\{\{date\}\}/gi, recipient.date || "");
  result = result.replace(/\{\{email\}\}/gi, recipient.email);

  if (recipient.customFields) {
    Object.entries(recipient.customFields).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
      result = result.replace(regex, value);
    });
  }

  return result;
}

/**
 * Load an image from URL
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Draw text with smart centering and auto-scaling
 */
function drawSmartText(
  ctx: CanvasRenderingContext2D,
  text: string,
  element: TextElement,
  templateWidth: number
) {
  ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
  ctx.fillStyle = element.color;
  ctx.textBaseline = "top";

  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    const y = element.position.y + lineIndex * element.fontSize * 1.2;
    const metrics = ctx.measureText(line);
    const textWidth = metrics.width;
    const maxWidth = element.maxWidth || templateWidth * 0.8;
    let x = element.position.x;

    if (element.textAlign === "center") {
      ctx.textAlign = "center";
      // Auto-scale if text exceeds maxWidth
      if (textWidth > maxWidth) {
        ctx.save();
        const scale = maxWidth / textWidth;
        ctx.translate(x, y);
        ctx.scale(scale, 1);
        ctx.fillText(line, 0, 0);
        ctx.restore();
        return;
      }
    } else if (element.textAlign === "left") {
      ctx.textAlign = "left";
    } else if (element.textAlign === "right") {
      ctx.textAlign = "right";
    }

    ctx.fillText(line, x, y);
  });
}

/**
 * Render a single certificate
 */
async function renderCertificate(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  template: CertificateTemplate,
  textElements: TextElement[],
  imageElements: ImageElement[],
  recipient: BatchRecipient,
  loadedImages: {
    template: HTMLImageElement;
    elements: Array<{ element: ImageElement; img: HTMLImageElement }>;
  }
): Promise<void> {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw template background
  ctx.drawImage(loadedImages.template, 0, 0, template.width, template.height);

  // Draw image elements
  loadedImages.elements.forEach(({ element, img }) => {
    ctx.drawImage(img, element.position.x, element.position.y, element.width, element.height);
  });

  // Draw text elements
  textElements.forEach((element) => {
    const text = replacePlaceholders(element.text, recipient);
    drawSmartText(ctx, text, element, template.width);
  });
}

/**
 * Main Batch Certificate Generator Class
 */
export class BatchCertificateGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    this.ctx = ctx;
  }

  /**
   * Generate batch certificates and add to email queue
   */
  async generateBatch(
    recipients: BatchRecipient[],
    template: CertificateTemplate,
    textElements: TextElement[],
    imageElements: ImageElement[],
    onProgress: (progress: BatchProgress) => void,
    emailSubject: string,
    emailMessage: string
  ): Promise<void> {
    this.canvas.width = template.width;
    this.canvas.height = template.height;

    onProgress({
      total: recipients.length,
      current: 0,
      status: "processing",
      currentName: "Loading images...",
    });

    // Pre-load all images
    const loadedImages = {
      template: await loadImage(template.backgroundImage),
      elements: await Promise.all(
        imageElements.map(async (element) => ({
          element,
          img: await loadImage(element.src),
        }))
      ),
    };

    // Generate each certificate
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      onProgress({
        total: recipients.length,
        current: i + 1,
        status: "processing",
        currentName: recipient.name,
      });

      await renderCertificate(
        this.canvas,
        this.ctx,
        template,
        textElements,
        imageElements,
        recipient,
        loadedImages
      );

      // Convert to data URL
      const dataUrl = this.canvas.toDataURL("image/png");

      // Prepare email with personalized subject and message
      const personalizedSubject = replacePlaceholders(emailSubject, recipient);
      const personalizedMessage = replacePlaceholders(emailMessage, recipient);

      // Add to queue via API
      try {
        const response = await fetch("/api/email-queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            subject: personalizedSubject,
            message: personalizedMessage,
            certificateImage: dataUrl,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to add ${recipient.name} to queue`);
        }
      } catch (error) {
        console.error(`Error queuing ${recipient.name}:`, error);
        throw error;
      }
    }

    onProgress({
      total: recipients.length,
      current: recipients.length,
      status: "complete",
    });
  }

  /**
   * Generate and download all certificates as ZIP
   */
  async downloadBatch(
    recipients: BatchRecipient[],
    template: CertificateTemplate,
    textElements: TextElement[],
    imageElements: ImageElement[],
    onProgress: (progress: BatchProgress) => void
  ): Promise<void> {
    this.canvas.width = template.width;
    this.canvas.height = template.height;

    const zip = new JSZip();
    const folder = zip.folder("certificates");

    onProgress({
      total: recipients.length,
      current: 0,
      status: "processing",
      currentName: "Loading images...",
    });

    // Pre-load all images
    const loadedImages = {
      template: await loadImage(template.backgroundImage),
      elements: await Promise.all(
        imageElements.map(async (element) => ({
          element,
          img: await loadImage(element.src),
        }))
      ),
    };

    // Generate each certificate
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      onProgress({
        total: recipients.length,
        current: i + 1,
        status: "processing",
        currentName: recipient.name,
      });

      await renderCertificate(
        this.canvas,
        this.ctx,
        template,
        textElements,
        imageElements,
        recipient,
        loadedImages
      );

      // Convert to blob and add to ZIP
      const blob = await new Promise<Blob>((resolve) => {
        this.canvas.toBlob((blob) => resolve(blob!), "image/png");
      });

      const fileName = `${recipient.name.replace(/[^a-z0-9]/gi, "_")}.png`;
      folder?.file(fileName, blob);
    }

    onProgress({
      total: recipients.length,
      current: recipients.length,
      status: "processing",
      currentName: "Creating ZIP file...",
    });

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificates_${new Date().toISOString().split("T")[0]}.zip`;
    link.click();
    URL.revokeObjectURL(url);

    onProgress({
      total: recipients.length,
      current: recipients.length,
      status: "complete",
    });
  }
}
```

---

### Step 3: Create Batch Generator Component

#### File: `src/components/certificate/batch-generator.tsx`

```typescript
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload, Download, FileJson, AlertCircle, CheckCircle2,
  Loader2, Mail, X, FileSpreadsheet
} from "lucide-react";
import {
  BatchRecipient,
  BatchProgress,
  BATCH_JSON_EXAMPLE,
  BATCH_CSV_EXAMPLE,
} from "@/types/batch";
import {
  BatchCertificateGenerator,
  parseRecipientsFile,
  parseCSV,
} from "@/lib/batch-generator";
import {
  TextElement,
  ImageElement,
  CertificateTemplate,
} from "@/types/certificates";

interface BatchGeneratorProps {
  template: CertificateTemplate | null;
  textElements: TextElement[];
  imageElements: ImageElement[];
}

export default function BatchGenerator({
  template,
  textElements,
  imageElements,
}: BatchGeneratorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recipients, setRecipients] = useState<BatchRecipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState<BatchProgress>({
    total: 0,
    current: 0,
    status: "idle",
  });
  const [error, setError] = useState<string | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState("Your Certificate of Completion");
  const [emailMessage, setEmailMessage] = useState(
    `Dear {{name}},\n\nCongratulations! Please find your Certificate of Completion attached.\n\nBest regards,\nYour Organization`
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      let parsedRecipients: BatchRecipient[];

      if (file.name.endsWith(".csv")) {
        const text = await file.text();
        parsedRecipients = parseCSV(text);
      } else if (file.name.endsWith(".json")) {
        parsedRecipients = await parseRecipientsFile(file);
      } else {
        throw new Error("Unsupported file format. Please upload a JSON or CSV file.");
      }

      setRecipients(parsedRecipients);
      setSelectedRecipients(new Set(parsedRecipients.map((_, idx) => idx)));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setRecipients([]);
      setSelectedRecipients(new Set());
    }
  };

  const handleGenerateAndQueue = async () => {
    if (!template || selectedRecipients.size === 0) return;

    setError(null);
    setShowEmailDialog(false);
    const generator = new BatchCertificateGenerator();

    const recipientsToQueue = recipients.filter((_, idx) =>
      selectedRecipients.has(idx)
    );

    try {
      await generator.generateBatch(
        recipientsToQueue,
        template,
        textElements,
        imageElements,
        setProgress,
        emailSubject,
        emailMessage
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate certificates");
      setProgress((prev) => ({ ...prev, status: "error" }));
    }
  };

  const handleDownloadAll = async () => {
    if (!template || selectedRecipients.size === 0) return;

    setError(null);
    const generator = new BatchCertificateGenerator();

    const recipientsToDownload = recipients.filter((_, idx) =>
      selectedRecipients.has(idx)
    );

    try {
      await generator.downloadBatch(
        recipientsToDownload,
        template,
        textElements,
        imageElements,
        setProgress
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download certificates");
      setProgress((prev) => ({ ...prev, status: "error" }));
    }
  };

  const toggleRecipient = (index: number) => {
    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRecipients(newSelected);
  };

  const selectAll = () => {
    setSelectedRecipients(new Set(recipients.map((_, idx) => idx)));
  };

  const deselectAll = () => {
    setSelectedRecipients(new Set());
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Upload Recipients</h3>
        <p className="text-sm text-gray-600 mb-4">
          Supports JSON and CSV files
        </p>
        <Button onClick={() => fileInputRef.current?.click()}>
          <FileJson className="w-4 h-4 mr-2" />
          Choose File
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Recipients List */}
      {recipients.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Recipients ({selectedRecipients.size} of {recipients.length} selected)
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b sticky top-0">
                  <tr>
                    <th className="w-12 p-3"></th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Title</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((recipient, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.has(index)}
                          onChange={() => toggleRecipient(index)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="p-3">{recipient.name}</td>
                      <td className="p-3 text-sm text-gray-600">{recipient.email}</td>
                      <td className="p-3 text-sm text-gray-600">{recipient.title || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowEmailDialog(true)}
              disabled={!template || selectedRecipients.size === 0}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Generate & Queue for Email ({selectedRecipients.size})
            </Button>
            <Button
              onClick={handleDownloadAll}
              disabled={!template || selectedRecipients.size === 0}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download as ZIP ({selectedRecipients.size})
            </Button>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {progress.status === "processing" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="font-medium">
              Processing: {progress.current} / {progress.total}
            </span>
          </div>
          {progress.currentName && (
            <p className="text-sm text-gray-600">
              Current: {progress.currentName}
            </p>
          )}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Display */}
      {progress.status === "complete" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-800">
            Successfully processed {progress.total} certificates!
          </span>
        </div>
      )}

      {/* Email Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Email Configuration</h3>
              <button onClick={() => setShowEmailDialog(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={6}
                  placeholder="Email message (use {{name}}, {{title}}, etc.)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use placeholders: {`{{name}}, {{title}}, {{date}}, {{email}}`}
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleGenerateAndQueue} className="flex-1">
                  Generate & Queue
                </Button>
                <Button
                  onClick={() => setShowEmailDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Format Examples */}
      <div className="text-xs text-gray-500 space-y-2">
        <p className="font-medium">Example JSON format:</p>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
          {JSON.stringify(BATCH_JSON_EXAMPLE, null, 2)}
        </pre>
        <p className="font-medium mt-4">Example CSV format:</p>
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
          {BATCH_CSV_EXAMPLE}
        </pre>
      </div>
    </div>
  );
}
```

---

### Step 4: Create Canvas Component

#### File: `src/components/certificate/canvas.tsx`

This component handles the visual drag-and-drop editor for certificate design.

```typescript
"use client";

import { useRef, useState, useEffect } from "react";
import {
  CertificateTemplate,
  TextElement,
  ImageElement,
} from "@/types/certificates";

interface CertificateCanvasProps {
  template: CertificateTemplate;
  textElements: TextElement[];
  imageElements: ImageElement[];
  selectedElement: string | null;
  onSelectElement: (id: string, type: "text" | "image") => void;
  onUpdateTextElement: (id: string, updates: Partial<TextElement>) => void;
  onUpdateImageElement: (id: string, updates: Partial<ImageElement>) => void;
}

// Draggable Element Component
function DraggableElement({
  id,
  position,
  onDrag,
  onSelect,
  isSelected,
  children,
}: {
  id: string;
  position: { x: number; y: number };
  onDrag: (x: number, y: number) => void;
  onSelect: () => void;
  isSelected: boolean;
  children: React.ReactNode;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    onSelect();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        onDrag(Math.max(0, newX), Math.max(0, newY));
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, onDrag]);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        border: isSelected ? "2px solid #3b82f6" : "2px solid transparent",
        padding: "4px",
      }}
    >
      {children}
    </div>
  );
}

export default function CertificateCanvas({
  template,
  textElements,
  imageElements,
  selectedElement,
  onSelectElement,
  onUpdateTextElement,
  onUpdateImageElement,
}: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Update canvas when elements change
  useEffect(() => {
    renderCanvas();
  }, [template, textElements, imageElements]);

  // Calculate scale to fit container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const scaleToFit = containerWidth / template.width;
      setScale(Math.min(scaleToFit, 1));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [template.width]);

  const renderCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = template.width;
    canvas.height = template.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, template.width, template.height);

      // Draw image elements
      imageElements.forEach((element) => {
        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";
        imgEl.src = element.src;
        imgEl.onload = () => {
          ctx.drawImage(
            imgEl,
            element.position.x,
            element.position.y,
            element.width,
            element.height
          );
        };
      });

      // Draw text elements
      textElements.forEach((element) => {
        ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = element.textAlign;
        ctx.textBaseline = "top";
        ctx.fillText(element.text, element.position.x, element.position.y);
      });
    };
    img.src = template.backgroundImage;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className="relative mx-auto"
        style={{
          width: template.width * scale,
          height: template.height * scale,
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />

        {/* Draggable overlay */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Text elements */}
          {textElements.map((element) => (
            <DraggableElement
              key={element.id}
              id={element.id}
              position={element.position}
              isSelected={selectedElement === element.id}
              onSelect={() => onSelectElement(element.id, "text")}
              onDrag={(x, y) =>
                onUpdateTextElement(element.id, { position: { x, y } })
              }
            >
              <span
                style={{
                  fontFamily: element.fontFamily,
                  fontSize: element.fontSize,
                  color: element.color,
                  fontWeight: element.fontWeight,
                  fontStyle: element.fontStyle,
                  whiteSpace: "nowrap",
                }}
              >
                {element.text || "Text"}
              </span>
            </DraggableElement>
          ))}

          {/* Image elements */}
          {imageElements.map((element) => (
            <DraggableElement
              key={element.id}
              id={element.id}
              position={element.position}
              isSelected={selectedElement === element.id}
              onSelect={() => onSelectElement(element.id, "image")}
              onDrag={(x, y) =>
                onUpdateImageElement(element.id, { position: { x, y } })
              }
            >
              <img
                src={element.src}
                alt="Element"
                style={{
                  width: element.width,
                  height: element.height,
                  pointerEvents: "none",
                }}
              />
            </DraggableElement>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### Step 5: Create Main Generator Page

#### File: `src/app/generator/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CertificateCanvas from "@/components/certificate/canvas";
import BatchGenerator from "@/components/certificate/batch-generator";
import {
  TextElement,
  ImageElement,
  CertificateTemplate,
} from "@/types/certificates";
import { Plus, Upload } from "lucide-react";

const CERTIFICATE_WIDTH = 1200;
const CERTIFICATE_HEIGHT = 850;

export default function GeneratorPage() {
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<"text" | "image" | null>(null);
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");

  // Initialize with default template
  useState(() => {
    setTemplate({
      id: "template-1",
      name: "Template 1",
      backgroundImage: "/certificates/template1.png",
      width: CERTIFICATE_WIDTH,
      height: CERTIFICATE_HEIGHT,
    });
  });

  const addTextElement = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: "{{name}}",
      position: { x: CERTIFICATE_WIDTH / 2, y: CERTIFICATE_HEIGHT / 2 },
      fontSize: 48,
      fontFamily: "Georgia",
      color: "#000000",
      fontWeight: "bold",
      fontStyle: "normal",
      textAlign: "center",
      maxWidth: 800,
    };
    setTextElements([...textElements, newElement]);
    setSelectedElement(newElement.id);
    setSelectedElementType("text");
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(
      textElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const updateImageElement = (id: string, updates: Partial<ImageElement>) => {
    setImageElements(
      imageElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Certificate Generator</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab("single")}
            variant={activeTab === "single" ? "default" : "outline"}
          >
            Single Certificate
          </Button>
          <Button
            onClick={() => setActiveTab("batch")}
            variant={activeTab === "batch" ? "default" : "outline"}
          >
            Bulk Generator
          </Button>
        </div>

        {activeTab === "single" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas */}
            <div className="lg:col-span-2">
              {template && (
                <CertificateCanvas
                  template={template}
                  textElements={textElements}
                  imageElements={imageElements}
                  selectedElement={selectedElement}
                  onSelectElement={(id, type) => {
                    setSelectedElement(id);
                    setSelectedElementType(type);
                  }}
                  onUpdateTextElement={updateTextElement}
                  onUpdateImageElement={updateImageElement}
                />
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <Button onClick={addTextElement} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Text Element
              </Button>
              
              {selectedElement && selectedElementType === "text" && (
                <div className="p-4 border rounded-lg bg-white">
                  <h3 className="font-semibold mb-4">Text Controls</h3>
                  {/* Add text controls here */}
                </div>
              )}
            </div>
          </div>
        ) : (
          <BatchGenerator
            template={template}
            textElements={textElements}
            imageElements={imageElements}
          />
        )}
      </div>
    </div>
  );
}
```

---

### Step 6: Create API Routes (Optional - for Email Queue)

#### File: `src/app/api/email-queue/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

// This is a simple in-memory queue for demonstration
// In production, use a database like PostgreSQL or MongoDB
const emailQueue: Array<{
  id: number;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  certificateImage: string;
  status: string;
  createdAt: Date;
}> = [];

let nextId = 1;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const queueItem = {
      id: nextId++,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      subject: data.subject,
      message: data.message,
      certificateImage: data.certificateImage,
      status: "queued",
      createdAt: new Date(),
    };

    emailQueue.push(queueItem);

    return NextResponse.json({
      success: true,
      id: queueItem.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add to queue" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ items: emailQueue });
}
```

---

## 🎨 UI Components Needed

Create basic UI components if you don't have them:

### Button Component (`src/components/ui/button.tsx`)

```typescript
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    const baseStyles = "rounded-lg font-medium transition-colors";
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border-2 border-gray-300 hover:bg-gray-50",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
```

### Input Component (`src/components/ui/input.tsx`)

```typescript
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return (
    <input
      ref={ref}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  );
});
```

### Textarea Component (`src/components/ui/textarea.tsx`)

```typescript
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => {
  return (
    <textarea
      ref={ref}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  );
});
```

---

## 🚀 Testing & Usage

### 1. Prepare Test Data

Create a test CSV file (`recipients.csv`):
```csv
name,email,title,date
John Doe,john@example.com,JavaScript Developer,January 28 2026
Jane Smith,jane@example.com,React Developer,January 28 2026
Bob Johnson,bob@example.com,Frontend Engineer,January 28 2026
```

Or JSON file (`recipients.json`):
```json
{
  "recipients": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "title": "JavaScript Developer",
      "date": "January 28, 2026"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "title": "React Developer",
      "date": "January 28, 2026"
    }
  ]
}
```

### 2. Add Certificate Templates

Place PNG/JPG certificate templates in `/public/certificates/` directory:
- `template1.png`
- `template2.png`
- etc.

### 3. Run the Application

```bash
npm install
npm run dev
```

Navigate to `/generator` route.

### 4. Using the Feature

1. **Design Certificate**: Add text elements with placeholders like `{{name}}`, `{{title}}`
2. **Switch to Bulk Tab**: Click "Bulk Generator"
3. **Upload Recipients**: Upload CSV or JSON file
4. **Select Recipients**: Choose which recipients to process
5. **Generate**: 
   - Click "Generate & Queue for Email" to add to email queue
   - Click "Download as ZIP" to download all certificates at once

---

## 🔒 Security Considerations

1. **File Upload Validation**:
   - Limit file size (e.g., 5MB max)
   - Validate file types (only `.json` and `.csv`)
   - Sanitize recipient data

2. **Rate Limiting**:
   - Limit batch size (e.g., max 100 recipients per batch)
   - Implement API rate limiting

3. **Email Validation**:
   - Validate email format
   - Check for duplicate emails

4. **Data Storage**:
   - Don't store certificate images permanently unless needed
   - Use temporary storage or cloud storage
   - Implement data retention policies

---

## 🎯 Advanced Features to Add

### 1. **Template Library**
- Allow users to upload custom templates
- Template preview gallery
- Save favorite templates

### 2. **Email Service Integration**
- SendGrid integration
- Resend.com integration
- AWS SES integration
- Mailgun integration

### 3. **Queue Management**
- View email queue status
- Retry failed sends
- Scheduled sending

### 4. **Analytics**
- Track certificate generation
- Email open rates
- Download statistics

### 5. **Collaboration**
- Multi-user support
- Team templates
- Role-based permissions

### 6. **Export Options**
- PDF export (using jsPDF)
- High-resolution PNG
- SVG export

---

## 📊 Performance Optimization

1. **Canvas Reuse**: Reuse canvas element instead of creating new ones
2. **Image Caching**: Pre-load and cache template images
3. **Web Workers**: Use web workers for heavy batch processing
4. **Progressive Loading**: Show progress bar during generation
5. **Compression**: Compress images before adding to ZIP

---

## 🐛 Common Issues & Solutions

### Issue 1: Images not loading in canvas
**Solution**: Ensure `crossOrigin = "anonymous"` is set on all images

### Issue 2: Text not centering correctly
**Solution**: Use `ctx.textAlign = "center"` and set position.x to the center point

### Issue 3: ZIP file too large
**Solution**: Compress images before adding to ZIP, reduce image quality

### Issue 4: Slow batch processing
**Solution**: Use requestAnimationFrame for canvas rendering, implement web workers

### Issue 5: Memory issues with large batches
**Solution**: Process in smaller chunks, clear canvas between renders

---

## 📝 API Reference

### `BatchCertificateGenerator.generateBatch()`

Generates certificates and adds them to email queue.

**Parameters:**
- `recipients: BatchRecipient[]` - Array of recipients
- `template: CertificateTemplate` - Certificate template
- `textElements: TextElement[]` - Text elements to render
- `imageElements: ImageElement[]` - Image elements to render
- `onProgress: (progress: BatchProgress) => void` - Progress callback
- `emailSubject: string` - Email subject template
- `emailMessage: string` - Email message template

**Returns:** `Promise<void>`

### `BatchCertificateGenerator.downloadBatch()`

Generates certificates and downloads as ZIP file.

**Parameters:** Same as `generateBatch()` except no email parameters

**Returns:** `Promise<void>`

---

## 🎓 Learning Resources

- **Canvas API**: [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- **JSZip**: [JSZip Documentation](https://stuk.github.io/jszip/)
- **File API**: [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- **React DnD**: [React DnD Documentation](https://react-dnd.github.io/react-dnd/)

---

## ✅ Implementation Checklist

Use this checklist to track implementation progress:

- [ ] Install required dependencies
- [ ] Create type definitions
- [ ] Implement batch-generator library
- [ ] Create BatchGenerator component
- [ ] Create CertificateCanvas component
- [ ] Create main generator page
- [ ] Add certificate templates
- [ ] Implement email queue API (optional)
- [ ] Add UI components (Button, Input, Textarea)
- [ ] Test with sample CSV/JSON files
- [ ] Implement error handling
- [ ] Add progress indicators
- [ ] Test bulk generation
- [ ] Test ZIP download
- [ ] Test email queueing
- [ ] Optimize performance
- [ ] Add security measures
- [ ] Write user documentation

---

## 🤝 Support & Contribution

This guide is designed to be AI-friendly and comprehensive. When implementing:

1. Follow the file structure exactly
2. Copy code snippets as-is initially
3. Customize to your specific needs
4. Test thoroughly with real data
5. Add error handling for edge cases

For issues or improvements, update this document to help future implementations.

---

**Last Updated**: January 28, 2026
**Version**: 1.0.0
**Compatibility**: Next.js 16+, React 19+

---

## 📎 Quick Start Summary

1. **Install dependencies**: `npm install jszip file-saver html2canvas`
2. **Create file structure**: Follow directory layout above
3. **Copy core files**: Implement types, batch-generator.ts, components
4. **Add templates**: Place certificate images in `/public/certificates/`
5. **Test**: Upload CSV/JSON and generate certificates
6. **Customize**: Modify styles, add features, integrate email service

That's it! You now have a fully functional bulk certificate generator. 🎉
