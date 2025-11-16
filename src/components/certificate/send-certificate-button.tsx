"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import EmailDialog from "./email-dialog";

interface SendCertificateButtonProps {
  onGenerateCertificate: () => Promise<string>;
  recipientName: string;
  disabled?: boolean;
}

export default function SendCertificateButton({
  onGenerateCertificate,
  recipientName,
  disabled,
}: SendCertificateButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [certificateImage, setCertificateImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOpenDialog = async () => {
    setIsGenerating(true);
    try {
      const imageData = await onGenerateCertificate();
      setCertificateImage(imageData);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to generate certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        disabled={disabled || isGenerating}
        variant="outline"
        className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 hover:shadow-md transition-all dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:border-blue-300"
      >
        <Mail className="w-4 h-4 mr-2" />
        {isGenerating ? "Preparing..." : "Send via Email"}
      </Button>

      <EmailDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        certificateImageUrl={certificateImage}
        recipientName={recipientName}
      />
    </>
  );
}