"use client";

/**
 * Step 3: Goal Setting Component
 * User inputs their financial dreams and targets
 */

import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Trash2, DollarSign, Calendar, Flag } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";
import { FinancialGoal } from "@/types/onboarding";
import { useState } from "react";

interface GoalSettingStepProps {
  onNext: () => void;
  onBack: () => void;
}

const priorityColors = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-rose-500/20 text-rose-400 border-rose-500/30",
} as const;

export function GoalSettingStep({ onNext, onBack }: GoalSettingStepProps) {
  const { data, addGoal, removeGoal, setDreamDescription } = useOnboarding();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col min-h-[60vh] px-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          What&apos;s Your Dream?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted"
        >
          Set your financial targets and let AI guide your journey
        </motion.p>
      </div>

      {/* Dream Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <label className="block text-sm font-medium mb-2">
          <Target className="w-4 h-4 inline mr-1 text-secondary" />
          Describe your financial dream
        </label>
        <textarea
          value={data.dreamDescription}
          onChange={(e) => setDreamDescription(e.target.value)}
          placeholder="E.g., I want to achieve financial independence by 35, buy a home, and travel the world..."
          className="w-full p-4 rounded-2xl bg-surface border border-border focus:border-primary outline-none resize-none h-24 text-sm placeholder:text-muted/50"
        />
      </motion.div>

      {/* Goals List */}
      <div className="flex-1 mb-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted">Financial Goals</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </motion.button>
        </div>

        <AnimatePresence>
          {showAddGoal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-2xl bg-surface border border-border mb-4"
            >
              <input
                type="text"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="Goal name (e.g., Emergency Fund)"
                className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm mb-3"
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    value={newGoal.targetAmount || ""}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Target"
                    className="w-full p-3 pl-9 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full p-3 pl-9 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {(["low", "medium", "high"] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setNewGoal({ ...newGoal, priority })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                      newGoal.priority === priority
                        ? priorityColors[priority]
                        : "bg-background border-border text-muted hover:border-secondary/50"
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.name || newGoal.targetAmount <= 0}
                className="w-full py-2 rounded-xl bg-primary text-black font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Goal
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <AnimatePresence>
            {data.goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Flag className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{goal.name}</h4>
                    <p className="text-xs text-muted">
                      {formatCurrency(goal.targetAmount)}
                      {goal.targetDate && ` • Due ${new Date(goal.targetDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium border ${priorityColors[goal.priority]}`}
                  >
                    {goal.priority}
                  </span>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="p-2 rounded-lg hover:bg-error/20 text-muted hover:text-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {data.goals.length === 0 && !showAddGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted"
          >
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No goals added yet</p>
            <p className="text-xs">Click &quot;Add Goal&quot; to create your first target</p>
          </motion.div>
        )}
      </div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleContinue}
        disabled={data.goals.length === 0 && !data.dreamDescription}
        className={`w-full py-4 rounded-2xl font-semibold transition-all ${
          data.goals.length > 0 || data.dreamDescription
            ? "bg-primary text-black hover:bg-primary-hover"
            : "bg-surface text-muted cursor-not-allowed"
        }`}
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
