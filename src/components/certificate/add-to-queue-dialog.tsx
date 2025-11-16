"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, X, Plus } from "lucide-react";

interface AddToQueueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  certificateImageUrl: string;
  recipientName: string;
  onSuccess?: () => void;
}

export default function AddToQueueDialog({
  isOpen,
  onClose,
  certificateImageUrl,
  recipientName,
  onSuccess,
}: AddToQueueDialogProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(
    `Your Certificate of Completion - ${recipientName}`
  );
  const [message, setMessage] = useState(
    `Dear ${recipientName},\n\nCongratulations! Please find your Certificate of Completion attached.\n\nBest regards,\nYour Organization`
  );
  const [isAdding, setIsAdding] = useState(false);
  const [addStatus, setAddStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const templates: Record<
    | "training"
    | "course"
    | "award"
    | "conference"
    | "volunteer"
    | "workshop"
    | "membership"
    | "compliance"
    | "competition"
    | "speaker",
    { label: string; subject: string; message: string }
  > = {
    training: {
      label: "Training Completion",
      subject: `Congratulations on Completing Your Training - ${recipientName}`,
      message: `Dear ${recipientName},\n\nCongratulations on successfully completing the training program! Your dedication and commitment to professional development are commendable.\n\nPlease find your Certificate of Completion attached. This certificate validates your achievement and newly acquired skills.\n\nWe wish you continued success in applying your knowledge.\n\nBest regards,\nYour Organization`,
    },
    course: {
      label: "Course Certification",
      subject: `Your Course Certificate is Ready - ${recipientName}`,
      message: `Dear ${recipientName},\n\nWe are pleased to inform you that you have successfully completed the course requirements. Your certificate is now ready!\n\nThis certificate acknowledges your commitment to learning and professional growth. Please find it attached for your records.\n\nCongratulations on this achievement!\n\nBest regards,\nYour Organization`,
    },
    award: {
      label: "Award Recognition",
      subject: `You've Been Recognized - Award Certificate Enclosed`,
      message: `Dear ${recipientName},\n\nCongratulations! We are delighted to recognize your outstanding achievements and contributions.\n\nYour dedication, excellence, and hard work have earned you this award. Please find your Award Certificate attached as a token of our appreciation.\n\nThank you for your exceptional performance!\n\nBest regards,\nYour Organization`,
    },
    conference: {
      label: "Conference Attendance",
      subject: `Thank You for Attending Our Event - ${recipientName}`,
      message: `Dear ${recipientName},\n\nThank you for attending our conference/event. Your participation and engagement contributed to making it a success.\n\nAs a token of appreciation, please find your Certificate of Attendance attached. We hope the experience was valuable and enriching.\n\nWe look forward to seeing you at future events!\n\nBest regards,\nYour Organization`,
    },
    volunteer: {
      label: "Volunteer Recognition",
      subject: `Certificate of Appreciation for Your Service - ${recipientName}`,
      message: `Dear ${recipientName},\n\nThank you for your generous contribution of time and effort as a volunteer. Your service has made a meaningful impact on our community.\n\nPlease find attached your Certificate of Appreciation as recognition of your dedication and compassionate service.\n\nWe deeply appreciate your commitment to making a difference.\n\nWith gratitude,\nYour Organization`,
    },
    workshop: {
      label: "Workshop Participation",
      subject: `Your Workshop Certificate of Participation - ${recipientName}`,
      message: `Dear ${recipientName},\n\nThank you for your active participation in our workshop. Your engagement and enthusiasm contributed to a dynamic learning environment.\n\nAttached is your Certificate of Participation, acknowledging your hands-on involvement and skill development.\n\nWe hope you found the workshop valuable and applicable to your goals.\n\nBest regards,\nYour Organization`,
    },
    membership: {
      label: "Membership Certificate",
      subject: `Welcome - Your Membership Certificate - ${recipientName}`,
      message: `Dear ${recipientName},\n\nWelcome! We are thrilled to have you as a member of our organization.\n\nYour membership certificate is attached, validating your official membership status. This certificate represents your connection to our community and the benefits that come with it.\n\nWe look forward to your active participation and engagement.\n\nWarm regards,\nYour Organization`,
    },
    compliance: {
      label: "Compliance Certification",
      subject: `Compliance Training Certificate - ${recipientName}`,
      message: `Dear ${recipientName},\n\nThis certifies that you have successfully completed the required compliance training program.\n\nYour Compliance Certificate is attached for your records. Please retain this certificate as proof of completion for regulatory and organizational requirements.\n\nThank you for your commitment to maintaining compliance standards.\n\nBest regards,\nYour Organization`,
    },
    competition: {
      label: "Competition Winner",
      subject: `Congratulations! Your Competition Award Certificate - ${recipientName}`,
      message: `Dear ${recipientName},\n\nCongratulations on your outstanding performance in the competition! Your talent, creativity, and hard work have earned you this well-deserved recognition.\n\nYour Competition Award Certificate is attached. Wear this achievement with pride!\n\nWe celebrate your success and look forward to your continued excellence.\n\nBest regards,\nYour Organization`,
    },
    speaker: {
      label: "Speaker/Presenter",
      subject: `Thank You for Speaking at Our Event - ${recipientName}`,
      message: `Dear ${recipientName},\n\nThank you for sharing your expertise and insights as a speaker at our event. Your presentation was engaging, informative, and greatly appreciated by all attendees.\n\nPlease find attached your Certificate of Appreciation for your valuable contribution to knowledge sharing and professional development.\n\nWe hope to collaborate with you again in the future.\n\nWith appreciation,\nYour Organization`,
    },
  };

  const applyTemplate = (
    key:
      | "training"
      | "course"
      | "award"
      | "conference"
      | "volunteer"
      | "workshop"
      | "membership"
      | "compliance"
      | "competition"
      | "speaker"
  ) => {
    const t = templates[key];
    setSubject(t.subject);
    setMessage(t.message);
    setErrorMessage("");
  };

  const handleAdd = async () => {
    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (!subject.trim()) {
      setErrorMessage("Please enter a subject");
      return;
    }
    if (!message.trim()) {
      setErrorMessage("Please enter a message");
      return;
    }

    setIsAdding(true);
    setAddStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/email-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: email.trim(),
          recipientName: recipientName,
          subject: subject.trim(),
          message: message.trim(),
          certificateImage: certificateImageUrl,
        }),
      });

      if (response.ok) {
        setAddStatus("success");
        onSuccess?.();
        setTimeout(() => {
          onClose();
          setEmail("");
          setSubject(`Your Certificate of Completion - ${recipientName}`);
          setMessage(
            `Dear ${recipientName},\n\nCongratulations! Please find your Certificate of Completion attached.\n\nBest regards,\nYour Organization`
          );
          setAddStatus("idle");
        }, 1500);
      } else {
        const data = await response.json();
        setAddStatus("error");
        setErrorMessage(data.error || "Failed to add to queue");
      }
    } catch (error) {
      setAddStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Network error");
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Add to Email Queue
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Save this certificate to send later (works offline!)
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isAdding}
              className="text-(--neutral-400) hover:text-black dark:text-(--neutral-500) dark:hover:black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Recipient Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              disabled={isAdding}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSubject(e.target.value)
              }
              disabled={isAdding}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Presets</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => applyTemplate("training")}
                disabled={isAdding}
                className="px-3 py-1 text-sm"
              >
                Training
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("course")}
                disabled={isAdding}
                className="px-3 py-1 text-sm"
              >
                Course
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("award")}
                disabled={isAdding}
                className="px-3 py-1 text-sm"
              >
                Award
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("conference")}
                disabled={isAdding}
                className="px-3 py-1 text-sm"
              >
                Conference
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("volunteer")}
                disabled={isAdding}
                className="px-3 py-1 text-sm"
              >
                Volunteer
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("workshop")}
                disabled={isAdding}
                className="px-3 py-1 text-sm"
              >
                Workshop
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("membership")}
                disabled={isAdding}
                className="px-3 py-1 text-sm"
              >
                Membership
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("compliance")}
                disabled={isAdding}
                className="px-3 py-1 text-sm"
              >
                Compliance
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("competition")}
                disabled={isAdding}
                className="px-3 py-1 text-sm"
              >
                Competition
              </Button>
              <Button
                variant="outline"
                onClick={() => applyTemplate("speaker")}
                disabled={isAdding}
                className="px-3 py-1 text-sm"
              >
                Speaker
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Choose a preset to auto-fill subject and message
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
              disabled={isAdding}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Certificate will be attached automatically when sent
            </p>
          </div>

          {addStatus === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">
                Added to queue! ✨ Go to Email Queue to send it.
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <X className="w-5 h-5" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 shrink-0 bg-white dark:bg-zinc-900">
          <Button variant="outline" onClick={onClose} disabled={isAdding}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isAdding || addStatus === "success"}
            className="bg-(--primary-600) hover:bg-(--primary-700) text-white disabled:bg-(--neutral-300) disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : addStatus === "success" ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added!
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add to Queue
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
