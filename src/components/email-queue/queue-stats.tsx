"use client";

import { motion } from "framer-motion";
import { EmailQueueStats } from "@/types/email-queue";
import { Mail, Clock, CheckCircle, XCircle } from "lucide-react";

interface QueueStatsProps {
  stats: EmailQueueStats;
}

const statVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
  },
};

export default function QueueStats({ stats }: QueueStatsProps) {
  const statItems = [
    {
      label: "Total",
      value: stats.total,
      color: "blue",
      icon: Mail,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      textColor: "text-blue-600 dark:text-blue-300",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "yellow",
      icon: Clock,
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      textColor: "text-yellow-600 dark:text-yellow-300",
      valueColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Sent",
      value: stats.sent,
      color: "green",
      icon: CheckCircle,
      bgColor: "bg-green-100 dark:bg-green-900",
      textColor: "text-green-600 dark:text-green-300",
      valueColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Failed",
      value: stats.failed,
      color: "red",
      icon: XCircle,
      bgColor: "bg-red-100 dark:bg-red-900",
      textColor: "text-red-600 dark:text-red-300",
      valueColor: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial="hidden"
            animate="visible"
            variants={statVariants}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-gray-200 dark:border-zinc-700 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <motion.p
                  key={stat.value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-2xl font-bold ${stat.valueColor}`}
                >
                  {stat.value}
                </motion.p>
              </div>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`p-3 ${stat.bgColor} rounded-full`}
              >
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
