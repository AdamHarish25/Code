"use client";

/**
 * AIBudgetGenerator Component
 * Trigger that sends user's total income and Dream goals to Qwen AI API
 * to return suggested category breakdown
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { generateAIBudget } from "@/actions/budgeting";
import { BudgetSuggestion } from "@/types/dashboard";

interface AIBudgetGeneratorProps {
  onBudgetGenerated?: () => void;
}

export function AIBudgetGenerator({ onBudgetGenerated }: AIBudgetGeneratorProps) {
  const {
    incomeSources,
    goals,
    categoryAllocations,
    setCategoryAllocation,
    allocationStatus,
  } = useDashboard();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<BudgetSuggestion[]>([]);
  const [aiInsight, setAiInsight] = useState("");
  const [step, setStep] = useState<"idle" | "generating" | "review" | "applied">("idle");

  const totalIncome = allocationStatus?.totalIncome || 0;

  const handleGenerateBudget = async () => {
    if (totalIncome === 0) return;

    setIsGenerating(true);
    setStep("generating");

    try {
      const result = await generateAIBudget({
        totalIncome,
        goals: goals.map((g) => ({
          name: g.name,
          targetAmount: g.targetAmount,
          priority: g.priority,
        })),
        existingCategories: categoryAllocations,
      });

      if (result.success && result.response) {
        setGeneratedSuggestions(result.response.suggestions);
        setAiInsight(result.response.insight);
        setStep("review");
      }
    } catch (error) {
      console.error("Failed to generate budget:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySuggestions = () => {
    generatedSuggestions.forEach((suggestion) => {
      const categoryMap: Record<string, any> = {
        "Rent & Utilities": { category: "housing", isEssential: true },
        "Food and Beverage": { category: "food", isEssential: true },
        "Public Transport": { category: "transport", isEssential: true },
        Healthcare: { category: "healthcare", isEssential: true },
        Entertainment: { category: "entertainment", isEssential: false },
        Shopping: { category: "shopping", isEssential: false },
        "Emergency Fund": { category: "savings", isEssential: true },
        Investment: { category: "investment", isEssential: true },
      };

      const mapped = categoryMap[suggestion.category] || {
        category: "other",
        isEssential: false,
      };

      const colorMap: Record<string, string> = {
        housing: "#3B82F6",
        food: "#F97316",
        transport: "#EAB308",
        healthcare: "#EF4444",
        entertainment: "#A855F7",
        shopping: "#EC4899",
        savings: "#22C55E",
        investment: "#10B981",
        other: "#6B7280",
      };

      setCategoryAllocation({
        name: suggestion.category,
        category: mapped.category,
        allocatedAmount: suggestion.suggestedAmount,
        spentAmount: 0,
        isEssential: mapped.isEssential,
        impactIndicator: mapped.isEssential ? "high" : "medium",
        color: colorMap[mapped.category] || "#6B7280",
      });
    });

    setStep("applied");
    onBudgetGenerated?.();

    setTimeout(() => {
      setStep("idle");
      setGeneratedSuggestions([]);
      setAiInsight("");
    }, 3000);
  };

  const handleCancel = () => {
    setStep("idle");
    setGeneratedSuggestions([]);
    setAiInsight("");
  };

  const hasIncome = totalIncome > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-gradient-to-br from-secondary/10 to-primary/10 border border-secondary/20"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-secondary/20">
          <Sparkles className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Auto Generate Budget with AI</h3>
          <p className="text-sm text-muted">
            Let Qwen AI create optimal allocations for you
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Income Check */}
            {!hasIncome ? (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 mb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-danger" />
                  <div>
                    <p className="text-sm font-medium text-danger">
                      No Income Added
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Add your income sources first to generate AI budget
                      allocations.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Total Monthly Income</span>
                  <span className="text-lg font-bold text-primary">
                    ${totalIncome.toLocaleString()}
                  </span>
                </div>
                {goals.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <CheckCircle2 className="w-3 h-3 text-secondary" />
                    {goals.length} financial goal{goals.length > 1 ? "s" : ""}{" "}
                    will be considered
                  </div>
                )}
              </div>
            )}

            <motion.button
              whileHover={hasIncome ? { scale: 1.02 } : {}}
              whileTap={hasIncome ? { scale: 0.98 } : {}}
              onClick={handleGenerateBudget}
              disabled={!hasIncome}
              className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                hasIncome
                  ? "bg-secondary text-black hover:bg-secondary-hover"
                  : "bg-surface-hover text-muted cursor-not-allowed"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Generate AI Budget
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {step === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Loader2 className="w-10 h-10 text-secondary" />
            </motion.div>
            <p className="text-sm font-medium mb-2">
              Analyzing your financial profile...
            </p>
            <p className="text-xs text-muted">
              Qwen AI is creating optimal allocations based on your income and
              goals
            </p>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* AI Insight */}
            <div className="p-4 rounded-xl bg-background border border-border mb-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">AI Insight</p>
                  <p className="text-xs text-muted">{aiInsight}</p>
                </div>
              </div>
            </div>

            {/* Suggestions Preview */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-3">
                Suggested Allocations ({generatedSuggestions.length})
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {generatedSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-xl bg-background border border-border flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{suggestion.category}</p>
                      <p className="text-xs text-muted">
                        {suggestion.percentage.toFixed(0)}% • {suggestion.reasoning.slice(0, 50)}...
                      </p>
                    </div>
                    <p className="text-sm font-bold text-primary">
                      ${suggestion.suggestedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApplySuggestions}
                className="flex-1 py-3 rounded-xl bg-primary text-black font-medium text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply All Suggestions
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl bg-surface-hover text-muted font-medium text-sm"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "applied" && (
          <motion.div
            key="applied"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="py-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-success-dim flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-success" />
            </motion.div>
            <p className="text-lg font-semibold mb-1">Budget Applied!</p>
            <p className="text-sm text-muted">
              {generatedSuggestions.length} categories have been created
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regenerate Option */}
      {categoryAllocations.length > 0 && step === "idle" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleGenerateBudget}
          className="mt-4 w-full py-3 rounded-xl border border-border text-muted hover:text-foreground hover:border-primary/50 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate with AI
        </motion.button>
      )}
    </motion.div>
  );
}
