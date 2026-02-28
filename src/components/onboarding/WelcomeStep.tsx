"use client";

/**
 * Step 1: Welcome Component
 * Introduction screen for Duitly onboarding
 */

import { motion } from "framer-motion";
import { Wallet, Sparkles, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { setWelcomed } = useOnboarding();

  const handleStart = () => {
    setWelcomed(true);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
    >
      {/* Logo/Icon Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
          <Wallet className="w-12 h-12 text-primary" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-6 h-6 text-secondary" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
      >
        Welcome to Duitly
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-lg md:text-xl text-muted max-w-md mb-8"
      >
        Your AI-powered smart budgeting companion. Let&apos;s build your path to financial freedom.
      </motion.p>

      {/* Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="grid grid-cols-3 gap-4 mb-12 w-full max-w-md"
      >
        {[
          { icon: Wallet, label: "Budget Smart" },
          { icon: Sparkles, label: "AI Insights" },
          { icon: ArrowRight, label: "Track Goals" },
        ].map((feature, index) => (
          <div
            key={feature.label}
            className="flex flex-col items-center p-4 rounded-2xl bg-surface border border-border"
          >
            <feature.icon className="w-6 h-6 text-secondary mb-2" />
            <span className="text-xs text-muted">{feature.label}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleStart}
        className="group relative px-8 py-4 bg-primary text-black font-semibold rounded-2xl flex items-center gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
      >
        Start Your Journey
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* Privacy Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-xs text-muted mt-6"
      >
        Your data is secure and used only for personalized insights
      </motion.p>
    </motion.div>
  );
}
