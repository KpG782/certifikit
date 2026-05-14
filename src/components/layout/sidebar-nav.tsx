"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Award, Layout, Mail } from "lucide-react";

export default function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard",
      color: "text-(primary-600) dark:text-(primary-300)",
      bgColor: "bg-(primary-100) dark:bg-(primary-900)/30",
      hoverBg:
        "hover:bg-(primary-50) dark:hover:bg-(primary-900)/20",
    },
    {
      name: "Generator",
      icon: Award,
      path: "/generator",
      color: "text-(accent-600) dark:text-(accent-300)",
      bgColor: "bg-(accent-100) dark:bg-(accent-900)/30",
      hoverBg:
        "hover:bg-(accent-50) dark:hover:bg-(accent-900)/20",
    },
    {
      name: "Templates",
      icon: Layout,
      path: "/templates",
      color: "text-(primary-700) dark:text-(primary-200)",
      bgColor: "bg-(primary-200) dark:bg-(primary-800)/30",
      hoverBg:
        "hover:bg-(primary-100) dark:hover:bg-(primary-800)/20",
    },
    {
      name: "Email Queue",
      icon: Mail,
      path: "/email-queue",
      color: "text-(accent-700) dark:text-(accent-200)",
      bgColor: "bg-(accent-200) dark:bg-(accent-800)/30",
      hoverBg:
        "hover:bg-(accent-100) dark:hover:bg-(accent-800)/20",
    },
  ];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-3 border border-gray-200 dark:border-zinc-700"
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <motion.button
            key={item.path}
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(item.path)}
            className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isActive
                ? `${item.bgColor} ${item.color} shadow-md`
                : `text-gray-600 dark:text-gray-400 ${item.hoverBg}`
            }`}
            title={item.name}
          >
            <Icon className="w-6 h-6" />

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-zinc-700 text-white text-sm rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {item.name}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-zinc-700"></div>
            </motion.div>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 ${item.bgColor} rounded-full`}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
