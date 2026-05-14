"use client";

import SpotlightTour, {
  SpotlightStep,
} from "@/components/onboarding/spotlight-tour";
import {
  BarChart3,
  Filter,
  CheckSquare,
  Send,
  RefreshCw,
  Eye,
} from "lucide-react";

const QUEUE_STEPS: SpotlightStep[] = [
  {
    title: "This is your Email Queue",
    description: (
      <>
        Every certificate you queue from Batch generation lands here. Nothing
        sends until you ship it from this page — so you have a chance to review
        first.
      </>
    ),
    target: "[data-tour='queue-stats']",
    position: "bottom-center",
    icon: BarChart3,
    action: "Watch the status counters",
  },
  {
    title: "Filter & search",
    description: (
      <>
        Narrow the list by status (<strong>pending</strong>,{" "}
        <strong>sent</strong>, <strong>failed</strong>), date range, or search
        by recipient name / email. Handy when you have several batches in
        flight.
      </>
    ),
    target: "[data-tour='queue-filters']",
    position: "bottom-center",
    icon: Filter,
  },
  {
    title: "Select rows to send",
    description: (
      <>
        Tick the rows you want to ship — or use the checkbox in the table
        header to select all visible. Up to 50 per send.
      </>
    ),
    target: "[data-tour='queue-table']",
    position: "top-center",
    icon: CheckSquare,
    action: "Selecting unlocks the bulk Send button",
  },
  {
    title: "Bulk send & manage",
    description: (
      <>
        Once you have rows selected, hit <strong>Send Selected</strong>. The
        page auto-refreshes every 5 seconds so you&apos;ll see status flip from
        pending → sending → sent in real time.
      </>
    ),
    target: "[data-tour='queue-actions']",
    position: "bottom-center",
    icon: Send,
  },
  {
    title: "Per-row actions",
    description: (
      <>
        Each row has its own controls — <Eye className="inline w-3 h-3 mb-0.5" />{" "}
        preview the rendered certificate, send just that one, retry failed
        ones, or cancel pending ones you no longer want.
      </>
    ),
    target: "[data-tour='queue-table']",
    position: "top-center",
    icon: RefreshCw,
    action: "Click any row to interact",
  },
];

interface QueueTourProps {
  onComplete: () => void;
}

export default function QueueTour({ onComplete }: QueueTourProps) {
  return (
    <SpotlightTour
      steps={QUEUE_STEPS}
      onComplete={onComplete}
      accentFrom="from-emerald-500"
      accentTo="to-emerald-600"
      title="Queue tour"
    />
  );
}
