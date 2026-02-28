"use client";

/**
 * Step 2: Path Selection Component
 * User chooses between Conservative or Active Compounder investment path
 * Enhanced with haptic feedback and touch interactions
 */

import { motion } from "framer-motion";
import { Shield, TrendingUp, Check } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";
import { InvestmentPath } from "@/types/onboarding";

interface PathSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

// Haptic feedback helper
function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

const investmentPaths = [
  {
    id: "conservative" as InvestmentPath,
    title: "Conservative",
    subtitle: "Steady & Safe",
    description: "Low-risk investments with stable returns. Perfect for building a solid foundation.",
    icon: Shield,
    features: ["Capital preservation", "Steady growth", "Lower volatility", "Bond-heavy"],
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "active-compounder" as InvestmentPath,
    title: "Active Compounder",
    subtitle: "Growth Focused",
    description: "Higher risk tolerance for maximum long-term growth through compound interest.",
    icon: TrendingUp,
    features: ["Aggressive growth", "Market exposure", "Higher potential returns", "Stock-heavy"],
    gradient: "from-purple-400 to-pink-500",
  },
] as const;

export function PathSelectionStep({ onNext, onBack }: PathSelectionStepProps) {
  const { data, setInvestmentPath } = useOnboarding();
  const selectedPath = data.investmentPath;

  const handleSelect = (path: InvestmentPath) => {
    triggerHaptic(20);
    setInvestmentPath(path);
  };

  const handleContinue = () => {
    if (selectedPath) {
      triggerHaptic([30, 50, 30]);
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col min-h-[60vh] px-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-3"
        >
          Choose Your Path
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted"
        >
          Select the investment approach that matches your goals
        </motion.p>
      </div>

      {/* Path Cards */}
      <div className="grid md:grid-cols-2 gap-4 flex-1 mb-8">
        {investmentPaths.map((path, index) => {
          const isSelected = selectedPath === path.id;
          const Icon = path.icon;

          return (
            <motion.button
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => handleSelect(path.id)}
              onMouseEnter={() => triggerHaptic(5)}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 rounded-3xl border-2 text-left transition-all duration-300 ${
                isSelected
                  ? "border-primary bg-surface shadow-xl shadow-primary/10"
                  : "border-border bg-surface hover:border-secondary/50"
              }`}
            >
              {/* Selection Indicator with Pulse */}
              <motion.div
                initial={false}
                animate={{ scale: isSelected ? 1 : 0 }}
                className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-black" />
              </motion.div>
              
              {/* Selection Glow */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  rotate: index === 0 ? [0, 1, -1, 0] : [0, -1, 1, 0],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${path.gradient} flex items-center justify-center mb-4`}
              >
                <Icon className="w-7 h-7 text-black" />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-1">{path.title}</h3>
              <p className="text-sm text-secondary mb-3">{path.subtitle}</p>
              <p className="text-sm text-muted mb-4">{path.description}</p>

              {/* Features */}
              <ul className="space-y-2">
                {path.features.map((feature, featureIndex) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + featureIndex * 0.1 }}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: featureIndex * 0.3
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.button>
          );
        })}
      </div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleContinue}
        disabled={!selectedPath}
        className={`w-full py-4 rounded-2xl font-semibold transition-all ${
          selectedPath
            ? "bg-primary text-black hover:bg-primary-hover"
            : "bg-surface text-muted cursor-not-allowed"
        }`}
        whileHover={selectedPath ? { scale: 1.02, y: -2 } : {}}
        whileTap={selectedPath ? { scale: 0.98 } : {}}
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
