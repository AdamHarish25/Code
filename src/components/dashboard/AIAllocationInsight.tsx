"use client";

/**
 * AIAllocationInsight Component
 * Dynamic feedback area where AI provides "Balanced" status confirmations
 * or alerts when income is not fully utilized
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  X,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { getAllocationInsight } from "@/actions/budgeting";
import { AllocationStatus } from "@/types/dashboard";

interface AIAllocationInsightProps {
  onDismiss?: () => void;
}

export function AIAllocationInsight({ onDismiss }: AIAllocationInsightProps) {
  const { allocationStatus, categoryAllocations, addInsight } = useDashboard();
  const [insight, setInsight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!allocationStatus) return;

    setIsLoading(true);
    const fetchInsight = async () => {
      try {
        // Use userId from auth (for now, using placeholder)
        const userId = "current-user-id"; // Replace with actual user ID
        const result = await getAllocationInsight(
          userId,
          allocationStatus.totalIncome,
          allocationStatus.totalAllocated,
          categoryAllocations
        );
        setInsight(result.insight);

        // Add as dashboard insight if significant
        if (
          allocationStatus.status === "critical" ||
          allocationStatus.status === "warning"
        ) {
          addInsight({
            title:
              allocationStatus.status === "critical"
                ? "Budget Alert"
                : "Budget Review Needed",
            content: result.insight,
            type:
              allocationStatus.status === "critical" ? "alert" : "advice",
          });
        }
      } catch (error) {
        console.error("Failed to fetch insight:", error);
        setInsight(generateFallbackInsight(allocationStatus));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [allocationStatus, categoryAllocations]);

  if (!allocationStatus) {
    return null;
  }

  const { status, message, remainingToAllocate, allocationPercentage } =
    allocationStatus;

  const getStatusConfig = () => {
    switch (status) {
      case "balanced":
        return {
          icon: <CheckCircle2 className="w-6 h-6" />,
          bgColor: "bg-success-dim",
          borderColor: "border-success/20",
          textColor: "text-success",
          title: "Balanced",
          description: "Your budget allocation is well-balanced",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          bgColor: "bg-warning/10",
          borderColor: "border-warning/20",
          textColor: "text-warning",
          title: "Attention Needed",
          description: `${(100 - allocationPercentage).toFixed(0)}% of income not allocated`,
        };
      case "critical":
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          bgColor: "bg-danger-dim",
          borderColor: "border-danger/20",
          textColor: "text-danger",
          title: "Critical",
          description: `${(100 - allocationPercentage).toFixed(0)}% of income not allocated`,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border ${config.bgColor} ${config.borderColor}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${config.bgColor}`}>
            <div className={config.textColor}>{config.icon}</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <h4 className={`font-semibold ${config.textColor}`}>
                AI Allocation Insight
              </h4>
            </div>
            <p className="text-sm text-muted mt-0.5">{config.description}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        )}
      </div>

      {/* Status Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-xl mb-4 ${
            status === "balanced"
              ? "bg-success/10 border border-success/20"
              : status === "warning"
              ? "bg-warning/10 border border-warning/20"
              : "bg-danger/10 border border-danger/20"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              status === "balanced"
                ? "text-success"
                : status === "warning"
                ? "text-warning"
                : "text-danger"
            }`}
          >
            {message}
          </p>
        </motion.div>
      )}

      {/* AI Insight */}
      <div className="mb-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            <span>AI is analyzing your allocation...</span>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border">
            <Lightbulb className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted">{insight}</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-background border border-border">
          <p className="text-xs text-muted mb-1">Allocated</p>
          <p className="text-lg font-bold text-foreground">
            {allocationPercentage.toFixed(0)}%
          </p>
        </div>
        <div className="p-3 rounded-xl bg-background border border-border">
          <p className="text-xs text-muted mb-1">Remaining</p>
          <p
            className={`text-lg font-bold ${
              remainingToAllocate > 0 ? "text-warning" : "text-success"
            }`}
          >
            ${remainingToAllocate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-background border border-border">
          <p className="text-xs text-muted mb-1">Status</p>
          <p className={`text-lg font-bold capitalize ${config.textColor}`}>
            {status}
          </p>
        </div>
      </div>

      {/* Expandable Recommendations */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 rounded-xl bg-surface-hover text-muted hover:text-foreground transition-colors text-sm flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        {isExpanded ? "Hide" : "View"} Recommendations
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border space-y-3">
              {status !== "balanced" && remainingToAllocate > 0 && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">
                    💡 Recommendation
                  </p>
                  <p className="text-xs text-muted">
                    Consider allocating the remaining $
                    {remainingToAllocate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} to:
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li className="text-xs text-muted flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      Emergency Fund (aim for 3-6 months expenses)
                    </li>
                    <li className="text-xs text-muted flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      Investment accounts for long-term growth
                    </li>
                    <li className="text-xs text-muted flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      Specific savings goals you have set
                    </li>
                  </ul>
                </div>
              )}

              {status === "balanced" && (
                <div className="p-3 rounded-xl bg-success-dim border border-success/20">
                  <p className="text-sm font-medium text-success mb-1">
                    ✓ Great Job!
                  </p>
                  <p className="text-xs text-muted">
                    Your budget is well-balanced. Continue monitoring your
                    spending to stay on track. Review your allocations monthly
                    to adjust for any life changes.
                  </p>
                </div>
              )}

              {allocationPercentage > 100 && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
                  <p className="text-sm font-medium text-danger mb-1">
                    ⚠️ Over-Budget Alert
                  </p>
                  <p className="text-xs text-muted">
                    Your allocations exceed your income by $
                    {Math.abs(remainingToAllocate).toLocaleString()}. Consider
                    reducing spending in non-essential categories like
                    entertainment or shopping.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function generateFallbackInsight(status: AllocationStatus): string {
  const { remainingToAllocate, allocationPercentage } = status;

  if (allocationPercentage > 100) {
    return "Your budget allocations exceed your income. Review your categories and reduce spending in non-essential areas to achieve a balanced budget.";
  }

  if (remainingToAllocate > status.totalIncome * 0.3) {
    return `You have $${remainingToAllocate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} unallocated. This is a great opportunity to boost your emergency fund or increase investment contributions for long-term financial security.`;
  }

  if (remainingToAllocate > 0) {
    return `Consider allocating the remaining $${remainingToAllocate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} to your savings goals or investment accounts to maximize your financial growth potential.`;
  }

  return "Your budget looks well-structured. Keep tracking your expenses to ensure you stay within your allocated categories.";
}
