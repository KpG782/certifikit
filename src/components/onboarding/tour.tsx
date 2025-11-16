// src/components/onboarding/tour.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  target?: string; // CSS selector for the element to highlight
  position: "center" | "top" | "bottom" | "left" | "right";
  image?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Certificate Generator! 🎉",
    description:
      "Let's take a quick tour to help you get started with creating beautiful certificates in just a few clicks.",
    position: "center",
  },
  {
    title: "Step 1: Choose Your Template",
    description:
      "Start by clicking 'Create New Certificate' to access the generator. You'll be able to select from pre-designed templates or upload your own custom design.",
    target: "[data-tour='create-new']",
    position: "bottom",
  },
  {
    title: "Step 2: Design Your Certificate",
    description:
      "Once in the generator, select a template from the top bar. You can choose Classic, Modern, or upload a custom background image.",
    position: "center",
  },
  {
    title: "Step 3: Add Text & Images",
    description:
      "Click 'Add Text' to add recipient names, titles, and dates. Use 'Add Image' to include signatures or logos. Drag elements to position them perfectly.",
    position: "center",
  },
  {
    title: "Step 4: Customize Properties",
    description:
      "Select any text or image element to edit its properties on the right panel. Adjust fonts, colors, sizes, and more to match your style.",
    position: "center",
  },
  {
    title: "Step 5: Batch Generation (Optional)",
    description:
      "Need multiple certificates? Switch to the 'Batch Generation' tab, upload a JSON file with recipient data, and generate hundreds of certificates at once!",
    position: "center",
  },
  {
    title: "Ready to Create! ✨",
    description:
      "You're all set! Click 'Create New Certificate' to start designing your first certificate. You can always revisit this guide from the help menu.",
    position: "center",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const currentStepData = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (currentStepData.target) {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setHighlightRect(null);
    }
  }, [currentStep, currentStepData.target]);

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
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          zIndex: 9998,
          transition: "opacity 0.3s",
          opacity: isVisible ? 1 : 0,
        }}
        onClick={handleSkip}
      />

      {/* Highlight Box */}
      {highlightRect && (
        <div
          style={{
            position: "fixed",
            left: `${highlightRect.left - 8}px`,
            top: `${highlightRect.top - 8}px`,
            width: `${highlightRect.width + 16}px`,
            height: `${highlightRect.height + 16}px`,
            border: "3px solid #3b82f6",
            borderRadius: "0.5rem",
            boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.3)",
            zIndex: 9999,
            pointerEvents: "none",
            animation: "pulse 2s infinite",
          }}
        />
      )}

      {/* Tour Card */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "600px",
          backgroundColor: "#ffffff",
          borderRadius: "1rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          zIndex: 10000,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            padding: "1.5rem",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "0.5rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.875rem",
                  opacity: 0.9,
                  marginBottom: "0.25rem",
                }}
              >
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {currentStepData.title}
              </h2>
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
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")
              }
            >
              <X style={{ width: "20px", height: "20px" }} />
            </button>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              height: "4px",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: "2px",
              overflow: "hidden",
              marginTop: "1rem",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#ffffff",
                width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "2rem" }}>
          {/* Illustration or Icon */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
              }}
            >
              {currentStep === 0 && "👋"}
              {currentStep === 1 && "📋"}
              {currentStep === 2 && "🎨"}
              {currentStep === 3 && "✍️"}
              {currentStep === 4 && "⚙️"}
              {currentStep === 5 && "📦"}
              {currentStep === 6 && "🚀"}
            </div>
          </div>

          <p
            style={{
              fontSize: "1rem",
              lineHeight: "1.6",
              color: "#4b5563",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            {currentStepData.description}
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  style={{ minWidth: "100px" }}
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
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              {!isLastStep && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  style={{ minWidth: "80px" }}
                >
                  Skip Tour
                </Button>
              )}
              <Button onClick={handleNext} style={{ minWidth: "100px" }}>
                {isLastStep ? (
                  <>
                    <Check
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "0.5rem",
                      }}
                    />
                    Get Started
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
          </div>

          {/* Step Indicators */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "1.5rem",
            }}
          >
            {TOUR_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor:
                    index === currentStep ? "#3b82f6" : "#d1d5db",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  if (index !== currentStep) {
                    e.currentTarget.style.backgroundColor = "#9ca3af";
                  }
                }}
                onMouseOut={(e) => {
                  if (index !== currentStep) {
                    e.currentTarget.style.backgroundColor = "#d1d5db";
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}
