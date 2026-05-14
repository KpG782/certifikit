// src/components/certificate/batch-generator.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Download,
  FileJson,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  X,
  FileSpreadsheet,
  Package,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import JSZip from "jszip";
import {
  BatchRecipient,
  BatchProgress,
  BATCH_JSON_EXAMPLE,
} from "@/types/batch";
import {
  BatchCertificateGenerator,
  parseRecipientsFile,
} from "@/lib/batch-generator";
import {
  TextElement,
  ImageElement,
  CertificateTemplate,
} from "@/types/certificates";

interface BatchGeneratorProps {
  template: CertificateTemplate | null;
  textElements: TextElement[];
  imageElements: ImageElement[];
  onStartTutorial?: () => void;
}

export default function BatchGenerator({
  template,
  textElements,
  imageElements,
  onStartTutorial,
}: BatchGeneratorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recipients, setRecipients] = useState<BatchRecipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(
    new Set()
  );
  const [progress, setProgress] = useState<BatchProgress>({
    total: 0,
    current: 0,
    status: "idle",
  });
  const [error, setError] = useState<string | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Email Dialog States
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState(
    "Your Certificate of Completion"
  );
  const [emailMessage, setEmailMessage] = useState(
    `Dear {{name}},\n\nCongratulations! Please find your Certificate of Completion attached.\n\nBest regards,\nYour Organization`
  );

  const parseCSV = (text: string): BatchRecipient[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row");
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIndex = headers.indexOf("name");
    const emailIndex = headers.indexOf("email");
    const titleIndex = headers.indexOf("title");
    const dateIndex = headers.indexOf("date");

    if (nameIndex === -1) {
      throw new Error('CSV must have a "name" column');
    }
    if (emailIndex === -1) {
      throw new Error('CSV must have an "email" column');
    }

    // Parse data rows
    const recipients: BatchRecipient[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));

      const name = values[nameIndex];
      const email = values[emailIndex];

      if (!name || !email) {
        throw new Error(`Row ${i + 1}: Missing name or email`);
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(`Row ${i + 1}: Invalid email format: ${email}`);
      }

      recipients.push({
        name,
        email,
        title: titleIndex !== -1 ? values[titleIndex] : "",
        date: dateIndex !== -1 ? values[dateIndex] : "",
        customFields: {},
      });
    }

    return recipients;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      let parsedRecipients: BatchRecipient[];

      if (file.name.endsWith(".csv")) {
        // Parse CSV
        const text = await file.text();
        parsedRecipients = parseCSV(text);
      } else if (file.name.endsWith(".json")) {
        // Parse JSON
        parsedRecipients = await parseRecipientsFile(file);
      } else {
        throw new Error(
          "Unsupported file format. Please upload a JSON or CSV file."
        );
      }

      setRecipients(parsedRecipients);
      // Auto-select all recipients when file is uploaded
      setSelectedRecipients(new Set(parsedRecipients.map((_, idx) => idx)));

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
      setRecipients([]);
      setSelectedRecipients(new Set());
    }
  };

  const handleGenerate = async () => {
    if (!template || selectedRecipients.size === 0) return;

    setError(null);
    setShowEmailDialog(false); // Close dialog
    const generator = new BatchCertificateGenerator();

    // Get only selected recipients
    const recipientsToQueue = recipients.filter((_, idx) =>
      selectedRecipients.has(idx)
    );

    try {
      await generator.generateBatch(
        recipientsToQueue,
        template,
        textElements,
        imageElements,
        setProgress,
        emailSubject,
        emailMessage
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate certificates"
      );
      setProgress((prev) => ({ ...prev, status: "error" }));
    }
  };

  const handleOpenEmailDialog = () => {
    if (!template || selectedRecipients.size === 0) return;
    setShowEmailDialog(true);
  };

  const emailTemplates = {
    event: {
      label: "Event Certification",
      subject: "Certificate of Attendance",
      message: `Dear {{name}},\n\nThank you for attending our event. Please find your Certificate of Attendance attached. We appreciate your participation!\n\nBest regards,\nYour Organization`,
    },
    kpi: {
      label: "KPI Certification",
      subject: "KPI Achievement Certificate",
      message: `Dear {{name}},\n\nCongratulations on achieving your KPI milestones. Please find your KPI Achievement Certificate attached as recognition of your performance.\n\nBest regards,\nYour Organization`,
    },
    internship: {
      label: "Internship Completion",
      subject: "Certificate of Completion - Internship",
      message: `Dear {{name}},\n\nCongratulations on completing your internship. Please find your Certificate of Completion attached. Wishing you continued success in your career.\n\nBest regards,\nYour Organization`,
    },
    umak: {
      label: "UMak Event",
      subject: "Your e-certificate is now ready",
      message: `Dear {{name}},\n\nI hope this email finds you well. On behalf of the University of Makati, we are pleased to inform you that your e-certificate is now ready. We sincerely appreciate your enthusiasm, time, and effort in the previously conducted event.\n\nThank you once again for your active participation. As a token of appreciation, attached here is your e-certificate.\n\nIf you have any questions or concerns, please feel free to reply in this email thread.\n\nWarm regards,\nUniversity of Makati\n{{title}}\n\nThis message contains confidential information and is intended only for the individual named. If you are not the named addressee you should not disseminate, distribute or copy this e-mail. Please notify the sender immediately by e-mail if you have received this e-mail by mistake and delete this e-mail from your system. E-mail transmission cannot be guaranteed to be secure or error-free as information could be intercepted, corrupted, lost, destroyed, arrive late or incomplete, or contain viruses. The sender therefore does not accept liability for any errors or omissions in the contents of this message, which arise as a result of e-mail transmission.`,
    },
  };

  const applyEmailTemplate = (key: "event" | "kpi" | "internship" | "umak") => {
    const t = emailTemplates[key];
    setEmailSubject(t.subject);
    setEmailMessage(t.message);
  };

  const toggleRecipient = (index: number) => {
    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRecipients(newSelected);
  };

  const toggleAllRecipients = () => {
    if (selectedRecipients.size === recipients.length) {
      setSelectedRecipients(new Set());
    } else {
      setSelectedRecipients(new Set(recipients.map((_, idx) => idx)));
    }
  };

  const downloadExample = () => {
    const blob = new Blob([JSON.stringify(BATCH_JSON_EXAMPLE, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "batch-example.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSVExample = () => {
    const csvContent = `name,email,title,date
John Doe,john.doe@example.com,Web Developer,2024-01-15
Jane Smith,jane.smith@example.com,Designer,2024-01-16
Bob Johnson,bob.johnson@example.com,Manager,2024-01-17`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "batch-example.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const canGenerate =
    template && recipients.length > 0 && progress.status !== "processing";

  const handleDownloadAll = async () => {
    if (!template || recipients.length === 0) return;

    const MAX_BATCH_SIZE = 50; // Performance limit
    const batchSize = Math.min(recipients.length, MAX_BATCH_SIZE);

    if (recipients.length > MAX_BATCH_SIZE) {
      if (
        !confirm(
          `Only the first ${MAX_BATCH_SIZE} certificates will be downloaded for performance reasons. Continue?`
        )
      ) {
        return;
      }
    }

    setIsDownloadingAll(true);
    setError(null);

    try {
      const zip = new JSZip();
      const { BatchCertificateGenerator } = await import(
        "@/lib/batch-generator"
      );
      const generator = new BatchCertificateGenerator();

      // Generate certificates
      for (let i = 0; i < batchSize; i++) {
        const recipient = recipients[i];

        const certificateDataUrl = await generator.generatePreview(
          recipient,
          template,
          textElements,
          imageElements
        );

        // Convert data URL to blob
        const base64Data = certificateDataUrl.split(",")[1];
        const binaryData = atob(base64Data);
        const array = new Uint8Array(binaryData.length);
        for (let j = 0; j < binaryData.length; j++) {
          array[j] = binaryData.charCodeAt(j);
        }

        // Sanitize filename
        const sanitizedName = recipient.name
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const filename = `certificate_${sanitizedName}_${i + 1}.png`;

        zip.file(filename, array, { binary: true });
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificates_batch_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download certificates"
      );
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const hasRecipients = recipients.length > 0;
  const queued = progress.status === "complete";

  // Visual step indicator: derive current step from app state
  const flowStep = queued ? 5 : hasRecipients ? 3 : 1;
  const flowLabels = [
    "Add placeholders",
    "Upload recipients",
    "Queue emails",
    "Send from queue",
  ];

  return (
    <div
      data-tour="batch-panel"
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold mb-0.5">
            Batch Certificate Generation
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Send up to 50 personalized certificates in one go
          </p>
        </div>
        {onStartTutorial && (
          <Button
            size="sm"
            variant="outline"
            onClick={onStartTutorial}
            className="shrink-0 border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 dark:border-purple-700 dark:text-purple-300"
          >
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
            Tutorial
          </Button>
        )}
      </div>

      {/* Step tracker */}
      <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-800 p-3">
        <div className="grid grid-cols-4 gap-1.5">
          {flowLabels.map((label, i) => {
            const stepNum = i + 1;
            const isDone = flowStep > stepNum;
            const isActive = flowStep === stepNum || (flowStep === 5 && stepNum === 4);
            return (
              <div
                key={label}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isActive
                      ? "bg-purple-600 text-white ring-2 ring-purple-200"
                      : "bg-white text-gray-400 border border-gray-300"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <span
                  className={`text-[10px] mt-1 leading-tight ${
                    isActive
                      ? "text-purple-800 dark:text-purple-200 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Example Download */}
      <div
        data-tour="batch-examples"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          padding: "0.75rem",
          backgroundColor: "#f9fafb",
          borderRadius: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <FileJson
            style={{ width: "20px", height: "20px", color: "#6b7280" }}
          />
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.125rem",
              }}
            >
              Need an example?
            </p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              Download sample templates to get started
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadExample}
            style={{ flex: 1 }}
          >
            <FileJson
              style={{ width: "16px", height: "16px", marginRight: "0.5rem" }}
            />
            JSON Example
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSVExample}
            style={{ flex: 1 }}
          >
            <FileSpreadsheet
              style={{ width: "16px", height: "16px", marginRight: "0.5rem" }}
            />
            CSV Example
          </Button>
        </div>
      </div>

      {/* File Upload */}
      <div data-tour="batch-upload">
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
          }}
        >
          Upload Recipients File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            style={{ flex: 1 }}
          >
            <Upload
              style={{ width: "16px", height: "16px", marginRight: "0.5rem" }}
            />
            Choose File (JSON/CSV)
          </Button>
        </div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            marginTop: "0.25rem",
          }}
        >
          Supports both JSON and CSV formats
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            padding: "0.75rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "0.5rem",
          }}
        >
          <AlertCircle
            style={{
              width: "20px",
              height: "20px",
              color: "#dc2626",
              flexShrink: 0,
            }}
          />
          <div>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#dc2626",
                marginBottom: "0.125rem",
              }}
            >
              Error
            </p>
            <p style={{ fontSize: "0.75rem", color: "#991b1b" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Recipients Preview */}
      {recipients.length > 0 && (
        <div
          data-tour="batch-recipients"
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                {recipients.length} Recipient
                {recipients.length !== 1 ? "s" : ""} Loaded
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowResultsDialog(true)}
            >
              View Details
            </Button>
          </div>
          <div
            style={{
              padding: "1rem",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "0.875rem",
            }}
          >
            <p>✅ File uploaded successfully!</p>
            <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
              Click "View Details" to see all recipients or "Generate" to create
              certificates
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {progress.status === "processing" && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              Queueing certificates...
            </span>
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              {progress.current} / {progress.total}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e5e7eb",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
                height: "100%",
                backgroundColor: "#3b82f6",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          {progress.currentName && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginTop: "0.5rem",
              }}
            >
              Processing: {progress.currentName}
            </p>
          )}
        </div>
      )}

      {/* Success Message */}
      {progress.status === "complete" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 p-3">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">
                Queued successfully!
              </p>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90">
                {progress.total} certificate{progress.total > 1 ? "s" : ""} are
                drafted. They won't send until you ship them from the queue.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem("showQueueTourOnce", "1");
              }
              router.push("/email-queue");
            }}
            size="sm"
            className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Go to Email Queue
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleOpenEmailDialog}
        disabled={!canGenerate}
        data-tour="batch-generate"
        style={{ width: "100%" }}
        size="lg"
      >
        <Mail
          style={{ width: "18px", height: "18px", marginRight: "0.5rem" }}
        />
        Generate & Queue {recipients.length} Certificate
        {recipients.length !== 1 ? "s" : ""}
      </Button>

      {/* Placeholders Info */}
      <div
        data-tour="batch-placeholders"
        style={{
          backgroundColor: "#fefce8",
          border: "1px solid #fde047",
          borderRadius: "0.5rem",
          padding: "0.75rem",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            color: "#854d0e",
            marginBottom: "0.5rem",
          }}
        >
          <strong>📌 Available Placeholders:</strong>
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: "#854d0e",
          }}
        >
          <code
            style={{
              backgroundColor: "#fef9c3",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
            }}
          >
            {"{{name}}"}
          </code>
          <code
            style={{
              backgroundColor: "#fef9c3",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
            }}
          >
            {"{{email}}"}
          </code>
          <code
            style={{
              backgroundColor: "#fef9c3",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
            }}
          >
            {"{{title}}"}
          </code>
          <code
            style={{
              backgroundColor: "#fef9c3",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
            }}
          >
            {"{{date}}"}
          </code>
        </div>
      </div>

      {/* Results Dialog */}
      {showResultsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-700 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    Batch Recipients - {recipients.length} Total
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Review recipients and choose an action
                  </p>
                </div>
                <button
                  onClick={() => setShowResultsDialog(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Selection Controls */}
              <div className="mb-4 flex items-center justify-between bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedRecipients.size === recipients.length}
                    onChange={toggleAllRecipients}
                    className="w-4 h-4 cursor-pointer accent-blue-600"
                  />
                  <span className="text-sm font-semibold">
                    {selectedRecipients.size} / {recipients.length} Selected
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleAllRecipients}
                >
                  {selectedRecipients.size === recipients.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              {/* Recipients List */}
              <div className="space-y-2">
                {recipients.map((recipient, index) => {
                  const isSelected = selectedRecipients.has(index);
                  return (
                    <div
                      key={index}
                      onClick={() => toggleRecipient(index)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRecipient(index)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 mt-1 cursor-pointer accent-blue-600 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-semibold ${
                                isSelected
                                  ? "text-blue-700 dark:text-blue-300"
                                  : ""
                              }`}
                            >
                              #{index + 1}
                            </span>
                            <span className="font-bold">{recipient.name}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              <span className="break-all">
                                {recipient.email}
                              </span>
                            </div>
                            {recipient.title && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs">📄</span>
                                <span>{recipient.title}</span>
                              </div>
                            )}
                            {recipient.date && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs">📅</span>
                                <span>{recipient.date}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info Alert */}
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>💡 Tip:</strong> Click on any recipient to
                  select/deselect them. You can also use the "Select All" button
                  above.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-zinc-700 shrink-0 bg-white dark:bg-zinc-900">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResultsDialog(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowResultsDialog(false);
                    handleDownloadAll();
                  }}
                  disabled={recipients.length === 0 || isDownloadingAll}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isDownloadingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Download All as ZIP (Max 50)
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowResultsDialog(false);
                    handleOpenEmailDialog();
                  }}
                  disabled={selectedRecipients.size === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Queue {selectedRecipients.size} Selected
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Download creates PNG files • Queue adds to email sending queue
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Configuration Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-700 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Configure Email for {selectedRecipients.size} Certificate
                    {selectedRecipients.size > 1 ? "s" : ""}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Customize the email subject and message (use {`{{name}}`}{" "}
                    for recipient name)
                  </p>
                </div>
                <button
                  onClick={() => setShowEmailDialog(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={emailSubject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmailSubject(e.target.value)
                  }
                  placeholder="Your Certificate of Completion"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Presets
                </label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => applyEmailTemplate("event")}
                    className="px-3 py-1 text-sm"
                  >
                    Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyEmailTemplate("kpi")}
                    className="px-3 py-1 text-sm"
                  >
                    KPI
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyEmailTemplate("internship")}
                    className="px-3 py-1 text-sm"
                  >
                    Internship
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => applyEmailTemplate("umak")}
                    className="px-3 py-1 text-sm"
                  >
                    UMak
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Choose a preset to auto-fill subject and message
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Message <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={emailMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEmailMessage(e.target.value)
                  }
                  rows={8}
                  className="resize-none font-mono text-sm"
                  placeholder={`Dear {{name}},\n\nCongratulations!...`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Use {`{{name}}`}, {`{{email}}`}, {`{{title}}`},{" "}
                  {`{{date}}`} as placeholders
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>📧 Preview:</strong> {selectedRecipients.size} email
                  {selectedRecipients.size > 1 ? "s" : ""} will be queued with
                  customized content
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 shrink-0 bg-white dark:bg-zinc-900">
              <Button
                variant="outline"
                onClick={() => setShowEmailDialog(false)}
                disabled={progress.status === "processing"}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={
                  progress.status === "processing" ||
                  !emailSubject.trim() ||
                  !emailMessage.trim()
                }
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {progress.status === "processing" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Queueing {selectedRecipients.size} certificate
                    {selectedRecipients.size > 1 ? "s" : ""}...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Queue {selectedRecipients.size} Certificate
                    {selectedRecipients.size > 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
