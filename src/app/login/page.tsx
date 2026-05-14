"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type Mode = "signin" | "signup";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-yellow-50">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const {
    isAuthenticated,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("signin");
  const [showEmail, setShowEmail] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (searchParams.get("error") === "auth_failed") {
      setError("Sign-in failed. Please try again.");
    }
  }, [searchParams]);

  const handleGoogle = async () => {
    setError("");
    setNotice("");
    setGoogleBusy(true);
    try {
      await signInWithGoogle();
      // Redirect to Google happens via Supabase; the rest of this function
      // won't run. We keep googleBusy true to dim the UI during the navigation.
    } catch (err) {
      setGoogleBusy(false);
      setError(
        err instanceof Error
          ? err.message
          : "Could not start Google sign-in. Try again."
      );
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        router.push("/dashboard");
      } else {
        const { needsEmailConfirmation } = await signUpWithEmail(
          email,
          password,
          fullName || undefined
        );
        if (needsEmailConfirmation) {
          setNotice(
            "Check your inbox to confirm your email, then sign in."
          );
          setMode("signin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "signin"
            ? "Invalid email or password."
            : "Could not create your account."
      );
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-yellow-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-linear-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200"
        >
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center bg-linear-to-br from-blue-600 to-blue-700 shadow-lg"
              >
                <Image
                  src="/favicon.png"
                  alt="CertifiKit Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </motion.div>
            </div>
            <h1
              className="font-bold text-2xl text-blue-800 mb-2"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              CertifiKit
            </h1>
            <p className="text-sm text-gray-600">
              {mode === "signin"
                ? "Welcome back — sign in to continue"
                : "Create your account in seconds"}
            </p>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}
            {notice && (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700"
              >
                {notice}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google — primary path */}
          <motion.button
            whileHover={{ scale: googleBusy ? 1 : 1.02 }}
            whileTap={{ scale: googleBusy ? 1 : 0.98 }}
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm font-medium text-gray-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            {googleBusy ? "Redirecting to Google..." : "Continue with Google"}
          </motion.button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              or
            </span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Email expander */}
          {!showEmail ? (
            <button
              type="button"
              onClick={() => setShowEmail(true)}
              className="w-full text-sm text-blue-700 hover:text-blue-800 font-medium underline-offset-2 hover:underline cursor-pointer"
            >
              Continue with email instead
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full name (optional)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={
                    mode === "signin" ? "Your password" : "At least 6 characters"
                  }
                />
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="w-full font-semibold py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy
                  ? mode === "signin"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                {mode === "signin" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setError("");
                        setNotice("");
                      }}
                      className="text-blue-700 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setError("");
                        setNotice("");
                      }}
                      className="text-blue-700 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </motion.form>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-gray-500 mt-6"
        >
          By continuing you agree to CertifiKit&apos;s terms of service.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.97 6.97 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
