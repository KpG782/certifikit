"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CertificateTemplate } from "@/types/certificates";

interface TemplateSelectorProps {
  selectedTemplate: CertificateTemplate | null;
  onSelectTemplate: (template: CertificateTemplate) => void;
}

// Better screen size - A4 Landscape but scaled for monitors
// 1200px × 850px (maintains A4 ratio but fits better on screen)
const CERTIFICATE_WIDTH = 1200;
const CERTIFICATE_HEIGHT = 850;

export default function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [customTemplate, setCustomTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available templates from the public folder
    const loadTemplates = async () => {
      try {
        const detectedTemplates: CertificateTemplate[] = [];

        // Try to load templates (template1.png, template2.png, etc.)
        for (let i = 1; i <= 20; i++) {
          // Check up to 20 templates
          const templatePath = `/certificates/template${i}.png`;

          // Check if the image exists
          const response = await fetch(templatePath, { method: "HEAD" });

          if (response.ok) {
            detectedTemplates.push({
              id: `template-${i}`,
              name: `Template ${i}`,
              backgroundImage: templatePath,
              width: CERTIFICATE_WIDTH,
              height: CERTIFICATE_HEIGHT,
            });
          } else {
            // Stop checking when we don't find a template
            break;
          }
        }

        setTemplates(detectedTemplates);
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setCustomTemplate(imageUrl);

        // Create a custom template with optimized dimensions
        const newTemplate: CertificateTemplate = {
          id: "custom-" + Date.now(),
          name: "Custom Template",
          backgroundImage: imageUrl,
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
        };
        onSelectTemplate(newTemplate);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Custom Template */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Upload Template
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer dark:file:bg-blue-900/30 dark:file:text-blue-300 dark:hover:file:bg-blue-900/50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Landscape format (1200×850px)
        </p>
      </div>

      {/* Default Templates */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Or Choose Default
        </label>

        {loading ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Loading templates...</p>
          </div>
        ) : templates.length > 0 ? (
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${
                  selectedTemplate?.id === template.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-zinc-700 dark:hover:border-blue-500"
                }`}
              >
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Landscape ({template.width} × {template.height})
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">
              No templates found in /public/certificates folder
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Add template1.png, template2.png, etc. to the folder
            </p>
          </div>
        )}
      </div>

      {customTemplate && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-green-700 dark:text-green-400">
            ✓ Custom template uploaded
          </p>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-400">
          <strong>📄 Certificate Format</strong>
          <br />
          Landscape orientation (A4 size)
          <br />
          Perfect for printing and display
        </p>
      </div>
    </div>
  );
}
