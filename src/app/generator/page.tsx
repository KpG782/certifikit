"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import CertificateCanvas from "@/components/certificate/canvas";
import TextControls from "@/components/certificate/text-controls";
import BatchGenerator from "@/components/certificate/batch-generator";
import GeneratorTour from "@/components/onboarding/generator-tour";
import EmailGuide from "@/components/onboarding/email-guide";
import BatchTour from "@/components/onboarding/batch-tour";
import SidebarNav from "@/components/layout/sidebar-nav";
import {
  TextElement,
  ImageElement,
  CertificateTemplate,
} from "@/types/certificates";
import {
  Plus,
  Image as ImageIcon,
  Upload,
  FileImage,
  LogOut,
  Layers,
  HelpCircle,
  Mail,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CERTIFICATE_WIDTH = 1200;
const CERTIFICATE_HEIGHT = 850;

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const headerVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

const tooltipVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

function GeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);

  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedElementType, setSelectedElementType] = useState<
    "text" | "image" | null
  >(null);
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");
  const [showTour, setShowTour] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<
    CertificateTemplate[]
  >([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [showEmailGuide, setShowEmailGuide] = useState(false);
  const [showBatchTour, setShowBatchTour] = useState(false);

  useEffect(() => {
    // Load available templates
    const loadTemplates = async () => {
      try {
        const templates: CertificateTemplate[] = [];

        for (let i = 1; i <= 20; i++) {
          const templatePath = `/certificates/template${i}.png`;

          try {
            const response = await fetch(templatePath, { method: "HEAD" });

            if (response.ok) {
              templates.push({
                id: `template-${i}`,
                name: `Template ${i}`,
                backgroundImage: templatePath,
                width: CERTIFICATE_WIDTH,
                height: CERTIFICATE_HEIGHT,
              });
            } else {
              break;
            }
          } catch (error) {
            break;
          }
        }

        setAvailableTemplates(templates);

        // Check if a template was specified in URL
        const templateParam = searchParams.get("template");
        if (templateParam) {
          const templateNumber = parseInt(templateParam);
          const selectedTemplate = templates.find(
            (t) => t.id === `template-${templateNumber}`
          );
          if (selectedTemplate) {
            setTemplate(selectedTemplate);
          }
        } else if (templates.length > 0) {
          // Default to template1 if no template specified and templates exist
          setTemplate(templates[0]);
        }
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();

    // Auto-show the generator spotlight tour on first visit only.
    // The Email Guide and Batch Tour are manual-trigger only.
    const hasSeenGeneratorTour = localStorage.getItem("hasSeenGeneratorTour");
    if (!hasSeenGeneratorTour) {
      const timer = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem("hasSeenGeneratorTour", "true");
  };

  const handleShowTour = () => {
    setShowTour(true);
  };

  const handleStartBatchTour = () => {
    setActiveTab("batch");
    // Allow tab switch to render before tour anchors are queried.
    setTimeout(() => setShowBatchTour(true), 250);
  };

  const addTextElement = () => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: "New Text",
      position: { x: CERTIFICATE_WIDTH / 2, y: 100 }, // Center position
      fontSize: 24,
      fontFamily: "Arial",
      color: "#000000",
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "center", // Always use center alignment by default
    };
    setTextElements([...textElements, newText]);
    setSelectedElement(newText.id);
    setSelectedElementType("text");
  };

  const addImageElement = (src: string) => {
    const newImage: ImageElement = {
      id: `image-${Date.now()}`,
      src,
      position: { x: 150, y: 150 },
      width: 150,
      height: 100,
      type: "signature",
    };
    setImageElements([...imageElements, newImage]);
    setSelectedElement(newImage.id);
    setSelectedElementType("image");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_IMAGES = 5;
      if (imageElements.length >= MAX_IMAGES) {
        alert(`Maximum of ${MAX_IMAGES} images allowed`);
        e.target.value = ""; // Reset input
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        addImageElement(imageUrl);
        e.target.value = ""; // Reset input for next upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newTemplate: CertificateTemplate = {
          id: "custom-" + Date.now(),
          name: "Custom",
          backgroundImage: imageUrl,
          width: CERTIFICATE_WIDTH,
          height: CERTIFICATE_HEIGHT,
        };
        setTemplate(newTemplate);
      };
      reader.readAsDataURL(file);
    }
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

  const deleteElement = () => {
    if (selectedElementType === "text") {
      setTextElements(textElements.filter((el) => el.id !== selectedElement));
    } else if (selectedElementType === "image") {
      setImageElements(imageElements.filter((el) => el.id !== selectedElement));
    }
    setSelectedElement(null);
    setSelectedElementType(null);
  };

  const selectedTextElement = textElements.find(
    (el) => el.id === selectedElement
  );
  const selectedImageElement = imageElements.find(
    (el) => el.id === selectedElement
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Floating Sidebar Navigation */}
      <SidebarNav />

      {/* Tour Overlay */}
      {showTour && <GeneratorTour onComplete={handleTourComplete} />}

      {/* Paginated Email Guide */}
      <EmailGuide
        open={showEmailGuide}
        onClose={() => setShowEmailGuide(false)}
        onJumpToBatch={() => setActiveTab("batch")}
        onStartBatchTour={() => setShowBatchTour(true)}
      />

      {/* Spotlight Batch Tour */}
      {showBatchTour && (
        <BatchTour onComplete={() => setShowBatchTour(false)} />
      )}

      {/* Top Navigation Bar */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm sticky top-0 z-20"
      >
        {/* Row 1: Back + Title + Right actions */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-2.5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                aria-label="Back to dashboard"
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </motion.div>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate">
              <span className="hidden md:inline">Certificate </span>Generator
            </h1>
          </div>

          {/* Desktop: inline actions */}
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmailGuide(true)}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <Mail className="w-4 h-4 mr-1" />
                Email Guide
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartBatchTour}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                <Layers className="w-4 h-4 mr-1" />
                Batch Tour
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowTour}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </Button>
            </motion.div>
            <span className="text-sm text-gray-500 dark:text-gray-400 max-w-[140px] truncate ml-2">
              {user?.name}
            </span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </motion.div>
          </div>

          {/* Mobile/Tablet: collapsed actions */}
          <div className="lg:hidden shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="More actions">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user?.name && (
                  <>
                    <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400">
                      Signed in as{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {user.name}
                      </span>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => setShowEmailGuide(true)}
                  className="text-emerald-600 dark:text-emerald-400"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Guide
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleStartBatchTour}
                  className="text-purple-600 dark:text-purple-400"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Batch Tour
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleShowTour}
                  className="text-blue-600 dark:text-blue-400"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2: Template selector + element actions */}
        <div className="border-t border-gray-100 dark:border-zinc-700/50 px-3 sm:px-6 py-2 flex items-center gap-2">
          <div
            data-tour="template-selector"
            className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 py-1 -my-1"
          >
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">
              Template:
            </span>
            {loadingTemplates ? (
              <span className="text-xs text-gray-400 shrink-0">Loading...</span>
            ) : availableTemplates.length > 0 ? (
              availableTemplates.map((t, index) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index, 8) * 0.04 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0"
                >
                  <Button
                    variant={template?.id === t.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTemplate(t)}
                  >
                    {t.name}
                  </Button>
                </motion.div>
              ))
            ) : (
              <span className="text-xs text-gray-400 shrink-0">
                No templates found
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => templateInputRef.current?.click()}
              className="shrink-0"
            >
              <Upload className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Custom</span>
            </Button>
            <input
              ref={templateInputRef}
              type="file"
              accept="image/*"
              onChange={handleTemplateUpload}
              className="hidden"
            />
          </div>

          <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-zinc-700 shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={addTextElement}
                disabled={!template}
                data-tour="add-text-btn"
                aria-label="Add text"
              >
                <Plus className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Add Text</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!template || imageElements.length >= 5}
                data-tour="add-image-btn"
                aria-label="Add image"
                className="hover:bg-blue-50 hover:border-blue-400 dark:hover:bg-blue-900/30 dark:hover:border-blue-500"
              >
                <ImageIcon className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">
                  Add Image
                  {imageElements.length > 0 &&
                    ` (${imageElements.length}/5)`}
                </span>
                {imageElements.length > 0 && (
                  <span className="sm:hidden text-xs ml-1">
                    {imageElements.length}/5
                  </span>
                )}
              </Button>
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas Area - Top on mobile, Left on desktop */}
        <div
          className="flex-1 overflow-auto p-4 sm:p-6 min-h-[60vh] lg:min-h-0"
          data-tour="canvas-area"
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              padding: "1.5rem",
              height: "100%",
            }}
          >
            {template ? (
              <div data-tour="download-btn">
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
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minHeight: "500px",
                  border: "2px dashed #d1d5db",
                  borderRadius: "0.5rem",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <FileImage
                    style={{
                      width: "64px",
                      height: "64px",
                      margin: "0 auto 1rem",
                      color: "#9ca3af",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 500,
                      color: "#6b7280",
                      marginBottom: "0.5rem",
                    }}
                  >
                    No template selected
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                    }}
                  >
                    Select a template from the top bar to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel - Bottom on mobile, Right on desktop */}
        <div
          className="w-full lg:w-[380px] lg:shrink-0 bg-white dark:bg-zinc-800 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-zinc-700 flex flex-col overflow-hidden max-h-[60vh] lg:max-h-none"
          data-tour="properties-panel"
        >
          {/* Tab Switcher */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <motion.button
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("single")}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                border: "none",
                backgroundColor: activeTab === "single" ? "#ffffff" : "#f9fafb",
                color: activeTab === "single" ? "#1f2937" : "#6b7280",
                borderBottom:
                  activeTab === "single" ? "2px solid #3b82f6" : "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Single Certificate
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("batch")}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                border: "none",
                backgroundColor: activeTab === "batch" ? "#ffffff" : "#f9fafb",
                color: activeTab === "batch" ? "#1f2937" : "#6b7280",
                borderBottom:
                  activeTab === "batch" ? "2px solid #3b82f6" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
                position: "relative",
              }}
              data-tour="batch-tab"
            >
              <Layers className="w-4 h-4" />
              Batch Generation
              {activeTab === "batch" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"
                />
              )}
            </motion.button>
          </div>

          {/* Tab Content */}
          {activeTab === "single" ? (
            <>
              <div
                style={{
                  padding: "1rem 1.5rem",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {selectedTextElement
                    ? "Text Properties"
                    : selectedImageElement
                    ? "Image Properties"
                    : "Properties"}
                </h2>
                {(selectedTextElement || selectedImageElement) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteElement}
                  >
                    Delete
                  </Button>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "1.5rem",
                }}
              >
                {selectedTextElement ? (
                  <TextControls
                    element={selectedTextElement}
                    onUpdate={(updates) =>
                      updateTextElement(selectedTextElement.id, updates)
                    }
                  />
                ) : selectedImageElement ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                        }}
                      >
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={selectedImageElement.width}
                        onChange={(e) =>
                          updateImageElement(selectedImageElement.id, {
                            width: parseInt(e.target.value) || 100,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          border: "2px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                        }}
                      >
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={selectedImageElement.height}
                        onChange={(e) =>
                          updateImageElement(selectedImageElement.id, {
                            height: parseInt(e.target.value) || 100,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          border: "2px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        backgroundColor: "#eff6ff",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#1e40af",
                          margin: 0,
                        }}
                      >
                        💡 <strong>Tip:</strong> Use images with transparent
                        backgrounds (PNG) for best results
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem 1rem",
                      color: "#9ca3af",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        margin: "0 auto 1rem",
                        borderRadius: "50%",
                        backgroundColor: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2v20M2 12h20" />
                      </svg>
                    </div>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        marginBottom: "0.5rem",
                      }}
                    >
                      No element selected
                    </p>
                    <p style={{ fontSize: "0.75rem" }}>
                      Click on a text or image element in the canvas to edit its
                      properties
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.5rem",
              }}
            >
              <BatchGenerator
                template={template}
                textElements={textElements}
                imageElements={imageElements}
                onStartTutorial={() => setShowBatchTour(true)}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function GeneratorPage() {
  return (
    <ProtectedRoute>
      <GeneratorContent />
    </ProtectedRoute>
  );
}
