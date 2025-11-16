"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";

interface DownloadButtonProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
}

export function DownloadButton({
  canvasRef,
  fileName = "certificate",
}: DownloadButtonProps) {
  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to download certificate");
    }
  };

  return (
    <Button onClick={handleDownload} className="gap-2">
      <Download className="h-4 w-4" />
      Download PNG
    </Button>
  );
}
