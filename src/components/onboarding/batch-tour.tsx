"use client";

import SpotlightTour, {
  SpotlightStep,
} from "@/components/onboarding/spotlight-tour";
import {
  Tag,
  FileSpreadsheet,
  Upload,
  Users,
  Mail,
  Send,
  Layers,
} from "lucide-react";

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="bg-yellow-100 text-yellow-900 px-1 py-0.5 rounded font-mono text-[11px]">
    {children}
  </code>
);

const BATCH_STEPS: SpotlightStep[] = [
  {
    title: "Welcome to Batch mode",
    description: (
      <>
        You&apos;ll send certificates to many recipients from one design. The flow
        has 5 quick steps — I&apos;ll walk you through each one.
      </>
    ),
    target: "[data-tour='batch-panel']",
    position: "center",
    icon: Layers,
    action: "Click Next when you're ready",
  },
  {
    title: "Step 1 · Add placeholders",
    description: (
      <>
        On the canvas, add a text element and type a placeholder like{" "}
        <Code>{`{{name}}`}</Code> or <Code>{`{{title}}`}</Code>. The batch
        engine replaces these with each recipient&apos;s data when it renders the
        certificate.
      </>
    ),
    target: "[data-tour='batch-placeholders']",
    position: "top-center",
    icon: Tag,
    action: "Reference: see the yellow placeholders panel",
  },
  {
    title: "Step 2 · Grab the example file",
    description: (
      <>
        Download the JSON or CSV sample. It already has the right columns —{" "}
        <strong>name</strong> and <strong>email</strong> are required, the rest
        are optional. Replace the rows with your recipients.
      </>
    ),
    target: "[data-tour='batch-examples']",
    position: "bottom-center",
    icon: FileSpreadsheet,
    action: "Click JSON Example or CSV Example to download",
  },
  {
    title: "Step 3 · Upload your file",
    description: (
      <>
        Once you&apos;ve filled in your recipients, click <strong>Choose File</strong>{" "}
        and pick the CSV or JSON. You&apos;ll see a green confirmation when it&apos;s
        parsed successfully.
      </>
    ),
    target: "[data-tour='batch-upload']",
    position: "bottom-center",
    icon: Upload,
    action: "Up to 50 recipients per batch",
  },
  {
    title: "Step 4 · Review recipients",
    description: (
      <>
        After upload, click <strong>View Details</strong> to see every recipient
        and uncheck any you want to skip. All recipients are selected by
        default.
      </>
    ),
    target: "[data-tour='batch-recipients']",
    position: "bottom-center",
    icon: Users,
    action: "Optional — only if you want to filter",
  },
  {
    title: "Step 5 · Queue the emails",
    description: (
      <>
        Hit <strong>Generate & Queue</strong>. The email dialog opens — pick a
        preset (Event / KPI / Internship / UMak) or type a custom subject and
        message, then queue them. Nothing sends yet — you&apos;ll send from the
        Email Queue page.
      </>
    ),
    target: "[data-tour='batch-generate']",
    position: "top-center",
    icon: Mail,
    action: "Customize the email before queueing",
  },
  {
    title: "Final · Ship them",
    description: (
      <>
        Queued certificates appear on the <strong>Email Queue</strong> page
        (left sidebar). Select the rows you want and hit Send. Status updates
        live every 5 seconds.
      </>
    ),
    target: "[data-tour='batch-generate']",
    position: "top-center",
    icon: Send,
    action: "You're ready — close this tour and try it!",
  },
];

interface BatchTourProps {
  onComplete: () => void;
}

export default function BatchTour({ onComplete }: BatchTourProps) {
  return (
    <SpotlightTour
      steps={BATCH_STEPS}
      onComplete={onComplete}
      accentFrom="from-purple-500"
      accentTo="to-purple-600"
      title="Batch tour"
    />
  );
}
