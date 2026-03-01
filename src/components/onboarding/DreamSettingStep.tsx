"use client";

/**
 * Step 2: Dream Setting Component
 * User describes their financial dream/goal
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Target } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";

interface DreamSettingStepProps {
  onNext: () => void;
}

export function DreamSettingStep({ onNext }: DreamSettingStepProps) {
  const { data, setDreamDescription } = useOnboarding();
  const [description, setDescription] = useState(data.dreamDescription || "");

  const handleContinue = () => {
    if (description.trim().length > 0) {
      setDreamDescription(description);
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
          <Sparkles className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">What&apos;s Your Dream?</h2>
        <p className="text-muted">
          Describe your biggest financial goal or dream
        </p>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          Your Dream Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="I want to achieve financial freedom by 40, buy a house for my family, travel the world, or build a successful business..."
          rows={6}
          className="w-full px-4 py-4 rounded-2xl bg-background border-2 border-border focus:border-secondary focus:outline-none transition-colors resize-none"
        />
        <p className="text-xs text-muted mt-2">
          Be specific about what you want to achieve
        </p>
      </div>

      {/* Example Cards */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setDescription("Build an emergency fund of 6 months expenses")}
          className="p-4 rounded-2xl bg-surface border border-border cursor-pointer hover:border-secondary/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-secondary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Emergency Fund</p>
              <p className="text-xs text-muted mt-1">
                Build an emergency fund of 6 months expenses
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setDescription("Save for a down payment on a house")}
          className="p-4 rounded-2xl bg-surface border border-border cursor-pointer hover:border-secondary/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-secondary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Home Ownership</p>
              <p className="text-xs text-muted mt-1">
                Save for a down payment on a house
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setDescription("Achieve financial independence and retire early")}
          className="p-4 rounded-2xl bg-surface border border-border cursor-pointer hover:border-secondary/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-secondary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Financial Independence</p>
              <p className="text-xs text-muted mt-1">
                Achieve financial independence and retire early
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Continue Button */}
      <motion.button
        onClick={handleContinue}
        disabled={description.trim().length === 0}
        whileHover={{ scale: description.trim().length > 0 ? 1.02 : 1 }}
        whileTap={{ scale: description.trim().length > 0 ? 0.98 : 1 }}
        className={`w-full py-4 rounded-2xl font-semibold transition-all ${
          description.trim().length > 0
            ? "bg-secondary text-black"
            : "bg-surface-hover text-muted cursor-not-allowed"
        }`}
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
