"use client";

/**
 * Step 2: Dream Setting Component
 * User describes their financial dream/goal
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Home, Globe, Award, Briefcase } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";

interface DreamSettingStepProps {
  onNext: () => void;
}

const dreamExamples = [
  {
    icon: Target,
    title: "Emergency Fund",
    description: "Build an emergency fund of 6 months expenses",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Home,
    title: "Home Ownership",
    description: "Save for a down payment on a house",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Globe,
    title: "Financial Freedom",
    description: "Achieve financial independence and retire early",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Briefcase,
    title: "Business Goal",
    description: "Build a successful business or startup",
    color: "from-orange-500 to-amber-500",
  },
];

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
      className="flex flex-col px-4 md:px-8 py-8"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary/20 to-primary/20 mb-6"
        >
          <Sparkles className="w-10 h-10 text-secondary" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          What&apos;s Your Dream?
        </h2>
        <p className="text-muted text-base md:text-lg max-w-md mx-auto">
          Describe your biggest financial goal or dream
        </p>
      </div>

      {/* Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-3">
          Your Dream Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="I want to achieve financial freedom by 40, buy a house for my family, travel the world, or build a successful business..."
          rows={6}
          className="w-full px-6 py-5 rounded-2xl bg-background border-2 border-border focus:border-secondary focus:outline-none transition-colors resize-none text-base md:text-lg"
        />
        <p className="text-xs text-muted mt-3">
          Be specific about what you want to achieve
        </p>
      </div>

      {/* Example Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {dreamExamples.map((dream, index) => {
          const Icon = dream.icon;
          return (
            <motion.button
              key={dream.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (index * 0.1) }}
              whileHover={{ scale: 1.02, x: 4 }}
              onClick={() => setDescription(dream.description)}
              className="p-4 rounded-2xl bg-surface border border-border hover:border-secondary/50 transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dream.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">{dream.title}</p>
                  <p className="text-xs text-muted leading-relaxed">
                    {dream.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={handleContinue}
        disabled={description.trim().length === 0}
        className="w-full py-4 md:py-5 rounded-2xl bg-secondary text-black font-semibold text-base md:text-lg hover:bg-secondary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-secondary/25"
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
