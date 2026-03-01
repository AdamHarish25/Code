"use client";

/**
 * ExpensesAccountList Component
 * Detailed list showing spent, percentage, and progress for each category
 */

import { motion } from "framer-motion";
import { Home, Utensils, Train, Heart, Gamepad2, ShoppingBag, Zap, MoreHorizontal, Wallet, TrendingUp } from "lucide-react";
import { ExpensesByAccount } from "@/actions/analytics";
import { formatCurrency } from "@/lib/utils";

interface ExpensesAccountListProps {
  data: ExpensesByAccount[];
  isLoading?: boolean;
  onCategoryClick?: (category: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  housing: <Home className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  transport: <Train className="w-4 h-4" />,
  healthcare: <Heart className="w-4 h-4" />,
  entertainment: <Gamepad2 className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-5 h-5" />,
  utilities: <Zap className="w-4 h-4" />,
  savings: <Wallet className="w-4 h-4" />,
  investment: <TrendingUp className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
};

const getProgressColor = (percentage: number) => {
  if (percentage > 100) return "bg-danger";
  if (percentage > 80) return "bg-warning";
  if (percentage > 50) return "bg-primary";
  return "bg-success";
};

export function ExpensesAccountList({
  data,
  isLoading,
  onCategoryClick,
}: ExpensesAccountListProps) {
  // Use centralized formatCurrency from utils

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-surface border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Expenses by Account</h3>
            <p className="text-sm text-muted">Detailed breakdown with budget usage</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-background border border-border animate-pulse">
              <div className="h-4 bg-surface-hover rounded w-32 mb-3" />
              <div className="h-2 bg-surface-hover rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-surface border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Expenses by Account</h3>
            <p className="text-sm text-muted">Detailed breakdown with budget usage</p>
          </div>
        </div>
        <div className="text-center py-8 text-muted">
          No expense data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Expenses by Account</h3>
            <p className="text-sm text-muted">Budget usage per category</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCategoryClick?.(item.category)}
            className="p-4 rounded-2xl bg-background border border-border cursor-pointer hover:border-primary/50 transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: item.color || "#6B7280" }}
                >
                  {iconMap[item.category] || iconMap.other}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    {item.isEssential && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Essential
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted capitalize">
                    {item.impactIndicator} impact
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(item.spent)}</p>
                <p className="text-xs text-muted">
                  of {formatCurrency(item.allocated)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted">Budget Usage</span>
                <span
                  className={`text-xs font-medium ${
                    item.percentage > 100
                      ? "text-danger"
                      : item.percentage > 80
                      ? "text-warning"
                      : "text-success"
                  }`}
                >
                  {item.percentage > 100 ? "Over budget" : `${item.percentage}% used`}
                </span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(item.percentage, 100)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-full ${getProgressColor(item.percentage)} rounded-full`}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">
                Remaining:{" "}
                <span className={item.remaining < 0 ? "text-danger" : "text-success"}>
                  {formatCurrency(item.remaining)}
                </span>
              </span>
              <span className="text-muted">
                {item.percentage > 100 ? (
                  <span className="text-danger font-medium">
                    Over by {formatCurrency(Math.abs(item.remaining))}
                  </span>
                ) : (
                  `${(100 - item.percentage).toFixed(0)}% left`
                )}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
