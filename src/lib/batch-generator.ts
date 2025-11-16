// src/lib/batch-generator.ts (Fixed to use element.maxWidth)
import JSZip from "jszip";
import { BatchRecipient, BatchProgress } from "@/types/batch";
import {
  TextElement,
  ImageElement,
  CertificateTemplate,
} from "@/types/certificates";

/**
 * Parse recipients file (JSON)
 */
export async function parseRecipientsFile(
  file: File
): Promise<BatchRecipient[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (!data.recipients || !Array.isArray(data.recipients)) {
          throw new Error(
            'Invalid JSON structure. Expected { "recipients": [...] }'
          );
        }

        const recipients = data.recipients.map(
          (recipient: any, index: number) => {
            if (!recipient.name || typeof recipient.name !== "string") {
              throw new Error(
                `Recipient at index ${index} is missing a valid "name" field`
              );
            }
            if (!recipient.email || typeof recipient.email !== "string") {
              throw new Error(
                `Recipient at index ${index} is missing a valid "email" field`
              );
            }
            // Basic email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
              throw new Error(
                `Recipient at index ${index} has an invalid email: ${recipient.email}`
              );
            }
            return {
              name: recipient.name,
              email: recipient.email,
              title: recipient.title || "",
              date: recipient.date || "",
              customFields: recipient.customFields || {},
            };
          }
        );

        resolve(recipients);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse JSON: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Replace placeholders in text with recipient data
 */
function replacePlaceholders(text: string, recipient: BatchRecipient): string {
  let result = text;

  result = result.replace(/\{\{name\}\}/gi, recipient.name);
  result = result.replace(/\{\{title\}\}/gi, recipient.title || "");
  result = result.replace(/\{\{date\}\}/gi, recipient.date || "");

  if (recipient.customFields) {
    Object.entries(recipient.customFields).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
      result = result.replace(regex, value);
    });
  }

  return result;
}

/**
 * Load an image from URL and return HTMLImageElement
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
 * FIXED: Draw text with smart centering and auto-scaling using element.maxWidth
 */
function drawSmartText(
  ctx: CanvasRenderingContext2D,
  text: string,
  element: TextElement,
  templateWidth: number
) {
  // Set font properties
  ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
  ctx.fillStyle = element.color;
  ctx.textBaseline = "top";

  // Handle multi-line text
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    const y = element.position.y + lineIndex * element.fontSize * 1.2;

    // Measure text width
    const metrics = ctx.measureText(line);
    const textWidth = metrics.width;

    // FIXED: Use element.maxWidth if specified, otherwise fallback to 80% of template width
    const maxWidth = element.maxWidth || templateWidth * 0.8;
    let x = element.position.x;

    if (element.textAlign === "center") {
      // For center alignment, position.x is the center point
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

    // Draw the text
    ctx.fillText(line, x, y);
  });
}

/**
 * Render a single certificate to canvas
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
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw template background
  ctx.drawImage(loadedImages.template, 0, 0, template.width, template.height);

  // Draw image elements
  loadedImages.elements.forEach(({ element, img }) => {
    ctx.drawImage(
      img,
      element.position.x,
      element.position.y,
      element.width,
      element.height
    );
  });

  // FIXED: Draw text elements with smart rendering using element.maxWidth
  textElements.forEach((element) => {
    const text = replacePlaceholders(element.text, recipient);
    drawSmartText(ctx, text, element, template.width);
  });
}

/**
 * Generate canvas as blob
 */
async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to blob"));
        }
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Sanitize filename (remove special characters)
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

/**
 * Main batch certificate generator class
 */
export class BatchCertificateGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context not supported");
    }
    this.ctx = ctx;
  }

  /**
   * Generate batch of certificates and auto-queue for sending
   */
  async generateBatch(
    recipients: BatchRecipient[],
    template: CertificateTemplate,
    textElements: TextElement[],
    imageElements: ImageElement[],
    onProgress?: (progress: BatchProgress) => void,
    emailSubject?: string,
    emailMessage?: string
  ): Promise<void> {
    // Set canvas size
    this.canvas.width = template.width;
    this.canvas.height = template.height;

    // Initialize progress
    const progress: BatchProgress = {
      total: recipients.length,
      current: 0,
      status: "processing",
    };

    if (onProgress) {
      onProgress(progress);
    }

    try {
      // Pre-load all images
      const templateImg = await loadImage(template.backgroundImage);
      const imageElementsLoaded = await Promise.all(
        imageElements.map(async (element) => {
          const img = await loadImage(element.src);
          return { element, img };
        })
      );

      const loadedImages = {
        template: templateImg,
        elements: imageElementsLoaded,
      };

      // Generate each certificate and queue for sending
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        // Update progress
        progress.current = i + 1;
        progress.currentName = `${recipient.name} - Adding to queue...`;
        if (onProgress) {
          onProgress({ ...progress });
        }

        // Render certificate
        await renderCertificate(
          this.canvas,
          this.ctx,
          template,
          textElements,
          imageElements,
          recipient,
          loadedImages
        );

        // Convert to base64
        const certificateImage = this.canvas.toDataURL("image/png");

        // Prepare email content with placeholders replaced
        const subject = emailSubject
          ? replacePlaceholders(emailSubject, recipient)
          : `Your Certificate - ${recipient.title || "Completion"}`;
        const message = emailMessage
          ? replacePlaceholders(emailMessage, recipient)
          : `Dear ${recipient.name},\n\nCongratulations! Please find your certificate attached.\n\nBest regards,\nYour Organization`;

        // Add to email queue
        try {
          const response = await fetch("/api/email-queue", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipientEmail: recipient.email,
              recipientName: recipient.name,
              subject: subject,
              message: message,
              certificateImage,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Failed to queue certificate for ${recipient.name}`
            );
          }
        } catch (error) {
          console.error(`Failed to queue ${recipient.name}:`, error);
          // Continue with next recipient even if one fails
        }

        // Small delay between requests to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Update progress to complete
      progress.current = recipients.length;
      progress.currentName = "All certificates queued successfully!";
      progress.status = "complete";
      if (onProgress) {
        onProgress({ ...progress });
      }

      // Show success message
      alert(
        `Successfully queued ${recipients.length} certificates for sending! Check the Email Queue to send them.`
      );
    } catch (error) {
      progress.status = "error";
      progress.error =
        error instanceof Error ? error.message : "Unknown error occurred";
      if (onProgress) {
        onProgress({ ...progress });
      }
      throw error;
    }
  }

  /**
   * Generate single certificate preview
   */
  async generatePreview(
    recipient: BatchRecipient,
    template: CertificateTemplate,
    textElements: TextElement[],
    imageElements: ImageElement[]
  ): Promise<string> {
    // Set canvas size
    this.canvas.width = template.width;
    this.canvas.height = template.height;

    // Load images
    const templateImg = await loadImage(template.backgroundImage);
    const imageElementsLoaded = await Promise.all(
      imageElements.map(async (element) => {
        const img = await loadImage(element.src);
        return { element, img };
      })
    );

    const loadedImages = {
      template: templateImg,
      elements: imageElementsLoaded,
    };

    // Render certificate
    await renderCertificate(
      this.canvas,
      this.ctx,
      template,
      textElements,
      imageElements,
      recipient,
      loadedImages
    );

    // Return data URL
    return this.canvas.toDataURL("image/png");
  }
}

/**
 * Utility: Extract unique placeholders from text elements
 */
export function extractPlaceholders(textElements: TextElement[]): string[] {
  const placeholders = new Set<string>();
  const regex = /\{\{([^}]+)\}\}/g;

  textElements.forEach((element) => {
    let match;
    while ((match = regex.exec(element.text)) !== null) {
      placeholders.add(match[1]);
    }
  });

  return Array.from(placeholders);
}

/**
 * Utility: Validate that all placeholders can be filled
 */
export function validateRecipientData(
  recipients: BatchRecipient[],
  requiredPlaceholders: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  recipients.forEach((recipient, index) => {
    requiredPlaceholders.forEach((placeholder) => {
      const value =
        placeholder === "name"
          ? recipient.name
          : placeholder === "title"
          ? recipient.title
          : placeholder === "date"
          ? recipient.date
          : recipient.customFields?.[placeholder];

      if (!value) {
        errors.push(
          `Recipient ${index + 1} (${
            recipient.name
          }) is missing field: ${placeholder}`
        );
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
