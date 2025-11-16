"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, Trash2, RefreshCw, Loader2 } from "lucide-react";

interface QueueActionsProps {
  selectedCount: number;
  onSendSelected: () => void;
  onDeleteSelected: () => void;
  onRefresh: () => void;
  isSending: boolean;
}

export default function QueueActions({
  selectedCount,
  onSendSelected,
  onDeleteSelected,
  onRefresh,
  isSending,
}: QueueActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 mb-6"
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onSendSelected}
          disabled={selectedCount === 0 || isSending}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {isSending
            ? "Sending..."
            : `Send ${selectedCount > 0 ? `(${selectedCount})` : "Selected"}`}
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onDeleteSelected}
          disabled={selectedCount === 0 || isSending}
          variant="destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete {selectedCount > 0 ? `(${selectedCount})` : "Selected"}
        </Button>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="ml-auto"
      >
        <Button onClick={onRefresh} disabled={isSending} variant="outline">
          <motion.div
            animate={{ rotate: isSending ? 360 : 0 }}
            transition={{
              duration: 1,
              repeat: isSending ? Infinity : 0,
              ease: "linear",
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
          </motion.div>
          Refresh
        </Button>
      </motion.div>
    </motion.div>
  );
}
