"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/protected-route";
import SidebarNav from "@/components/layout/sidebar-nav";
import { ArrowLeft, Upload, Trash2, Download, Eye, Edit2 } from "lucide-react";
import Image from "next/image";

interface Template {
  id: string;
  name: string;
  path: string;
  thumbnail: string;
  isCustom?: boolean;
}

function TemplatesContent() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const loadTemplates = useCallback(async () => {
    const foundTemplates: Template[] = [];
    let templateIndex = 1;

    // Check for built-in templates (template1.png through template20.png)
    while (templateIndex <= 20) {
      const templatePath = `/certificates/template${templateIndex}.png`;

      try {
        const response = await fetch(templatePath, { method: "HEAD" });
        if (response.ok) {
          foundTemplates.push({
            id: `template${templateIndex}`,
            name: `Template ${templateIndex}`,
            path: templatePath,
            thumbnail: templatePath,
          });
        } else {
          break; // Stop if template doesn't exist
        }
      } catch (error) {
        break; // Stop on error
      }

      templateIndex++;
    }

    // Load custom templates from localStorage
    try {
      const customTemplates = localStorage.getItem("customTemplates");
      if (customTemplates) {
        const parsed = JSON.parse(customTemplates);
        foundTemplates.push(...parsed);
      }
    } catch (error) {
      console.error("Error loading custom templates:", error);
    }

    setTemplates(foundTemplates);
  }, []);

  // Load templates on mount. loadTemplates is a stable useCallback ([] deps)
  // and only setStates after async fetch work — no synchronous cascade.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTemplates();
  }, [loadTemplates]);

  const handleUploadTemplate = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);

    // Reset file input
    event.target.value = "";
  };

  const uploadFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    // Prompt for template name
    const templateName = prompt(
      "Enter a name for this template:",
      file.name.replace(/\.[^/.]+$/, "")
    );
    if (!templateName) {
      return; // User cancelled
    }

    setIsUploading(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

        // Create new template object
        const newTemplate: Template = {
          id: `custom-${Date.now()}`,
          name: templateName,
          path: base64,
          thumbnail: base64,
          isCustom: true,
        };

        // Load existing custom templates
        let customTemplates: Template[] = [];
        try {
          const stored = localStorage.getItem("customTemplates");
          if (stored) {
            customTemplates = JSON.parse(stored);
          }
        } catch (error) {
          console.error("Error loading custom templates:", error);
        }

        // Add new template
        customTemplates.push(newTemplate);

        // Save to localStorage
        localStorage.setItem(
          "customTemplates",
          JSON.stringify(customTemplates)
        );

        // Reload templates
        await loadTemplates();

        alert(`Template "${templateName}" uploaded successfully!`);
        setIsUploading(false);
      };

      reader.onerror = () => {
        alert("Failed to read file");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to upload template"
      );
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set dragging to false if we're leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      alert("Please drop image files only (PNG, JPG, etc.)");
      return;
    }

    // Upload first image file
    if (imageFiles.length > 1) {
      alert(
        "Only one template can be uploaded at a time. Uploading the first file..."
      );
    }

    await uploadFile(imageFiles[0]);
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (
      !confirm(
        `Are you sure you want to delete ${template.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      if (template.isCustom) {
        // Delete from localStorage
        const stored = localStorage.getItem("customTemplates");
        if (stored) {
          let customTemplates: Template[] = JSON.parse(stored);
          customTemplates = customTemplates.filter((t) => t.id !== template.id);
          localStorage.setItem(
            "customTemplates",
            JSON.stringify(customTemplates)
          );
        }
      } else {
        // Try to delete from server (for built-in templates)
        alert(
          "Built-in templates cannot be deleted. Only custom uploaded templates can be removed."
        );
        return;
      }

      // Reload templates
      await loadTemplates();

      alert("Template deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete template"
      );
    }
  };

  const handleRenameTemplate = async (template: Template) => {
    const newName = prompt(
      "Enter a new name for this template:",
      template.name
    );
    if (!newName || newName === template.name) {
      return; // User cancelled or didn't change the name
    }

    try {
      if (template.isCustom) {
        // Update in localStorage
        const stored = localStorage.getItem("customTemplates");
        if (stored) {
          let customTemplates: Template[] = JSON.parse(stored);
          customTemplates = customTemplates.map((t) =>
            t.id === template.id ? { ...t, name: newName } : t
          );
          localStorage.setItem(
            "customTemplates",
            JSON.stringify(customTemplates)
          );
        }
      } else {
        alert(
          "Built-in templates cannot be renamed. Only custom uploaded templates can be renamed."
        );
        return;
      }

      // Reload templates
      await loadTemplates();

      alert(`Template renamed to "${newName}" successfully!`);
    } catch (error) {
      console.error("Rename error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to rename template"
      );
    }
  };

  const handleUseTemplate = (template: Template) => {
    if (template.isCustom) {
      // Store template data in sessionStorage for custom templates
      sessionStorage.setItem("selectedTemplate", JSON.stringify(template));
      router.push(`/generator?template=custom`);
    } else {
      // Navigate to generator with built-in template
      router.push(`/generator?template=${template.id}`);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-zinc-900"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Floating Sidebar Navigation */}
      <SidebarNav />

      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 border-4 border-dashed border-blue-500 max-w-md">
            <div className="text-center">
              <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Drop Template Here
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Release to upload your certificate template
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                aria-label="Back to dashboard"
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                <span className="hidden md:inline">Certificate </span>Templates
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="file"
                id="template-upload"
                accept="image/*"
                onChange={handleUploadTemplate}
                className="hidden"
              />
              <Button
                onClick={() =>
                  document.getElementById("template-upload")?.click()
                }
                disabled={isUploading}
                aria-label={isUploading ? "Uploading template" : "Upload template"}
                className="bg-(--primary-600) hover:bg-(--primary-700)"
              >
                <Upload className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {isUploading ? "Uploading..." : "Upload Template"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
            💡 Template Guidelines
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Drag and drop image files anywhere on this page to upload</li>
            <li>• Upload PNG or JPG images for best quality</li>
            <li>• Recommended size: 1920x1080px or higher for print quality</li>
            <li>
              • Templates are automatically numbered (template1.png,
              template2.png, etc.)
            </li>
            <li>• You can have up to 20 templates</li>
          </ul>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload your first certificate template to get started
            </p>
            <Button
              onClick={() =>
                document.getElementById("template-upload")?.click()
              }
              className="bg-(--primary-600) hover:bg-(--primary-700) text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-xl transition-all overflow-hidden border border-transparent hover:border-(--primary-200) dark:hover:border-(--primary-800)"
              >
                {/* Template Preview */}
                <div className="relative aspect-video bg-gray-100 dark:bg-zinc-700">
                  <Image
                    src={template.thumbnail}
                    alt={template.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold truncate pr-2">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {template.isCustom && (
                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
                          Custom
                        </span>
                      )}
                      {template.isCustom && (
                        <>
                          <button
                            onClick={() => handleRenameTemplate(template)}
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors group"
                            title="Rename template"
                          >
                            <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors group"
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full"
                      size="sm"
                    >
                      Use Template
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(template.path, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-white dark:bg-zinc-900 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
              <h3 className="font-semibold">{previewTemplate.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
            </div>
            <div className="relative aspect-video bg-gray-100 dark:bg-zinc-800">
              <Image
                src={previewTemplate.thumbnail}
                alt={previewTemplate.name}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <ProtectedRoute>
      <TemplatesContent />
    </ProtectedRoute>
  );
}
