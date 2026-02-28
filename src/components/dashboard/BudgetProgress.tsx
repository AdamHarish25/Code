"use client";

/**
 * BudgetProgress Component
 * Displays budget progress by category with visual indicators
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PieChart, TrendingUp, AlertCircle } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { BudgetCategory, TransactionCategory } from "@/types/dashboard";
import { formatCurrency, getCategoryIcon } from "@/lib/utils";

const categoryColors: Record<TransactionCategory, string> = {
  housing: "#C3B3EF",
  food: "#A3FF47",
  transport: "#00D084",
  utilities: "#FFB800",
  entertainment: "#FF5F5F",
  healthcare: "#FF8A8A",
  shopping: "#C3B3EF",
  salary: "#00D084",
  freelance: "#A3FF47",
  investment: "#C3B3EF",
  other: "#6B6B6B",
};

const categoryLabels: Record<TransactionCategory, string> = {
  housing: "Housing",
  food: "Food & Dining",
  transport: "Transportation",
  utilities: "Utilities",
  entertainment: "Entertainment",
  healthcare: "Healthcare",
  shopping: "Shopping",
  salary: "Salary",
  freelance: "Freelance",
  investment: "Investments",
  other: "Other",
};

export function BudgetProgress() {
  const { budgetCategories, transactions } = useDashboard();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);

  const calculateBudgetCategories = useCallback(() => {
    // Group expenses by category
    const expenseCategories = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0;
        }
        acc[t.category] += t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Create budget categories with default limits
    const newCategories: BudgetCategory[] = Object.entries(expenseCategories).map(
      ([category, spent]) => ({
        category: category as TransactionCategory,
        limit: spent * 1.2, // Set limit 20% higher than current spending
        spent,
        isEssential: ["housing", "food", "transport", "utilities", "healthcare"].includes(category),
        color: categoryColors[category as TransactionCategory] || "#6B6B6B",
      })
    );

    setCategories(newCategories);
  }, [transactions]);

  useEffect(() => {
    // Calculate budget categories from transactions
    if (transactions.length > 0 && budgetCategories.length === 0) {
      calculateBudgetCategories();
    } else {
      setCategories(budgetCategories);
    }
  }, [transactions, budgetCategories, calculateBudgetCategories]);

  const totalBudget = categories.reduce((sum, c) => sum + c.limit, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="rounded-3xl bg-surface border border-border p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Budget Progress</h3>
            <p className="text-xs text-muted">Monthly spending by category</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Total Budget</p>
          <p className="font-semibold text-primary">{formatCurrency(totalBudget)}</p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted">Overall Progress</span>
          <span
            className={`text-sm font-medium ${
              overallProgress >= 100
                ? "text-danger"
                : overallProgress >= 75
                ? "text-warning"
                : "text-success"
            }`}
          >
            {overallProgress.toFixed(0)}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-background overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(overallProgress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              overallProgress >= 100
                ? "bg-danger"
                : overallProgress >= 75
                ? "bg-warning"
                : "bg-success"
            }`}
          />
        </div>
        <p className="text-xs text-muted mt-2">
          {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudget)}
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        {categories.slice(0, 5).map((category, index) => {
          const progress = (category.spent / category.limit) * 100;
          const isOverBudget = progress >= 100;
          const isNearLimit = progress >= 75 && progress < 100;

          return (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category.category)}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {categoryLabels[category.category]}
                    </p>
                    {category.isEssential && (
                      <span className="text-xs text-muted">Essential</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(category.spent)}
                  </p>
                  <p className="text-xs text-muted">
                    of {formatCurrency(category.limit)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 rounded-full bg-background overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {isOverBudget ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 text-xs text-danger"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>Over budget by {formatCurrency(category.spent - category.limit)}</span>
                  </motion.div>
                ) : isNearLimit ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 text-xs text-warning"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>{formatCurrency(category.limit - category.spent)} remaining</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 text-xs text-success"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span>On track</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted"
        >
          <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No budget categories yet</p>
          <p className="text-xs">Start tracking expenses to see your budget breakdown</p>
        </motion.div>
      )}
    </div>
  );
}
