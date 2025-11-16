"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import CertificateCanvas from "@/components/certificate/canvas";
import TextControls from "@/components/certificate/text-controls";
import BatchGenerator from "@/components/certificate/batch-generator";
import GeneratorTour from "@/components/onboarding/generator-tour";
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
  X,
  Mail,
  Users,
} from "lucide-react";

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
  const [showEmailTutorial, setShowEmailTutorial] = useState(false);
  const [showBatchTutorial, setShowBatchTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

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

    // Check if user has seen generator tour
    const hasSeenGeneratorTour = localStorage.getItem("hasSeenGeneratorTour");
    if (!hasSeenGeneratorTour) {
      const timer = setTimeout(() => setShowTour(true), 800);
      return () => clearTimeout(timer);
    }

    // Check if user has seen email tutorial
    const hasSeenEmailTutorial = localStorage.getItem("hasSeenEmailTutorial");
    if (!hasSeenEmailTutorial && !showTour) {
      const timer = setTimeout(() => setShowEmailTutorial(true), 2000);
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

  const handleEmailTutorialComplete = () => {
    setShowEmailTutorial(false);
    localStorage.setItem("hasSeenEmailTutorial", "true");
  };

  const handleShowEmailTutorial = () => {
    setShowEmailTutorial(true);
    setTutorialStep(0);
  };

  const handleShowBatchTutorial = () => {
    setShowBatchTutorial(true);
    setTutorialStep(0);
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

      {/* Email Tutorial Overlay */}
      <AnimatePresence>
        {showEmailTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleEmailTutorialComplete}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative"
            >
              <button
                onClick={handleEmailTutorialComplete}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Mail className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">
                  Send Certificates via Email
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Learn how to send certificates to recipients
                </p>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        Create Your Certificate
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Design your certificate using the canvas. Add text and
                        images.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        Single Email (Quick Send)
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Look for the <strong>"Send via Email"</strong> button in
                        the canvas area.
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                        <li>
                          • Choose from 4 email presets (Event, KPI, Internship,
                          UMak)
                        </li>
                        <li>• Customize subject and message</li>
                        <li>• Enter recipient's email</li>
                        <li>• Click "Send Certificate" to send immediately</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Batch Generation (Multiple Emails)
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Click the <strong>"Batch Generation"</strong> tab on the
                        right panel.
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                        <li>
                          • Use placeholders like {`{{name}}`}, {`{{email}}`},{" "}
                          {`{{title}}`}
                        </li>
                        <li>• Upload JSON file with recipient data</li>
                        <li>• Select recipients with checkboxes</li>
                        <li>• Queue certificates for sending later</li>
                        <li>• Manage queue in Email Queue page</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex gap-3"
              >
                <Button
                  onClick={() => {
                    handleEmailTutorialComplete();
                    setActiveTab("batch");
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Try Batch Generation
                </Button>
                <Button
                  onClick={handleEmailTutorialComplete}
                  variant="outline"
                  className="flex-1"
                >
                  Got it!
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            maxWidth: "100%",
            padding: "0.75rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {/* Left: Back + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                ← Back
              </Button>
            </motion.div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
              Certificate Generator
            </h1>
          </div>

          {/* Center: Quick Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* Template Selection */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
              data-tour="template-selector"
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#6b7280",
                }}
              >
                Template:
              </span>
              {loadingTemplates ? (
                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  Loading...
                </span>
              ) : availableTemplates.length > 0 ? (
                <>
                  {availableTemplates.map((t, index) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={template?.id === t.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTemplate(t)}
                      >
                        {t.name}
                      </Button>
                    </motion.div>
                  ))}
                </>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  No templates found
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => templateInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-1" />
                Custom
              </Button>
              <input
                ref={templateInputRef}
                type="file"
                accept="image/*"
                onChange={handleTemplateUpload}
                style={{ display: "none" }}
              />
            </div>

            <div
              style={{
                width: "1px",
                height: "24px",
                backgroundColor: "#e5e7eb",
                margin: "0 0.5rem",
              }}
            />

            {/* Add Elements */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={addTextElement}
                disabled={!template}
                data-tour="add-text-btn"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Text
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!template || imageElements.length >= 5}
                data-tour="add-image-btn"
                className="hover:bg-blue-50 hover:border-blue-400 dark:hover:bg-blue-900/30 dark:hover:border-blue-500"
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Add Image{" "}
                {imageElements.length > 0 && `(${imageElements.length}/5)`}
              </Button>
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>

          {/* Right: User + Logout */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowEmailTutorial}
                style={{ color: "#10b981" }}
              >
                <Mail className="w-4 h-4 mr-1" />
                Email Guide
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowTour}
                style={{ color: "#3b82f6" }}
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </Button>
            </motion.div>
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              {user?.name}
            </span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Canvas Area - Left Side */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "1.5rem",
          }}
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

        {/* Properties Panel - Right Side */}
        <div
          style={{
            width: "380px",
            backgroundColor: "#ffffff",
            borderLeft: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
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
