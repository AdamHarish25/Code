"use client";

/**
 * AccountDistributionView Component
 * Summary showing Top Budget Allocations and impact indicators
 */

import { motion } from "framer-motion";
import { PieChart as PieChartIcon, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { CategoryAllocation } from "@/types/dashboard";

interface DistributionItem {
  category: string;
  name: string;
  amount: number;
  percentage: number;
  impactIndicator: "high" | "medium" | "low";
  isEssential: boolean;
  color: string;
}

const impactIcon: Record<"high" | "medium" | "low", React.ReactNode> = {
  high: <AlertCircle className="w-3 h-3" />,
  medium: <TrendingUp className="w-3 h-3" />,
  low: <CheckCircle className="w-3 h-3" />,
};

const impactColor: Record<"high" | "medium" | "low", string> = {
  high: "text-danger",
  medium: "text-warning",
  low: "text-success",
};

const impactBg: Record<"high" | "medium" | "low", string> = {
  high: "bg-danger/10",
  medium: "bg-warning/10",
  low: "bg-success-dim",
};

export function AccountDistributionView() {
  const { categoryAllocations, allocationStatus } = useDashboard();

  const totalAllocated = categoryAllocations.reduce(
    (sum, c) => sum + c.allocatedAmount,
    0
  );

  // Get top allocations sorted by amount
  const topAllocations: DistributionItem[] = [...categoryAllocations]
    .sort((a, b) => b.allocatedAmount - a.allocatedAmount)
    .slice(0, 5)
    .map((allocation) => ({
      category: allocation.category,
      name: allocation.name,
      amount: allocation.allocatedAmount,
      percentage:
        totalAllocated > 0
          ? (allocation.allocatedAmount / totalAllocated) * 100
          : 0,
      impactIndicator: allocation.impactIndicator,
      isEssential: allocation.isEssential,
      color: allocation.color,
    }));

  // Calculate distribution by impact
  const highImpact = categoryAllocations.filter(
    (c) => c.impactIndicator === "high"
  ).length;
  const mediumImpact = categoryAllocations.filter(
    (c) => c.impactIndicator === "medium"
  ).length;
  const lowImpact = categoryAllocations.filter(
    (c) => c.impactIndicator === "low"
  ).length;

  // Calculate essential vs non-essential
  const essentialTotal = categoryAllocations
    .filter((c) => c.isEssential)
    .reduce((sum, c) => sum + c.allocatedAmount, 0);
  const nonEssentialTotal = categoryAllocations
    .filter((c) => !c.isEssential)
    .reduce((sum, c) => sum + c.allocatedAmount, 0);

  if (categoryAllocations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-surface border border-border"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <PieChartIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Account Distribution</h3>
            <p className="text-sm text-muted">
              View your budget allocation breakdown
            </p>
          </div>
        </div>
        <p className="text-muted text-sm text-center py-8">
          No allocations yet. Add categories to see distribution.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 rounded-3xl bg-surface border border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <PieChartIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Account Distribution</h3>
            <p className="text-sm text-muted">
              Top Budget Allocations & Impact
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Total Allocated</p>
          <p className="text-lg font-bold text-primary">
            ${totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Top Allocations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3">Top Budget Allocations</h4>
        <div className="space-y-3">
          {topAllocations.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border"
            >
              {/* Rank */}
              <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-xs font-bold text-muted">
                #{index + 1}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.isEssential && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Essential
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-lg ${impactBg[item.impactIndicator]} ${impactColor[item.impactIndicator]} flex items-center gap-1`}
                  >
                    {impactIcon[item.impactIndicator]}
                    {item.impactIndicator} impact
                  </span>
                  <span className="text-xs text-muted">
                    {item.percentage.toFixed(1)}% of total
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className="text-sm font-bold">
                  ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Impact Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3">Impact Distribution</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-danger" />
              <span className="text-xs text-danger">High</span>
            </div>
            <p className="text-lg font-bold text-danger">{highImpact}</p>
            <p className="text-xs text-muted">categories</p>
          </div>
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-warning" />
              <span className="text-xs text-warning">Medium</span>
            </div>
            <p className="text-lg font-bold text-warning">{mediumImpact}</p>
            <p className="text-xs text-muted">categories</p>
          </div>
          <div className="p-3 rounded-xl bg-success-dim border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs text-success">Low</span>
            </div>
            <p className="text-lg font-bold text-success">{lowImpact}</p>
            <p className="text-xs text-muted">categories</p>
          </div>
        </div>
      </div>

      {/* Essential vs Non-Essential Split */}
      <div>
        <h4 className="text-sm font-medium mb-3">Budget Split</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-background border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-muted">Essential</span>
            </div>
            <p className="text-xl font-bold">
              ${essentialTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted">
              {totalAllocated > 0
                ? ((essentialTotal / totalAllocated) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </div>
          <div className="p-4 rounded-xl bg-background border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-xs text-muted">Non-Essential</span>
            </div>
            <p className="text-xl font-bold">
              ${nonEssentialTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted">
              {totalAllocated > 0
                ? ((nonEssentialTotal / totalAllocated) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </div>
        </div>
      </div>

      {/* Alignment Indicator */}
      {allocationStatus && (
        <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">
                Long-term Savings Alignment
              </p>
              <p className="text-xs text-muted mt-1">
                {allocationStatus.status === "balanced"
                  ? "Your spending patterns align well with long-term savings targets."
                  : "Consider adjusting allocations to better align with long-term goals."}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                allocationStatus.status === "balanced"
                  ? "bg-success text-black"
                  : "bg-warning text-black"
              }`}
            >
              {allocationStatus.status === "balanced" ? "On Track" : "Review"}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
