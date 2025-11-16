"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SendCertificateButton from "./send-certificate-button";
import AddToQueueDialog from "./add-to-queue-dialog";
import { Plus } from "lucide-react";
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
  const displayRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isQueueDialogOpen, setIsQueueDialogOpen] = useState(false);
  const [queueCertImage, setQueueCertImage] = useState<string>("");

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32;
        const scaleToFit = containerWidth / template.width;
        setScale(Math.min(scaleToFit, 1));
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [template.width]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // ADD THIS NEW FUNCTION - Generates certificate and returns base64
  const generateCertificateImage = async (): Promise<string> => {
    if (!canvasRef.current) {
      throw new Error("Canvas not ready");
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get canvas context");

    canvas.width = template.width;
    canvas.height = template.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const templateImg = await loadImage(template.backgroundImage);
    ctx.drawImage(templateImg, 0, 0, template.width, template.height);

    // Draw images
    for (const element of imageElements) {
      const img = await loadImage(element.src);
      ctx.drawImage(
        img,
        element.position.x,
        element.position.y,
        element.width,
        element.height
      );
    }

    // Draw text
    textElements.forEach((element) => {
      ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
      ctx.fillStyle = element.color;
      ctx.textBaseline = "top";

      const lines = element.text.split("\n");

      lines.forEach((line, index) => {
        const y = element.position.y + index * element.fontSize * 1.2;
        const metrics = ctx.measureText(line);
        const textWidth = metrics.width;

        const maxWidth = element.maxWidth || template.width * 0.8;
        let x = element.position.x;

        if (element.textAlign === "center") {
          ctx.textAlign = "center";

          if (textWidth > maxWidth) {
            ctx.save();
            const scale = maxWidth / textWidth;
            ctx.translate(x, y);
            ctx.scale(scale, 1);
            ctx.fillText(line, 0, 0);
            ctx.restore();
          } else {
            ctx.fillText(line, x, y);
          }
        } else if (element.textAlign === "left") {
          ctx.textAlign = "left";
          ctx.fillText(line, x, y);
        } else if (element.textAlign === "right") {
          ctx.textAlign = "right";
          ctx.fillText(line, x, y);
        }
      });
    });

    // Return as base64
    return canvas.toDataURL("image/png");
  };

  // UPDATE: handleDownload to use the new function
  const handleDownload = async () => {
    if (!canvasRef.current) {
      alert("Canvas not ready");
      return;
    }

    setIsDownloading(true);

    try {
      const base64Image = await generateCertificateImage();

      // Convert base64 to blob
      const byteString = atob(base64Image.split(",")[1]);
      const mimeString = base64Image.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `certificate-${Date.now()}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Download error:", error);
      alert(
        `Failed to download: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // ADD THIS: Get recipient name from text elements
  const recipientName =
    textElements.find((el) => el.text.trim())?.text || "Recipient";

  // ADD THIS FUNCTION - Handle Add to Queue
  const handleAddToQueue = async () => {
    try {
      const imageData = await generateCertificateImage();
      setQueueCertImage(imageData);
      setIsQueueDialogOpen(true);
    } catch (error) {
      console.error("Failed to generate certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* UPDATE THIS SECTION - Add both buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Canvas</h2>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            onClick={handleAddToQueue}
            disabled={isDownloading}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 hover:shadow-md transition-all dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:border-green-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Queue
          </Button>

          <SendCertificateButton
            onGenerateCertificate={generateCertificateImage}
            recipientName={recipientName}
            disabled={isDownloading}
          />
          <Button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="bg-primary hover:bg-primary/90 hover:shadow-md transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isDownloading ? "Generating..." : "Download Certificate"}
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={template.width}
        height={template.height}
      />

      <div
        ref={containerRef}
        style={{
          minHeight: "500px",
          backgroundColor: "#f3f4f6",
          borderRadius: "0.5rem",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          ref={displayRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onSelectElement("", "text");
            }
          }}
          style={{
            position: "relative",
            width: `${template.width}px`,
            height: `${template.height}px`,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            backgroundColor: "#ffffff",
            backgroundImage: template.backgroundImage
              ? `url(${template.backgroundImage})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {textElements.map((element) => {
            const isSelected = selectedElement === element.id;
            const maxWidth = element.maxWidth || template.width * 0.8;
            const showBox =
              element.textAlign === "center" &&
              (isSelected || element.showBoundingBox);

            return (
              <div key={element.id}>
                {/* GUIDE BOX - Blue Dashed Rectangle (Text Area Boundary) */}
                {showBox && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${element.position.x}px`,
                      top: `${element.position.y - 4}px`,
                      width: `${maxWidth}px`,
                      height: `${element.fontSize * 1.4}px`,
                      border: "2px dashed #93c5fd",
                      backgroundColor: "rgba(147, 197, 253, 0.1)",
                      borderRadius: "4px",
                      pointerEvents: "none",
                      zIndex: 1,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "10px",
                        color: "#3b82f6",
                        backgroundColor: "white",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        border: "1px solid #93c5fd",
                        whiteSpace: "nowrap",
                      }}
                    >
                      📏 Text Area: {maxWidth}px
                    </div>
                  </div>
                )}

                {/* SELECTION INDICATOR - ONLY for left/right aligned text */}
                {isSelected && element.textAlign !== "center" && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${element.position.x - 4}px`,
                      top: `${element.position.y - 6}px`,
                      padding: "4px 8px",
                      backgroundColor: "rgba(59, 130, 246, 0.15)",
                      borderRadius: "4px",
                      border: "2px solid #3b82f6",
                      pointerEvents: "none",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-22px",
                        left: "0",
                        fontSize: "10px",
                        color: "white",
                        backgroundColor: "#3b82f6",
                        padding: "2px 8px",
                        borderRadius: "3px",
                        whiteSpace: "nowrap",
                        fontWeight: "bold",
                      }}
                    >
                      ✏️ Selected - Drag to Move
                    </div>
                  </div>
                )}

                {/* CENTER POINT - Blue Vertical Line (ONLY when center-aligned) */}
                {isSelected && element.textAlign === "center" && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${element.position.x - 1}px`,
                      top: `${element.position.y - 8}px`,
                      width: "2px",
                      height: `${element.fontSize * 1.4 + 16}px`,
                      backgroundColor: "#3b82f6",
                      pointerEvents: "none",
                      zIndex: 3,
                      boxShadow: "0 0 4px rgba(59, 130, 246, 0.5)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "10px",
                        color: "white",
                        backgroundColor: "#3b82f6",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ⬆️ Center
                    </div>
                  </div>
                )}

                {/* ACTUAL TEXT ELEMENT */}
                <DraggableElement
                  id={element.id}
                  position={element.position}
                  onDrag={(x, y) =>
                    onUpdateTextElement(element.id, { position: { x, y } })
                  }
                  onSelect={() => onSelectElement(element.id, "text")}
                  isSelected={isSelected}
                >
                  <div
                    style={{
                      fontSize: `${element.fontSize}px`,
                      fontFamily: element.fontFamily,
                      color: element.color,
                      fontWeight: element.fontWeight,
                      fontStyle: element.fontStyle,
                      textAlign: element.textAlign,
                      userSelect: "none",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.2",
                      position: "relative",
                      zIndex: 4,
                      ...(element.textAlign === "center" && {
                        transform: "translateX(-50%)",
                      }),
                    }}
                  >
                    {element.text}
                  </div>
                </DraggableElement>
              </div>
            );
          })}

          {/* IMAGE ELEMENTS */}
          {imageElements.map((element) => {
            const isSelected = selectedElement === element.id;
            return (
              <div key={element.id}>
                {/* SELECTION INDICATOR FOR IMAGES */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${element.position.x - 4}px`,
                      top: `${element.position.y - 4}px`,
                      width: `${element.width + 8}px`,
                      height: `${element.height + 8}px`,
                      border: "2px solid #3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      borderRadius: "4px",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-22px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "10px",
                        color: "white",
                        backgroundColor: "#3b82f6",
                        padding: "2px 8px",
                        borderRadius: "3px",
                        whiteSpace: "nowrap",
                        fontWeight: "bold",
                      }}
                    >
                      🖼️ Selected Image
                    </div>
                  </div>
                )}

                <DraggableElement
                  id={element.id}
                  position={element.position}
                  onDrag={(x, y) =>
                    onUpdateImageElement(element.id, { position: { x, y } })
                  }
                  onSelect={() => onSelectElement(element.id, "image")}
                  isSelected={isSelected}
                >
                  <img
                    src={element.src}
                    alt={element.type}
                    draggable={false}
                    style={{
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      objectFit: "contain",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  />
                </DraggableElement>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.75rem",
          color: "#6b7280",
        }}
      >
        <span>Click and drag elements to reposition</span>
        <span>Scale: {Math.round(scale * 100)}%</span>
      </div>

      {/* UPDATED LEGEND - Clearer explanations */}
      <div
        style={{
          backgroundColor: "#eff6ff",
          borderRadius: "0.5rem",
          padding: "1rem",
          border: "1px solid #bfdbfe",
        }}
      >
        <p
          style={{
            fontSize: "0.875rem",
            fontWeight: "bold",
            color: "#1e40af",
            margin: "0 0 0.5rem 0",
          }}
        >
          📖 Visual Guide:
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: "#1e40af",
          }}
        >
          <div>
            <span style={{ fontWeight: "bold", color: "#93c5fd" }}>
              ⬜ Blue Dashed Box
            </span>
            <br />= Text area boundary (center-aligned text)
          </div>
          <div>
            <span style={{ fontWeight: "bold", color: "#3b82f6" }}>
              | Blue Vertical Line
            </span>
            <br />= Center point (drag to move)
          </div>
          <div>
            <span style={{ fontWeight: "bold", color: "#3b82f6" }}>
              🟦 Blue Solid Border
            </span>
            <br />= Selected (left/right aligned text)
          </div>
        </div>
      </div>

      {/* ADD THIS AT THE END - Queue Dialog */}
      <AddToQueueDialog
        isOpen={isQueueDialogOpen}
        onClose={() => setIsQueueDialogOpen(false)}
        certificateImageUrl={queueCertImage}
        recipientName={recipientName}
        onSuccess={() => {
          alert("Added to queue! Go to Email Queue page to send it.");
        }}
      />
    </div>
  );
}
