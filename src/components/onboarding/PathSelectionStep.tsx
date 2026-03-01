"use client";

/**
 * Step 1: Path Selection Component
 * User chooses between Conservative or Active Compounder investment path
 */

import { motion } from "framer-motion";
import { Shield, TrendingUp, Check, Sparkles } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";
import { InvestmentPath } from "@/types/onboarding";

const investmentPaths = [
  {
    id: "conservative" as InvestmentPath,
    title: "Conservative",
    subtitle: "Safe & Steady",
    description: "Low-risk investments with stable returns. Perfect for building a solid foundation.",
    icon: Shield,
    features: ["Capital preservation", "Steady growth", "Lower volatility", "Bond-heavy"],
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    id: "active-compounder" as InvestmentPath,
    title: "Active Compounder",
    subtitle: "Growth Focused",
    description: "Higher risk tolerance for maximum long-term growth through compound interest.",
    icon: TrendingUp,
    features: ["Aggressive growth", "Market exposure", "Higher potential returns", "Stock-heavy"],
    gradient: "from-purple-500 to-pink-600",
    bgGradient: "from-purple-500/10 to-pink-500/10",
  },
] as const;

export function PathSelectionStep({ onNext }: { onNext: () => void }) {
  const { data, setInvestmentPath } = useOnboarding();
  const selectedPath = data.investmentPath;

  const handleContinue = () => {
    if (selectedPath) {
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
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-6"
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Choose Your Path
        </h2>
        <p className="text-muted text-base md:text-lg max-w-md mx-auto">
          Select the investment approach that matches your goals and risk tolerance
        </p>
      </div>

      {/* Path Cards */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6 flex-1 mb-8">
        {investmentPaths.map((path, index) => {
          const isSelected = selectedPath === path.id;
          const Icon = path.icon;

          return (
            <motion.button
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setInvestmentPath(path.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 md:p-8 rounded-3xl border-2 transition-all duration-300 text-left group ${
                isSelected
                  ? `bg-gradient-to-br ${path.bgGradient} border-primary`
                  : "bg-surface border-border hover:border-primary/50"
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-5 h-5 text-black" />
                </motion.div>
              )}

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${path.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl md:text-2xl font-bold mb-2">{path.title}</h3>
              <p className="text-sm text-primary font-medium mb-4">{path.subtitle}</p>
              <p className="text-muted text-sm md:text-base mb-6 leading-relaxed">
                {path.description}
              </p>

              <ul className="space-y-2">
                {path.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${path.gradient}`} />
                    <span>{feature}</span>
                  </li>
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
        transition={{ delay: 0.4 }}
        onClick={handleContinue}
        disabled={!selectedPath}
        className="w-full py-4 md:py-5 rounded-2xl bg-primary text-black font-semibold text-base md:text-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
