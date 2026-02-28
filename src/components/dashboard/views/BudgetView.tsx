"use client";

/**
 * BudgetView Component
 * Detailed budget management view
 */

import { motion } from "framer-motion";
import { Plus, PiggyBank, TrendingUp } from "lucide-react";
import { BudgetProgress } from "../BudgetProgress";

export function BudgetView() {
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
          <p className="text-2xl font-bold text-success">$2,500</p>
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
          <p className="text-2xl font-bold text-danger">$1,847</p>
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
          <p className="text-2xl font-bold text-secondary">$653</p>
        </motion.div>
      </div>

      {/* Budget Progress */}
      <BudgetProgress />

      {/* Add Budget Category */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
