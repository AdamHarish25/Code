"use client";

/**
 * GoalsView Component
 * Financial goals tracking view
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { FinancialGoal } from "@/types/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createFinancialGoal as createFinancialGoalService } from "@/lib/supabase-services";

const priorityColors = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const goalIcons = ["🏠", "🚗", "✈️", "💰", "🎓", "💍", "🏖️", "💻"];

export function GoalsView() {
  const { goals, addGoalProgress, refreshData } = useDashboard();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Omit<FinancialGoal, "id">>({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    priority: "medium",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleAddGoal = async () => {
    if (!newGoal.name || newGoal.targetAmount <= 0) return;

    setIsCreating(true);
    try {
      const result = await createFinancialGoalService({
        name: newGoal.name,
        target_amount: newGoal.targetAmount,
        current_amount: newGoal.currentAmount,
        priority: newGoal.priority,
        target_date: undefined,
      });

      if (result.success) {
        await refreshData();
        setShowAddGoal(false);
        setNewGoal({ name: "", targetAmount: 0, currentAmount: 0, priority: "medium" });
      }
    } catch (error) {
      console.error("Failed to create goal:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddProgress = async (id: string, amount: number) => {
    await addGoalProgress(id, amount);
  };

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Financial Goals</h1>
          <p className="text-muted">Track progress towards your dreams</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary text-black font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Goal</span>
        </motion.button>
      </div>

      {/* Add Goal Form */}
      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-5 rounded-3xl bg-surface border border-border overflow-hidden"
          >
            <div className="space-y-4">
              <input
                type="text"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="Goal name (e.g., Dream Vacation)"
                className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    value={newGoal.targetAmount || ""}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Target Amount"
                    className="w-full pl-9 pr-3 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                  />
                </div>
                <select
                  value={newGoal.priority}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, priority: e.target.value as "low" | "medium" | "high" })
                  }
                  className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <motion.button
                onClick={handleAddGoal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-primary text-black font-medium"
              >
                Create Goal
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal, index) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const icon = goalIcons[index % goalIcons.length];

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-5 rounded-3xl bg-surface border border-border"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    priorityColors[goal.priority]
                  }`}
                >
                  {goal.priority}
                </span>
              </div>

              {/* Goal Name */}
              <h3 className="font-semibold text-lg mb-2">{goal.name}</h3>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted">Progress</span>
                  <span className="text-xs font-medium text-primary">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                  />
                </div>
              </div>

              {/* Amount Display */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted">Saved</p>
                  <p className="font-semibold text-success">
                    {formatCurrency(goal.currentAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Target</p>
                  <p className="font-semibold text-foreground">
                    {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
              </div>

              {/* Target Date */}
              {goal.targetDate && (
                <div className="flex items-center gap-2 mb-4 text-xs text-muted">
                  <Calendar className="w-3 h-3" />
                  <span>Target: {formatDate(goal.targetDate)}</span>
                </div>
              )}

              {/* Quick Add */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddProgress(goal.id, 100)}
                className="w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">+ $100</span>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted"
        >
          <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
          <p className="text-sm">Create your first financial goal to start tracking</p>
        </motion.div>
      )}
    </div>
  );
}
