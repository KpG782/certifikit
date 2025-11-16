// src/components/onboarding/generator-tour.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  action?: string; // Optional action hint
}

const GENERATOR_TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to the Generator! 🎨",
    description:
      "This is where the magic happens! Let's walk through creating your first certificate in 5 easy steps.",
    target: "[data-tour='canvas-area']",
    position: "center",
  },
  {
    title: "Step 1: Select a Template",
    description:
      "Choose from 'Classic' or 'Modern' templates, or click 'Custom' to upload your own certificate background image.",
    target: "[data-tour='template-selector']",
    position: "bottom-left",
    action: "Click a template to begin",
  },
  {
    title: "Step 2: Add Text Elements",
    description:
      "Click '+ Add Text' to add names, titles, dates, or any text. You can add multiple text elements and drag them anywhere on the certificate.",
    target: "[data-tour='add-text-btn']",
    position: "bottom-left",
    action: "Try adding text now",
  },
  {
    title: "Step 3: Add Images (Optional)",
    description:
      "Click 'Add Image' to upload signatures, logos, or decorative images. Perfect for adding a professional touch!",
    target: "[data-tour='add-image-btn']",
    position: "bottom-left",
    action: "Images support PNG with transparency",
  },
  {
    title: "Step 4: Customize Elements",
    description:
      "Click any text or image on the canvas to select it. Use the Properties panel on the right to change fonts, colors, sizes, and more!",
    target: "[data-tour='properties-panel']",
    position: "top-left",
    action: "Select an element to see options",
  },
  {
    title: "Step 5: Download Your Certificate",
    description:
      "Once you're happy with your design, click 'Download Certificate' to save it as a high-quality PNG image!",
    target: "[data-tour='download-btn']",
    position: "bottom-right",
    action: "Click to download anytime",
  },
  {
    title: "Bonus: Batch Generation! 📦",
    description:
      "Need multiple certificates? Switch to the 'Batch Generation' tab to create hundreds of personalized certificates at once using a JSON file!",
    target: "[data-tour='batch-tab']",
    position: "top-right",
    action: "Use {{name}} placeholders in text",
  },
  {
    title: "You're Ready to Create! ✨",
    description:
      "That's it! Start by selecting a template above. Remember: drag elements to position them, click to edit, and have fun creating!",
    target: "[data-tour='canvas-area']",
    position: "center",
  },
];

interface GeneratorTourProps {
  onComplete: () => void;
}

export default function GeneratorTour({ onComplete }: GeneratorTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const currentStepData = GENERATOR_TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === GENERATOR_TOUR_STEPS.length - 1;

  useEffect(() => {
    const element = document.querySelector(currentStepData.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);

      // Calculate tooltip position based on step position preference
      let top = 0;
      let left = 0;

      switch (currentStepData.position) {
        case "top-left":
          top = rect.top - 20;
          left = rect.left;
          break;
        case "top-right":
          top = rect.top - 20;
          left = rect.right - 400;
          break;
        case "bottom-left":
          top = rect.bottom + 20;
          left = rect.left;
          break;
        case "bottom-right":
          top = rect.bottom + 20;
          left = rect.right - 400;
          break;
        case "center":
          top = window.innerHeight / 2 - 150;
          left = window.innerWidth / 2 - 200;
          break;
      }

      // Keep tooltip within viewport
      top = Math.max(20, Math.min(top, window.innerHeight - 350));
      left = Math.max(20, Math.min(left, window.innerWidth - 420));

      setTooltipPosition({ top, left });

      // Scroll element into view if needed
      if (currentStepData.position !== "center") {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentStep, currentStepData.target, currentStepData.position]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay with cutout */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "none",
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 8}
                  y={highlightRect.top - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Highlight Border */}
      {highlightRect && (
        <div
          style={{
            position: "fixed",
            left: `${highlightRect.left - 8}px`,
            top: `${highlightRect.top - 8}px`,
            width: `${highlightRect.width + 16}px`,
            height: `${highlightRect.height + 16}px`,
            border: "3px solid #3b82f6",
            borderRadius: "0.75rem",
            boxShadow:
              "0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.4)",
            zIndex: 9999,
            pointerEvents: "none",
            animation: "pulse-border 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        style={{
          position: "fixed",
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          width: "400px",
          backgroundColor: "#ffffff",
          borderRadius: "1rem",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          zIndex: 10000,
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header with gradient */}
        <div
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            padding: "1.25rem",
            color: "#ffffff",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "0.75rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontWeight: 600,
                  }}
                >
                  {currentStep + 1} / {GENERATOR_TOUR_STEPS.length}
                </div>
                <Sparkles style={{ width: "16px", height: "16px" }} />
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: "1.3",
                }}
              >
                {currentStepData.title}
              </h3>
            </div>
            <button
              onClick={handleSkip}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                borderRadius: "0.375rem",
                padding: "0.5rem",
                cursor: "pointer",
                color: "#ffffff",
                transition: "background 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")
              }
            >
              <X style={{ width: "18px", height: "18px" }} />
            </button>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: "3px",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#ffffff",
                width: `${
                  ((currentStep + 1) / GENERATOR_TOUR_STEPS.length) * 100
                }%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: "1.6",
              color: "#4b5563",
              marginBottom: "1rem",
            }}
          >
            {currentStepData.description}
          </p>

          {/* Action hint */}
          {currentStepData.action && (
            <div
              style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#1e40af",
                    fontWeight: 500,
                  }}
                >
                  {currentStepData.action}
                </span>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              style={{
                flex: 1,
                opacity: isFirstStep ? 0.5 : 1,
                cursor: isFirstStep ? "not-allowed" : "pointer",
              }}
            >
              <ArrowLeft
                style={{
                  width: "16px",
                  height: "16px",
                  marginRight: "0.5rem",
                }}
              />
              Previous
            </Button>
            <Button onClick={handleNext} style={{ flex: 1 }}>
              {isLastStep ? (
                <>
                  <Check
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "0.5rem",
                    }}
                  />
                  Got It!
                </>
              ) : (
                <>
                  Next
                  <ArrowRight
                    style={{
                      width: "16px",
                      height: "16px",
                      marginLeft: "0.5rem",
                    }}
                  />
                </>
              )}
            </Button>
          </div>

          {/* Step dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.375rem",
              marginTop: "1rem",
            }}
          >
            {GENERATOR_TOUR_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                style={{
                  width: index === currentStep ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor:
                    index === currentStep ? "#3b82f6" : "#d1d5db",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-border {
          0%,
          100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2),
              0 0 20px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3),
              0 0 30px rgba(59, 130, 246, 0.6);
          }
        }
      `}</style>
    </>
  );
}
