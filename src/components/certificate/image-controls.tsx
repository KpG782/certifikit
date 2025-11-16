// src/components/certificate/image-controls.tsx
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle } from "lucide-react";

interface ImageControlsProps {
  onAddImage: (src: string) => void;
  disabled?: boolean;
  currentImageCount?: number;
}

export default function ImageControls({
  onAddImage,
  disabled,
  currentImageCount = 0,
}: ImageControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 5;
  const isMaxReached = currentImageCount >= MAX_IMAGES;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (currentImageCount >= MAX_IMAGES) {
        alert(`Maximum of ${MAX_IMAGES} images allowed`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onAddImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        className="w-full hover:bg-primary/90 transition-colors"
        variant="outline"
        disabled={disabled || isMaxReached}
      >
        <Upload className="w-4 h-4 mr-2" />
        Add Signature/Image
      </Button>

      {/* Image count indicator */}
      <div className="flex items-center justify-between text-xs px-2">
        <span className="text-gray-500 dark:text-gray-400">
          Images: {currentImageCount} / {MAX_IMAGES}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: MAX_IMAGES }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < currentImageCount
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {isMaxReached && (
        <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Maximum limit reached. Remove an image to add a new one.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        💡 Upload PNG with transparent background for best results
      </p>
    </div>
  );
}
