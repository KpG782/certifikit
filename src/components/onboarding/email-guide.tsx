"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Mail,
  Layers,
  Tag,
  Upload,
  Users,
  Settings,
  Send,
  Sparkles,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmailGuideProps {
  open: boolean;
  onClose: () => void;
  onJumpToBatch?: () => void;
  onStartBatchTour?: () => void;
}

interface GuideStep {
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle: string;
  accent: "blue" | "green" | "purple" | "amber" | "indigo" | "rose";
  body: React.ReactNode;
}

const accentMap: Record<
  GuideStep["accent"],
  { from: string; to: string; ring: string; chip: string; chipText: string }
> = {
  blue: {
    from: "from-blue-500",
    to: "to-blue-600",
    ring: "ring-blue-200",
    chip: "bg-blue-100",
    chipText: "text-blue-700",
  },
  green: {
    from: "from-emerald-500",
    to: "to-emerald-600",
    ring: "ring-emerald-200",
    chip: "bg-emerald-100",
    chipText: "text-emerald-700",
  },
  purple: {
    from: "from-purple-500",
    to: "to-purple-600",
    ring: "ring-purple-200",
    chip: "bg-purple-100",
    chipText: "text-purple-700",
  },
  amber: {
    from: "from-amber-500",
    to: "to-amber-600",
    ring: "ring-amber-200",
    chip: "bg-amber-100",
    chipText: "text-amber-800",
  },
  indigo: {
    from: "from-indigo-500",
    to: "to-indigo-600",
    ring: "ring-indigo-200",
    chip: "bg-indigo-100",
    chipText: "text-indigo-700",
  },
  rose: {
    from: "from-rose-500",
    to: "to-rose-600",
    ring: "ring-rose-200",
    chip: "bg-rose-100",
    chipText: "text-rose-700",
  },
};

const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <code className="bg-yellow-100 text-yellow-900 px-1.5 py-0.5 rounded font-mono text-xs">
    {children}
  </code>
);

const STEPS: GuideStep[] = [
  {
    icon: Mail,
    badge: "Overview",
    title: "Two ways to send certificates",
    subtitle: "Pick the right path for your situation",
    accent: "blue",
    body: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-emerald-800 text-sm">
              Single Send
            </span>
          </div>
          <p className="text-xs text-emerald-800/80 leading-relaxed">
            One recipient. Send directly from the canvas in a few seconds.
          </p>
        </div>
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-purple-700" />
            <span className="font-semibold text-purple-800 text-sm">
              Batch Send
            </span>
          </div>
          <p className="text-xs text-purple-800/80 leading-relaxed">
            Up to 50 recipients at once via a CSV / JSON file. Queues for review
            before sending.
          </p>
        </div>
        <div className="sm:col-span-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
          💡 Both paths reuse the same canvas design — there&apos;s no separate
          template for batch.
        </div>
      </div>
    ),
  },
  {
    icon: Send,
    badge: "Path A · Single",
    title: "Single email — quick send",
    subtitle: "When you only have one recipient",
    accent: "green",
    body: (
      <div className="space-y-3">
        <ol className="space-y-2 text-sm">
          {[
            "Design the certificate on the canvas.",
            "Click the green Send via Email button on the canvas toolbar.",
            "Pick an email preset (Event / KPI / Internship / UMak) or write your own subject and message.",
            "Type the recipient's email and hit Send Certificate.",
          ].map((line, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-gray-700">{line}</span>
            </li>
          ))}
        </ol>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          ⚠️ Single sends ship immediately — they do <em>not</em> go through the
          Email Queue.
        </div>
      </div>
    ),
  },
  {
    icon: Tag,
    badge: "Path B · Step 1",
    title: "Batch — add placeholders to your text",
    subtitle: "Placeholders get replaced per recipient",
    accent: "purple",
    body: (
      <div className="space-y-3">
        <p className="text-sm text-gray-700">
          On the canvas, add a text element and type a placeholder where the
          recipient&apos;s data should appear:
        </p>
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 p-4">
          <p className="text-center text-sm text-gray-500 mb-2">
            Example text on the canvas
          </p>
          <p className="text-center text-base font-serif">
            Awarded to <Placeholder>{`{{name}}`}</Placeholder>
            <br />
            for completing <Placeholder>{`{{title}}`}</Placeholder>
          </p>
          <div className="mt-3 pt-3 border-t border-purple-200 text-center">
            <p className="text-xs text-gray-500 mb-1">Becomes per-recipient:</p>
            <p className="text-sm font-serif">
              Awarded to <strong>Jane Smith</strong> for completing{" "}
              <strong>Designer</strong>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-gray-500">Available:</span>
          <Placeholder>{`{{name}}`}</Placeholder>
          <Placeholder>{`{{email}}`}</Placeholder>
          <Placeholder>{`{{title}}`}</Placeholder>
          <Placeholder>{`{{date}}`}</Placeholder>
        </div>
      </div>
    ),
  },
  {
    icon: Upload,
    badge: "Path B · Step 2",
    title: "Upload your recipients file",
    subtitle: "CSV or JSON — one row per certificate",
    accent: "indigo",
    body: (
      <div className="space-y-3">
        <p className="text-sm text-gray-700">
          Open the <strong>Batch Generation</strong> tab on the right panel.
          Download an example file, replace the rows with your data, then
          upload it.
        </p>
        <div className="rounded-lg bg-gray-900 text-gray-100 p-3 font-mono text-xs overflow-x-auto">
          <div className="text-gray-400">recipients.csv</div>
          <div className="text-emerald-300">name,email,title,date</div>
          <div>Jane Smith,jane@example.com,Designer,2026-05-14</div>
          <div>John Doe,john@example.com,Developer,2026-05-14</div>
        </div>
        <ul className="text-xs text-gray-600 space-y-1 ml-2">
          <li>
            • <strong>name</strong> and <strong>email</strong> are required.
          </li>
          <li>
            • <strong>title</strong> and <strong>date</strong> are optional and
            only matter if you use them in placeholders.
          </li>
          <li>• Up to 50 recipients per batch.</li>
        </ul>
      </div>
    ),
  },
  {
    icon: Settings,
    badge: "Path B · Step 3",
    title: "Configure email & queue",
    subtitle: "Review recipients, pick a preset, queue them",
    accent: "amber",
    body: (
      <div className="space-y-3">
        <ol className="space-y-2 text-sm">
          {[
            { icon: Users, text: "Click View Details to inspect or deselect recipients you don't want." },
            { icon: Mail, text: "Click Generate & Queue — the email dialog opens." },
            { icon: Sparkles, text: "Pick a preset (Event / KPI / Internship / UMak) or write a custom subject + message." },
            { icon: Check, text: "Hit Queue — certificates are rendered and saved as drafts (not sent yet)." },
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-gray-700 flex items-center gap-2">
                <item.icon className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                {item.text}
              </span>
            </li>
          ))}
        </ol>
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
          💡 You can also use the same email message for everyone — placeholders
          like <Placeholder>{`{{name}}`}</Placeholder> work in the email body
          too.
        </div>
      </div>
    ),
  },
  {
    icon: Send,
    badge: "Path B · Step 4",
    title: "Send from the Email Queue page",
    subtitle: "Final review, then ship them",
    accent: "rose",
    body: (
      <div className="space-y-3">
        <p className="text-sm text-gray-700">
          Queued certificates land on the <strong>Email Queue</strong> page.
          From there you can:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "Preview rendered certificate", color: "bg-blue-50 border-blue-200 text-blue-900" },
            { label: "Filter by status / search", color: "bg-emerald-50 border-emerald-200 text-emerald-900" },
            { label: "Select rows + bulk send", color: "bg-purple-50 border-purple-200 text-purple-900" },
            { label: "Retry failed, cancel pending", color: "bg-amber-50 border-amber-200 text-amber-900" },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border p-3 ${item.color}`}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900">
          ⏱️ Status auto-refreshes every 5 seconds while you&apos;re on the queue
          page.
        </div>
      </div>
    ),
  },
];

export default function EmailGuide({
  open,
  onClose,
  onJumpToBatch,
  onStartBatchTour,
}: EmailGuideProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const accent = accentMap[current.accent];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  const close = () => {
    setStep(0);
    onClose();
  };

  const next = () => {
    if (isLast) {
      close();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div
              className={`relative bg-gradient-to-br ${accent.from} ${accent.to} text-white px-6 py-5`}
            >
              <button
                onClick={close}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close guide"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center ring-2 ring-white/30`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${accent.chip} ${accent.chipText} px-2 py-0.5 rounded-full`}
                    >
                      {current.badge}
                    </span>
                    <span className="text-[10px] text-white/80 font-medium">
                      {step + 1} of {STEPS.length}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold leading-tight">
                    {current.title}
                  </h2>
                  <p className="text-xs text-white/80 mt-0.5">
                    {current.subtitle}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                >
                  {current.body}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-zinc-700 px-6 py-4 bg-gray-50 dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-3 justify-center">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    aria-label={`Go to step ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step
                        ? "w-6 bg-gray-900 dark:bg-white"
                        : i < step
                        ? "w-1.5 bg-gray-500"
                        : "w-1.5 bg-gray-300 dark:bg-zinc-600"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={isFirst}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                {isLast && onJumpToBatch && onStartBatchTour ? (
                  <Button
                    onClick={() => {
                      onJumpToBatch();
                      close();
                      setTimeout(() => onStartBatchTour(), 350);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Layers className="w-4 h-4 mr-1.5" />
                    Try the batch tour
                  </Button>
                ) : null}
                <Button
                  onClick={next}
                  className={`flex-1 ${
                    isLast ? "bg-gray-900 hover:bg-gray-800" : ""
                  }`}
                >
                  {isLast ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Got it
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
