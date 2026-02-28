"use client";

/**
 * SmartInsightCard Component
 * Displays AI-generated financial insights from Qwen
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, X, ChevronRight, Lightbulb } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { getSmartInsight } from "@/actions/insights";

export function SmartInsightCard() {
  const { insights, addInsight, markInsightRead } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadInsight = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getSmartInsight();
      if (result.success && result.insight) {
        setCurrentInsight(result.insight);
        addInsight({
          title: "Daily Financial Insight",
          content: result.insight,
          type: "advice",
        });
      }
    } catch (error) {
      console.error("Failed to load insight:", error);
      setCurrentInsight("Track your expenses consistently to build better financial habits. Small daily awareness leads to significant long-term improvements.");
    } finally {
      setIsLoading(false);
    }
  }, [addInsight]);

  useEffect(() => {
    // Load initial insight
    loadInsight();
  }, [loadInsight]);

  const handleDismiss = () => {
    markInsightRead(insights[0]?.id || "default");
    setIsExpanded(false);
    loadInsight();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border border-secondary/30 p-5"
    >
      {/* Animated Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"
      />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 text-secondary" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground">Smart Insight</h3>
            <p className="text-xs text-muted">Powered by Qwen AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-secondary/10 transition-colors"
          >
            <ChevronRight
              className={`w-4 h-4 text-secondary transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDismiss}
            className="p-2 rounded-lg hover:bg-danger/20 transition-colors"
          >
            <X className="w-4 h-4 text-muted hover:text-danger" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-4"
          >
            <Loader2 className="w-5 h-5 text-secondary animate-spin" />
            <p className="text-sm text-muted">Generating personalized insight...</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted leading-relaxed">
                {currentInsight || "Loading your personalized financial insight..."}
              </p>
            </div>

            {/* Expanded Tips */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-secondary/20"
                >
                  <h4 className="text-xs font-semibold text-secondary mb-3">
                    Quick Tips
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Review your transactions weekly",
                      "Set up automatic savings",
                      "Track recurring subscriptions",
                    ].map((tip, index) => (
                      <motion.li
                        key={tip}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 text-xs text-muted"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={loadInsight}
        disabled={isLoading}
        className="relative mt-4 w-full py-3 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors disabled:opacity-50"
      >
        <span className="text-sm font-medium text-secondary">
          {isLoading ? "Generating..." : "Get New Insight"}
        </span>
      </motion.button>
    </motion.div>
  );
}
