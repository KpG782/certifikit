"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SpotlightStep {
  title: string;
  description: React.ReactNode;
  target: string;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center"
    | "center";
  action?: string;
  icon?: LucideIcon;
}

interface SpotlightTourProps {
  steps: SpotlightStep[];
  onComplete: () => void;
  accentFrom?: string; // tailwind class, e.g. "from-purple-500"
  accentTo?: string; // tailwind class, e.g. "to-purple-600"
  title?: string;
}

const TOOLTIP_W = 380;

export default function SpotlightTour({
  steps,
  onComplete,
  accentFrom = "from-blue-500",
  accentTo = "to-blue-600",
  title,
}: SpotlightTourProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = steps[current];
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;
  const Icon = step?.icon ?? Sparkles;

  useEffect(() => {
    if (!step) return;
    const recalc = () => {
      const el = document.querySelector(step.target);
      if (!el) {
        // If no anchor — center the tooltip
        setRect(null);
        setPos({
          top: window.innerHeight / 2 - 180,
          left: window.innerWidth / 2 - TOOLTIP_W / 2,
        });
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const r = el.getBoundingClientRect();
      setRect(r);

      const position = step.position ?? "bottom-center";
      let top = 0;
      let left = 0;
      const gap = 24;
      switch (position) {
        case "top-left":
          top = r.top - gap - 240;
          left = r.left;
          break;
        case "top-right":
          top = r.top - gap - 240;
          left = r.right - TOOLTIP_W;
          break;
        case "top-center":
          top = r.top - gap - 240;
          left = r.left + r.width / 2 - TOOLTIP_W / 2;
          break;
        case "bottom-left":
          top = r.bottom + gap;
          left = r.left;
          break;
        case "bottom-right":
          top = r.bottom + gap;
          left = r.right - TOOLTIP_W;
          break;
        case "bottom-center":
          top = r.bottom + gap;
          left = r.left + r.width / 2 - TOOLTIP_W / 2;
          break;
        case "center":
          top = window.innerHeight / 2 - 180;
          left = window.innerWidth / 2 - TOOLTIP_W / 2;
          break;
      }
      top = Math.max(16, Math.min(top, window.innerHeight - 360));
      left = Math.max(16, Math.min(left, window.innerWidth - TOOLTIP_W - 16));
      setPos({ top, left });
    };

    // Defer to next frame so layout settles after scrollIntoView
    const raf = requestAnimationFrame(recalc);
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [step]);

  const finish = () => {
    setVisible(false);
    setTimeout(onComplete, 250);
  };

  if (!visible || !step) return null;

  return (
    <>
      {/* Spotlight overlay */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none" }}
      >
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <mask id="spotlight-cutout">
              <rect width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - 8}
                  y={rect.top - 8}
                  width={rect.width + 16}
                  height={rect.height + 16}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.72)"
            mask="url(#spotlight-cutout)"
          />
        </svg>
      </div>

      {/* Highlight border */}
      {rect && (
        <div
          style={{
            position: "fixed",
            left: rect.left - 8,
            top: rect.top - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            border: "3px solid rgb(168 85 247)",
            borderRadius: 12,
            boxShadow:
              "0 0 0 4px rgba(168, 85, 247, 0.25), 0 0 24px rgba(168, 85, 247, 0.45)",
            zIndex: 9999,
            pointerEvents: "none",
            animation: "spotlight-pulse 1.8s ease-in-out infinite",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          width: TOOLTIP_W,
          zIndex: 10000,
        }}
        className="rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-700 transition-all duration-200"
      >
        <div
          className={`bg-gradient-to-br ${accentFrom} ${accentTo} text-white px-5 py-4 relative`}
        >
          <button
            onClick={finish}
            aria-label="Close tour"
            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                {title ?? "Tour"} · {current + 1} / {steps.length}
              </div>
              <h3 className="text-base font-bold leading-tight">{step.title}</h3>
            </div>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {step.description}
          </div>

          {step.action && (
            <div className="mt-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 px-3 py-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs font-medium text-purple-900 dark:text-purple-200">
                {step.action}
              </span>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={isFirst}
              className="flex-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => (isLast ? finish() : setCurrent((c) => c + 1))}
              className="flex-1"
            >
              {isLast ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Done
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-3 flex justify-center gap-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === current
                    ? "w-5 bg-gray-900 dark:bg-white"
                    : i < current
                    ? "w-1.5 bg-gray-500"
                    : "w-1.5 bg-gray-300 dark:bg-zinc-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spotlight-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.25),
              0 0 24px rgba(168, 85, 247, 0.45);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(168, 85, 247, 0.35),
              0 0 32px rgba(168, 85, 247, 0.6);
          }
        }
      `}</style>
    </>
  );
}
