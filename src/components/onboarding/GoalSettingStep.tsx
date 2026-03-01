"use client";

/**
 * Step 3: Goal Setting Component
 * User inputs their financial dreams and targets
 */

import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Trash2, DollarSign, Calendar, Flag, Sparkles } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";
import { FinancialGoal } from "@/types/onboarding";
import { useState } from "react";

const priorityColors = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-rose-500/20 text-rose-400 border-rose-500/30",
} as const;

export function GoalSettingStep({ onNext }: { onNext: () => void }) {
  const { data, addGoal, removeGoal } = useOnboarding();
  const [newGoal, setNewGoal] = useState<Omit<FinancialGoal, "id">>({
    name: "",
    targetAmount: 0,
    targetDate: "",
    priority: "medium",
  });
  const [showAddGoal, setShowAddGoal] = useState(false);

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.targetAmount > 0) {
      addGoal(newGoal);
      setNewGoal({ name: "", targetAmount: 0, targetDate: "", priority: "medium" });
      setShowAddGoal(false);
    }
  };

  const handleContinue = () => {
    if (data.goals.length > 0 || data.dreamDescription) {
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
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-6"
        >
          <Target className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Set Your Goals
        </h2>
        <p className="text-muted text-base md:text-lg max-w-md mx-auto">
          Add specific financial goals to track your progress
        </p>
      </div>

      {/* Add Goal Button */}
      {!showAddGoal && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowAddGoal(true)}
          className="w-full p-6 rounded-3xl border-2 border-dashed border-border hover:border-primary transition-colors mb-6 flex items-center justify-center gap-3"
        >
          <Plus className="w-6 h-6 text-primary" />
          <span className="font-medium">Add Your First Goal</span>
        </motion.button>
      )}

      {/* Add Goal Form */}
      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-6 rounded-3xl bg-surface border border-border overflow-hidden"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-2">Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g., Emergency Fund, Dream Vacation"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted mb-2">Target Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="number"
                      value={newGoal.targetAmount || ""}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted mb-2">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as "low" | "medium" | "high" })}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={handleAddGoal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl bg-primary text-black font-medium"
                >
                  Add Goal
                </motion.button>
                <motion.button
                  onClick={() => setShowAddGoal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl bg-surface-hover text-muted"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      {data.goals.length > 0 && (
        <div className="space-y-3 mb-8 flex-1">
          <AnimatePresence>
            {data.goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-2xl bg-surface border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{goal.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{goal.targetAmount.toLocaleString()}</span>
                      </div>
                      {goal.targetDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{goal.targetDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[goal.priority]}`}>
                      {goal.priority}
                    </span>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="p-2 rounded-lg hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "0%" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
                <p className="text-xs text-muted mt-2">0% achieved</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleContinue}
        disabled={data.goals.length === 0 && !data.dreamDescription}
        className="w-full py-4 md:py-5 rounded-2xl bg-primary text-black font-semibold text-base md:text-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
