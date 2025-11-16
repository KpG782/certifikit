"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Check, X } from "lucide-react";

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  certificateImageUrl: string;
  recipientName: string;
}

export default function EmailDialog({
  isOpen,
  onClose,
  certificateImageUrl,
  recipientName,
}: EmailDialogProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(
    `Your Certificate of Completion - ${recipientName}`
  );
  const [message, setMessage] = useState(
    `Dear ${recipientName},\n\nCongratulations! Please find your Certificate of Completion attached.\n\nBest regards,\nYour Organization`
  );
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSend = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
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

    setIsSending(true);
    setSendStatus("idle");
    setErrorMessage("");

    try {
      // Prepare payload
      const payload: any = {
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        certificateImage: certificateImageUrl,
        recipientName: recipientName,
      };

      const response = await fetch("/api/send-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSendStatus("success");
        setTimeout(() => {
          onClose();
          setEmail("");
          setSubject(`Your Certificate of Completion - ${recipientName}`);
          setMessage(
            `Dear ${recipientName},\n\nCongratulations! Please find your Certificate of Completion attached.\n\nBest regards,\nYour Organization`
          );
          setSendStatus("idle");
        }, 2000);
      } else {
        setSendStatus("error");
        setErrorMessage(data.error || "Failed to send certificate");
      }
    } catch (error) {
      console.error("Send error:", error);
      setSendStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Network error occurred"
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Send Certificate via Email
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter the recipient's email address and customize your message
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSending}
              className="text-(--neutral-400) hover:text-(--neutral-600) dark:text-(--neutral-500) dark:hover:text-(--neutral-300) transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Recipient Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              disabled={isSending}
              className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-600"
            />
          </div>

          {/* Subject Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Email Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Your Certificate of Completion"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setErrorMessage("");
              }}
              disabled={isSending}
              className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-600"
            />
          </div>

          {/* Email Presets */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Email Presets
            </label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => {
                  setSubject(
                    `Congratulations on Completing Your Training - ${recipientName}`
                  );
                  setMessage(
                    `Dear ${recipientName},\n\nCongratulations on successfully completing the training program! Your dedication and commitment to professional development are commendable.\n\nPlease find your Certificate of Completion attached. This certificate validates your achievement and newly acquired skills.\n\nWe wish you continued success in applying your knowledge.\n\nBest regards,\nYour Organization`
                  );
                }}
                disabled={isSending}
                className="px-3 py-1 text-sm"
              >
                Training
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubject(
                    `Your Course Certificate is Ready - ${recipientName}`
                  );
                  setMessage(
                    `Dear ${recipientName},\n\nWe are pleased to inform you that you have successfully completed the course requirements. Your certificate is now ready!\n\nThis certificate acknowledges your commitment to learning and professional growth. Please find it attached for your records.\n\nCongratulations on this achievement!\n\nBest regards,\nYour Organization`
                  );
                }}
                disabled={isSending}
                className="px-3 py-1 text-sm"
              >
                Course
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubject(
                    `You've Been Recognized - Award Certificate Enclosed`
                  );
                  setMessage(
                    `Dear ${recipientName},\n\nCongratulations! We are delighted to recognize your outstanding achievements and contributions.\n\nYour dedication, excellence, and hard work have earned you this award. Please find your Award Certificate attached as a token of our appreciation.\n\nThank you for your exceptional performance!\n\nBest regards,\nYour Organization`
                  );
                }}
                disabled={isSending}
                className="px-3 py-1 text-sm"
              >
                Award
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubject(
                    `Thank You for Attending Our Event - ${recipientName}`
                  );
                  setMessage(
                    `Dear ${recipientName},\n\nThank you for attending our conference/event. Your participation and engagement contributed to making it a success.\n\nAs a token of appreciation, please find your Certificate of Attendance attached. We hope the experience was valuable and enriching.\n\nWe look forward to seeing you at future events!\n\nBest regards,\nYour Organization`
                  );
                }}
                disabled={isSending}
                className="px-3 py-1 text-sm"
              >
                Conference
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubject(
                    `Certificate of Appreciation for Your Service - ${recipientName}`
                  );
                  setMessage(
                    `Dear ${recipientName},\n\nThank you for your generous contribution of time and effort as a volunteer. Your service has made a meaningful impact on our community.\n\nPlease find attached your Certificate of Appreciation as recognition of your dedication and compassionate service.\n\nWe deeply appreciate your commitment to making a difference.\n\nWith gratitude,\nYour Organization`
                  );
                }}
                disabled={isSending}
                className="px-3 py-1 text-sm"
              >
                Volunteer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubject(
                    `Your Workshop Certificate of Participation - ${recipientName}`
                  );
                  setMessage(
                    `Dear ${recipientName},\n\nThank you for your active participation in our workshop. Your engagement and enthusiasm contributed to a dynamic learning environment.\n\nAttached is your Certificate of Participation, acknowledging your hands-on involvement and skill development.\n\nWe hope you found the workshop valuable and applicable to your goals.\n\nBest regards,\nYour Organization`
                  );
                }}
                disabled={isSending}
                className="px-3 py-1 text-sm"
              >
                Workshop
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubject(
                    `Welcome - Your Membership Certificate - ${recipientName}`
                  );
                  setMessage(
                    `Dear ${recipientName},\n\nWelcome! We are thrilled to have you as a member of our organization.\n\nYour membership certificate is attached, validating your official membership status. This certificate represents your connection to our community and the benefits that come with it.\n\nWe look forward to your active participation and engagement.\n\nWarm regards,\nYour Organization`
                  );
                }}
                disabled={isSending}
                className="px-3 py-1 text-sm"
              >
                Membership
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubject(
                    `Compliance Training Certificate - ${recipientName}`
                  );
                  setMessage(
                    `Dear ${recipientName},\n\nThis certifies that you have successfully completed the required compliance training program.\n\nYour Compliance Certificate is attached for your records. Please retain this certificate as proof of completion for regulatory and organizational requirements.\n\nThank you for your commitment to maintaining compliance standards.\n\nBest regards,\nYour Organization`
                  );
                }}
                disabled={isSending}
                className="px-3 py-1 text-sm"
              >
                Compliance
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubject(
                    `Congratulations! Your Competition Award Certificate - ${recipientName}`
                  );
                  setMessage(
                    `Dear ${recipientName},\n\nCongratulations on your outstanding performance in the competition! Your talent, creativity, and hard work have earned you this well-deserved recognition.\n\nYour Competition Award Certificate is attached. Wear this achievement with pride!\n\nWe celebrate your success and look forward to your continued excellence.\n\nBest regards,\nYour Organization`
                  );
                }}
                disabled={isSending}
                className="px-3 py-1 text-sm"
              >
                Competition
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubject(
                    `Thank You for Speaking at Our Event - ${recipientName}`
                  );
                  setMessage(
                    `Dear ${recipientName},\n\nThank you for sharing your expertise and insights as a speaker at our event. Your presentation was engaging, informative, and greatly appreciated by all attendees.\n\nPlease find attached your Certificate of Appreciation for your valuable contribution to knowledge sharing and professional development.\n\nWe hope to collaborate with you again in the future.\n\nWith appreciation,\nYour Organization`
                  );
                }}
                disabled={isSending}
                className="px-3 py-1 text-sm"
              >
                Speaker
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Choose a preset to auto-fill subject and message
            </p>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Email Message <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrorMessage("");
              }}
              disabled={isSending}
              rows={6}
              className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-600 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 The certificate will be attached automatically
            </p>
          </div>

          {/* Status Messages */}
          {sendStatus === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <Check className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">
                Certificate sent successfully! ✨
              </span>
            </div>
          )}

          {sendStatus === "error" && errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <X className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Failed to send certificate</p>
                <p className="text-xs mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && sendStatus === "idle" && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <X className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 shrink-0 bg-white dark:bg-zinc-900">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || sendStatus === "success"}
            className="bg-(--primary-600) hover:bg-(--primary-700) text-white disabled:bg-(--neutral-300) disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : sendStatus === "success" ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Sent!
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Certificate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
