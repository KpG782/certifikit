"use client";

import type { ComponentProps } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmailQueueItem } from "@/types/email-queue";
import { MoreVertical, Eye, Trash2, Send, Ban, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface QueueTableProps {
  items: EmailQueueItem[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onDelete: (id: number) => void;
  onSend: (id: number) => void;
  onCancel: (id: number) => void;
  onRetry: (id: number) => void;
  onView: (item: EmailQueueItem) => void;
}

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export default function QueueTable({
  items,
  selectedIds,
  onSelectionChange,
  onDelete,
  onSend,
  onCancel,
  onRetry,
  onView,
}: QueueTableProps) {
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map((item) => item.id));
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: ComponentProps<typeof Badge>["variant"];
        className: string;
        icon?: string;
      }
    > = {
      pending: {
        variant: "secondary",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      },
      sending: {
        variant: "default",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      },
      sent: {
        variant: "default",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      },
      failed: {
        variant: "destructive",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
      cancelled: {
        variant: "secondary",
        className:
          "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      },
    };

    const config = variants[status] || variants.pending;

    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <Badge variant={config.variant} className={config.className}>
          {status === "sending" && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block mr-1"
            >
              ⟳
            </motion.span>
          )}
          {status.toUpperCase()}
        </Badge>
      </motion.div>
    );
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700"
      >
        <p className="text-gray-500 dark:text-gray-400">
          No emails in queue. Add certificates from the generator!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-200 dark:border-zinc-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.tr
                key={item.id}
                custom={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="border-b border-(neutral-200) dark:border-(neutral-800) hover:bg-(neutral-50) dark:hover:bg-(neutral-900) transition-colors"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => handleSelectOne(item.id)}
                    aria-label={`Select ${item.recipientEmail}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {item.recipientName}
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {item.recipientEmail}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {item.subject}
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {format(new Date(item.createdAt), "MMM dd, yyyy HH:mm")}
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {item.sentAt
                    ? format(new Date(item.sentAt), "MMM dd, yyyy HH:mm")
                    : "-"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(item)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {item.status === "pending" && (
                        <DropdownMenuItem onClick={() => onSend(item.id)}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Now
                        </DropdownMenuItem>
                      )}
                      {item.status === "pending" && (
                        <DropdownMenuItem onClick={() => onCancel(item.id)}>
                          <Ban className="w-4 h-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                      {(item.status === "failed" ||
                        item.status === "cancelled") && (
                        <DropdownMenuItem onClick={() => onRetry(item.id)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {item.status === "failed" ? "Retry" : "Continue"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onDelete(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
