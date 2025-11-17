// src/app/tutorials/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/protected-route";
import { ArrowLeft, Play, FileText, Mail, Download } from "lucide-react";

const tutorials = [
  {
    id: 1,
    title: "Basic Certificate Creation",
    description:
      "Learn how to choose a template, add text, edit properties, and download your certificate",
    thumbnail: "/favicon.png",
    videoId: "c-a30rrxuJY",
    duration: "1:27",
    level: "Beginner",
    icon: FileText,
    color: "blue",
    steps: [
      "Choose or upload a certificate template",
      "Add text fields to your certificate",
      "Edit text properties (font, size, color, position)",
      "Download your certificate as PNG",
    ],
  },
  {
    id: 2,
    title: "Batch Certificate Generation",
    description:
      "Generate multiple certificates at once using CSV with dynamic {{name}} placeholders",
    thumbnail: "/favicon.png",
    videoId: "SA5cKbtJphU",
    duration: "3:00",
    level: "Intermediate",
    icon: Download,
    color: "purple",
    steps: [
      "Add {{name}} placeholder in your certificate text",
      "Download JSON or CSV sample file",
      "Edit the sample with recipient data",
      "Upload the updated CSV file",
      "Download all certificates as ZIP",
    ],
  },
  {
    id: 3,
    title: "Email Automation with n8n",
    description:
      "Set up automated email delivery with presets and Gmail integration (10 emails/day limit)",
    thumbnail: "/favicon.png",
    videoId: "7Km3GB_Tsuc",
    duration: "1:56",
    level: "Advanced",
    icon: Mail,
    color: "orange",
    steps: [
      "Complete basic certificate setup",
      "Click 'Send Email' button",
      "Enter recipient's Gmail address",
      "Choose or customize email preset",
      "Send email (limit: 10 per day)",
    ],
  },
];

const colorClasses = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "bg-blue-100 dark:bg-blue-900 text-blue-600",
    badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    icon: "bg-purple-100 dark:bg-purple-900 text-purple-600",
    badge:
      "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
    button: "bg-purple-600 hover:bg-purple-700",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    icon: "bg-orange-100 dark:bg-orange-900 text-orange-600",
    badge:
      "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300",
    button: "bg-orange-600 hover:bg-orange-700",
  },
};

function TutorialsContent() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const handlePlayVideo = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-zinc-800 shadow-sm border-b border-gray-200 dark:border-zinc-700 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Video Tutorials
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Learn how to use CertifiKit with step-by-step video guides
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tutorial Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial, index) => {
            const Icon = tutorial.icon;
            const colors =
              colorClasses[tutorial.color as keyof typeof colorClasses];

            return (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`bg-white dark:bg-zinc-800 rounded-xl shadow-lg border-2 ${colors.border} overflow-hidden hover:shadow-xl transition-shadow`}
              >
                {/* Thumbnail */}
                <div
                  className={`relative h-48 ${colors.bg} flex items-center justify-center group cursor-pointer`}
                  onClick={() => handlePlayVideo(tutorial.videoId)}
                >
                  <div
                    className={`w-20 h-20 rounded-full ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Play className="w-10 h-10 ml-1" fill="currentColor" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}
                    >
                      {tutorial.level}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {tutorial.duration}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">
                        {tutorial.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tutorial.description}
                      </p>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="mt-4 mb-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      What you'll learn:
                    </p>
                    <ul className="space-y-1.5">
                      {tutorial.steps.map((step, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="mr-2 text-gray-400">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handlePlayVideo(tutorial.videoId)}
                    className={`w-full ${colors.button} gap-2`}
                  >
                    <Play className="w-4 h-4" fill="currentColor" />
                    Watch Tutorial
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-12 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800"
        >
          <h3 className="text-xl font-bold mb-3">Need More Help?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Check out our documentation for detailed guides, API references, and
            troubleshooting tips.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() =>
                window.open("https://github.com/KpG782/certifikit", "_blank")
              }
              variant="outline"
            >
              📚 Documentation
            </Button>
            <Button
              onClick={() =>
                window.open(
                  "https://github.com/KpG782/certifikit/issues",
                  "_blank"
                )
              }
              variant="outline"
            >
              🐛 Report Issue
            </Button>
            <Button
              onClick={() =>
                window.open(
                  "https://github.com/KpG782/certifikit/discussions",
                  "_blank"
                )
              }
              variant="outline"
            >
              💬 Community
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handleCloseVideo}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseVideo}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Close video"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* YouTube Embed */}
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="Tutorial Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default function TutorialsPage() {
  return (
    <ProtectedRoute>
      <TutorialsContent />
    </ProtectedRoute>
  );
}
