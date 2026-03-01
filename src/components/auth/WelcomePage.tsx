"use client";

/**
 * Welcome Page
 * Entry point for new users - choose between Login or Signup
 * Login: Direct access to dashboard
 * Signup: Starts onboarding flow
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Sparkles, Shield, Zap, ArrowLeft } from "lucide-react";
import Image from "next/image";

export function WelcomePage() {
  const router = useRouter();
  const [isHoveringLogin, setIsHoveringLogin] = useState(false);
  const [isHoveringSignup, setIsHoveringSignup] = useState(false);

  const handleLogin = () => {
    router.push("/auth/signin");
  };

  const handleSignup = () => {
    router.push("/onboarding");
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <Image
          src="/logohorizontal.png"
          alt="Duitly"
          width={120}
          height={32}
          className="object-contain"
          priority
        />
        <div className="w-16" /> {/* Spacer for balance */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to{" "}
              <span className="text-primary">Duitly</span>
            </h1>
            <p className="text-lg text-muted max-w-md mx-auto">
              Your AI-powered smart budgeting companion. Take control of your finances today.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-2xl bg-surface border border-border"
            >
              <Shield className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Secure & Private</h3>
              <p className="text-sm text-muted">Your financial data is encrypted and protected</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-2xl bg-surface border border-border"
            >
              <Zap className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">AI-Powered</h3>
              <p className="text-sm text-muted">Smart insights and automatic categorization</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-2xl bg-surface border border-border"
            >
              <Sparkles className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Smart Budgeting</h3>
              <p className="text-sm text-muted">Intelligent allocation and tracking</p>
            </motion.div>
          </div>

          {/* Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Login Card */}
            <motion.button
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              onClick={handleLogin}
              onMouseEnter={() => setIsHoveringLogin(true)}
              onMouseLeave={() => setIsHoveringLogin(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group p-8 rounded-3xl bg-surface border-2 border-border hover:border-primary/50 transition-all text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  isHoveringLogin ? "bg-primary" : "bg-primary/10"
                }`}>
                  <LogIn className={`w-7 h-7 transition-colors ${
                    isHoveringLogin ? "text-black" : "text-primary"
                  }`} />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
              <p className="text-muted mb-4">
                Already have an account? Sign in to access your dashboard.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <span>Sign In</span>
                <motion.span
                  animate={{ x: isHoveringLogin ? 4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  →
                </motion.span>
              </div>
            </motion.button>

            {/* Signup Card */}
            <motion.button
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              onClick={handleSignup}
              onMouseEnter={() => setIsHoveringSignup(true)}
              onMouseLeave={() => setIsHoveringSignup(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group p-8 rounded-3xl bg-surface border-2 border-border hover:border-primary/50 transition-all text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  isHoveringSignup ? "bg-primary" : "bg-primary/10"
                }`}>
                  <UserPlus className={`w-7 h-7 transition-colors ${
                    isHoveringSignup ? "text-black" : "text-primary"
                  }`} />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">New Here?</h2>
              <p className="text-muted mb-4">
                Create an account and start your personalized financial journey.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <span>Start Onboarding</span>
                <motion.span
                  animate={{ x: isHoveringSignup ? 4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  →
                </motion.span>
              </div>
            </motion.button>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted">
              By continuing, you agree to our{" "}
              <button className="text-primary hover:text-primary-hover transition-colors">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-primary hover:text-primary-hover transition-colors">
                Privacy Policy
              </button>
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-muted">
          © 2026 Duitly. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
