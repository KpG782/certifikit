"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import QueueStats from "@/components/email-queue/queue-stats";
import QueueFilters from "@/components/email-queue/queue-filters";
import QueueActions from "@/components/email-queue/queue-actions";
import QueueTable from "@/components/email-queue/queue-table";
import SidebarNav from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  EmailQueueItem,
  EmailQueueFilters,
  EmailQueueStats,
} from "@/types/email-queue";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

export default function EmailQueuePage() {
  const router = useRouter();
  const [items, setItems] = useState<EmailQueueItem[]>([]);
  const [stats, setStats] = useState<EmailQueueStats>({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
  });
  const [filters, setFilters] = useState<EmailQueueFilters>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [viewItem, setViewItem] = useState<EmailQueueItem | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch queue items
  const fetchQueue = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const response = await fetch(`/api/email-queue?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.data);
        setStats(data.stats);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch queue:", error);
      alert("Failed to load email queue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    // Auto-refresh every 5 seconds to show real-time status updates from n8n
    const interval = setInterval(() => {
      fetchQueue();
    }, 5000);

    return () => clearInterval(interval);
  }, [filters]);

  // Send selected emails
  const handleSendSelected = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = confirm(
      `Send ${selectedIds.length} email(s)? This requires internet connection.`
    );
    if (!confirmed) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/batch-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setSelectedIds([]);
        fetchQueue();
      } else {
        alert("Failed to send emails: " + data.error);
      }
    } catch (error) {
      console.error("Send error:", error);
      alert("Network error. Please check your internet connection.");
    } finally {
      setIsSending(false);
    }
  };

  // Send single email directly via n8n webhook
  const handleSendOne = async (id: number) => {
    const confirmed = confirm("Send this email now?");
    if (!confirmed) return;

    setIsSending(true);
    try {
      // Find the item from the current items list
      const item = items.find((i) => i.id === id);
      if (!item) {
        alert("Email not found in queue");
        return;
      }

      // Update status to "sending" immediately
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "sending" } : i))
      );

      // Call the send-certificate API which uses n8n webhook
      const response = await fetch("/api/send-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: item.recipientEmail,
          subject: item.subject,
          message: item.message,
          certificateImage: item.certificateImage,
          recipientName: item.recipientName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update status to "sent" in database
        await fetch("/api/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.id,
            status: "sent",
            sentAt: new Date().toISOString(),
          }),
        });

        alert("Email sent successfully!");
        fetchQueue();
      } else {
        // Mark as failed
        await fetch("/api/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.id,
            status: "failed",
            errorMessage: data.error || "Failed to send email",
          }),
        });

        alert("Failed to send email: " + data.error);
        fetchQueue();
      }
    } catch (error) {
      console.error("Send error:", error);

      // Mark as failed on network error
      try {
        await fetch("/api/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: id,
            status: "failed",
            errorMessage:
              error instanceof Error ? error.message : "Network error",
          }),
        });
      } catch (e) {
        console.error("Failed to update status:", e);
      }

      alert("Network error. Please check your internet connection.");
      fetchQueue();
    } finally {
      setIsSending(false);
    }
  };

  // Delete selected emails
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = confirm(
      `Delete ${selectedIds.length} email(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/email-queue?id=${id}`, { method: "DELETE" })
        )
      );

      setSelectedIds([]);
      fetchQueue();
      alert("Deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete emails");
    }
  };

  // Delete single email
  const handleDeleteOne = async (id: number) => {
    const confirmed = confirm("Delete this email? This cannot be undone.");
    if (!confirmed) return;

    try {
      await fetch(`/api/email-queue?id=${id}`, { method: "DELETE" });
      fetchQueue();
      alert("Deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete email");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6"
    >
      {/* Floating Sidebar Navigation */}
      <SidebarNav />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/generator")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Generator
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Mail className="w-8 h-8 text-blue-600" />
                Email Queue
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                Manage and send certificate emails
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live (updates every 5s)
                </motion.span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last refresh: {lastRefresh.toLocaleTimeString()}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <QueueStats stats={stats} />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <QueueFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => setFilters({})}
          />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <QueueActions
            selectedCount={selectedIds.length}
            onSendSelected={handleSendSelected}
            onDeleteSelected={handleDeleteSelected}
            onRefresh={fetchQueue}
            isSending={isSending}
          />
        </motion.div>

        {/* Table */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading email queue...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <QueueTable
                items={items}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onDelete={handleDeleteOne}
                onSend={handleSendOne}
                onView={setViewItem}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Item Dialog */}
        <AnimatePresence>
          {viewItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setViewItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, type: "spring" }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-gray-200 dark:border-zinc-700 shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      Email Details
                    </h2>
                    <button
                      onClick={() => setViewItem(null)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
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
                  </div>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                        Recipient Name
                      </label>
                      <p className="text-lg font-medium">
                        {viewItem.recipientName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                        Email Address
                      </label>
                      <p className="text-lg font-medium">
                        {viewItem.recipientEmail}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                      Subject
                    </label>
                    <p className="text-lg">{viewItem.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                      Message
                    </label>
                    <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <p className="text-sm whitespace-pre-wrap">
                        {viewItem.message}
                      </p>
                    </div>
                  </div>
                  {viewItem.errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <label className="text-sm font-semibold text-red-600 dark:text-red-400 block mb-2">
                        Error Message
                      </label>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {viewItem.errorMessage}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                      Certificate Preview
                    </label>
                    <div className="border-2 border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800">
                      <img
                        src={viewItem.certificateImage}
                        alt="Certificate"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 shrink-0 bg-white dark:bg-zinc-900">
                  {viewItem.status === "pending" && (
                    <Button
                      onClick={() => {
                        setViewItem(null);
                        handleSendOne(viewItem.id);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Now
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setViewItem(null)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
