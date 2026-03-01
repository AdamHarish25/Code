"use client";

/**
 * BudgetView Component
 * Detailed budget management view with real Supabase data
 */

import { motion } from "framer-motion";
import { Plus, PiggyBank, TrendingUp } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { BudgetProgress } from "../BudgetProgress";
import { formatCurrency } from "@/lib/utils";
import { TransactionCategory } from "@/types/dashboard";

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

export function BudgetView() {
  const { categoryAllocations, transactions } = useDashboard();

  // Calculate totals from allocations
  const totalBudget = categoryAllocations.reduce((sum, c) => sum + c.allocatedAmount, 0);
  const totalSpent = categoryAllocations.reduce((sum, c) => sum + c.spentAmount, 0);
  const remaining = totalBudget - totalSpent;

  // Get unique categories from transactions
  const expenseCategories = Array.from(
    new Set(transactions.filter((t) => t.type === "expense").map((t) => t.category))
  ) as TransactionCategory[];

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Budget</h1>
        <p className="text-muted">Track and manage your spending limits</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-surface border border-border"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success-dim flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-muted">Total Budget</span>
          </div>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(totalBudget)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-3xl bg-surface border border-border"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-danger-dim flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-danger" />
            </div>
            <span className="text-sm text-muted">Spent This Month</span>
          </div>
          <p className="text-2xl font-bold text-danger">
            {formatCurrency(totalSpent)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-3xl bg-surface border border-border"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <span className="text-sm text-muted">Remaining</span>
          </div>
          <p className="text-2xl font-bold text-secondary">
            {formatCurrency(remaining)}
          </p>
        </motion.div>
      </div>

      {/* Budget Progress */}
      <BudgetProgress />

      {/* Category Allocations List */}
      {categoryAllocations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 space-y-4"
        >
          <h3 className="font-semibold text-lg">Budget Categories</h3>
          {categoryAllocations.map((allocation, index) => {
            const progress = allocation.allocatedAmount > 0
              ? (allocation.spentAmount / allocation.allocatedAmount) * 100
              : 0;
            const isOverBudget = progress >= 100;

            return (
              <motion.div
                key={allocation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 rounded-2xl bg-surface border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: allocation.color }}
                    />
                    <div>
                      <h4 className="font-medium">{allocation.name}</h4>
                      <p className="text-xs text-muted capitalize">
                        {categoryLabels[allocation.category as TransactionCategory] || allocation.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(allocation.spentAmount)} / {formatCurrency(allocation.allocatedAmount)}
                    </p>
                    <p className={`text-xs ${isOverBudget ? "text-danger" : "text-muted"}`}>
                      {progress.toFixed(0)}% used
                    </p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: allocation.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Empty State */}
      {categoryAllocations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center py-12 text-muted"
        >
          <PiggyBank className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold mb-2">No budget categories yet</h3>
          <p className="text-sm mb-4">
            Set up your budget categories to start tracking spending
          </p>
        </motion.div>
      )}

      {/* Add Budget Category Placeholder */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 w-full p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5 text-muted" />
        <span className="text-sm font-medium text-muted">Add Budget Category</span>
      </motion.button>
    </div>
  );
}
