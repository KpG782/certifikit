// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import OnboardingTour from "@/components/onboarding/tour";
import Image from "next/image";
import {
  HelpCircle,
  Home,
  FileText,
  Mail,
  Layout,
  Menu,
  X,
  Video,
} from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour) {
      // Show tour after a brief delay
      const timer = setTimeout(() => setShowTour(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem("hasSeenTour", "true");
  };

  const handleShowTour = () => {
    setShowTour(true);
  };

  const navigationItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      name: "Generator",
      icon: () => (
        <Image
          src="/favicon.png"
          alt="Certificate"
          width={20}
          height={20}
          className="object-contain"
        />
      ),
      path: "/generator",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      name: "Templates",
      icon: Layout,
      path: "/templates",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      name: "Email Queue",
      icon: Mail,
      path: "/email-queue",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      name: "Tutorials",
      icon: Video,
      path: "/tutorials",
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-900 overflow-x-hidden">
      {/* Onboarding Tour */}
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? (
          <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar Navigation */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 0 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex lg:flex-col lg:shrink-0 bg-white dark:bg-zinc-800 shadow-xl overflow-hidden border-r border-gray-200 dark:border-zinc-700"
      >
        <div className="p-6 h-full flex flex-col w-64">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200 dark:border-zinc-700">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <Image
                src="/favicon.png"
                alt="CertifiKit Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-xl">CertifiKit</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Certificate Generator
              </p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <motion.button
                  key={item.path}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    router.push(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all font-medium ${
                    isActive
                      ? `${item.bgColor} ${item.color} shadow-sm`
                      : "text-(--neutral-700) dark:text-(--neutral-300) hover:bg-(--neutral-100) dark:hover:bg-(--neutral-700)/50"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{item.name}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 space-y-4 border-t border-gray-200 dark:border-zinc-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowTour}
              className="w-full justify-start text-(--primary-600) hover:text-(--primary-700) hover:bg-(--primary-50) dark:hover:bg-(--primary-900)/30"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Show Guide
            </Button>

            <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Logged in as
              </p>
              <p className="text-sm font-semibold truncate mb-3">
                {user?.name}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Sidebar Toggle Button (Desktop) */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-r-lg shadow-lg hover:shadow-xl transition-all p-2"
        style={{ left: sidebarCollapsed ? 0 : 256 }}
        title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
      >
        <motion.div
          animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            className="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.div>
      </motion.button>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="lg:hidden fixed left-0 top-0 h-screen w-72 max-w-[85vw] bg-white dark:bg-zinc-800 shadow-xl z-40 overflow-y-auto"
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200 dark:border-zinc-700">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <Image
                src="/favicon.png"
                alt="CertifiKit Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-xl">CertifiKit</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Certificate Generator
              </p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <motion.button
                  key={item.path}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    router.push(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all font-medium ${
                    isActive
                      ? `${item.bgColor} ${item.color} shadow-sm`
                      : "text-(--neutral-700) dark:text-(--neutral-300) hover:bg-(--neutral-100) dark:hover:bg-(--neutral-700)/50"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{item.name}</span>
                </motion.button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 space-y-4 border-t border-gray-200 dark:border-zinc-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowTour}
              className="w-full justify-start text-(--primary-600) hover:text-(--primary-700) hover:bg-(--primary-50) dark:hover:bg-(--primary-900)/30"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Show Guide
            </Button>

            <div className="p-4 bg-linear-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Logged in as
              </p>
              <p className="text-sm font-semibold truncate mb-3">
                {user?.name}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col w-full overflow-x-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-zinc-800 shadow-sm border-b border-gray-200 dark:border-zinc-700 sticky top-0 z-10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold ml-12 lg:ml-0">
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user?.name}
              </span>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 ml-0 lg:ml-0">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-8 lg:mb-10"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 lg:mb-3 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back!
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Create and manage your certificates with ease
              </p>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                transition={{ delay: 0, duration: 0.4, type: "spring" }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 cursor-pointer"
                data-tour="create-new"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Create New Certificate
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Start creating a new certificate from scratch
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => router.push("/generator")}
                    className="w-full"
                  >
                    Create Now
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 cursor-pointer"
              >
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Email Queue</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Manage and send certificate emails
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => router.push("/email-queue")}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Open Queue
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 cursor-pointer"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Templates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Browse and manage certificate templates
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => router.push("/templates")}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    View Templates
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 cursor-pointer"
              >
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Learn with step-by-step video guides
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => router.push("/tutorials")}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    Watch Now
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{`Click "Create New Certificate" to start designing`}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Upload your certificate template or use a default one
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Add text fields, signatures (images), and customize fonts
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Drag and position elements on the certificate</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Add certificates to Email Queue to send later (works
                    offline!)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Download your finished certificate as PNG</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
