"use client";

/**
 * Step 4: Financial Setup Component
 * User inputs income sources and monthly expenses
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Wallet,
  Briefcase,
  PiggyBank,
  Sparkles,
} from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";
import { useState } from "react";

const incomeTypes = [
  { value: "salary", label: "Salary", icon: Wallet },
  { value: "freelance", label: "Freelance", icon: Briefcase },
  { value: "investment", label: "Investment", icon: TrendingUp },
  { value: "side-hustle", label: "Side Hustle", icon: PiggyBank },
] as const;

const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

export function FinancialSetupStep({ onNext }: { onNext: () => void }) {
  const { data, addIncomeSource, addExpense } = useOnboarding();
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [newIncome, setNewIncome] = useState({
    amount: "",
    frequency: "monthly",
    type: "salary",
  });

  const handleAddIncome = () => {
    if (newIncome.amount) {
      addIncomeSource({
        amount: parseFloat(newIncome.amount),
        frequency: newIncome.frequency as any,
        type: newIncome.type as any,
      });
      setNewIncome({ amount: "", frequency: "monthly", type: "salary" });
      setShowAddIncome(false);
    }
  };

  const handleContinue = () => {
    onNext();
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
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-success/20 to-primary/20 mb-6"
        >
          <Sparkles className="w-10 h-10 text-success" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Financial Setup
        </h2>
        <p className="text-muted text-base md:text-lg max-w-md mx-auto">
          Add your income sources and monthly expenses
        </p>
      </div>

      {/* Income Sources */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-dim flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">Income Sources</h3>
              <p className="text-xs text-muted">Your monthly income</p>
            </div>
          </div>
          {!showAddIncome && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setShowAddIncome(true)}
              className="p-2 rounded-xl bg-success-dim hover:bg-success/30 transition-colors"
            >
              <Plus className="w-5 h-5 text-success" />
            </motion.button>
          )}
        </div>

        {/* Add Income Form */}
        <AnimatePresence>
          {showAddIncome && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-5 rounded-2xl bg-surface border border-border overflow-hidden"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted mb-2">Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        type="number"
                        value={newIncome.amount}
                        onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-success outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted mb-2">Frequency</label>
                    <select
                      value={newIncome.frequency}
                      onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-success outline-none transition-colors"
                    >
                      {frequencies.map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {incomeTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setNewIncome({ ...newIncome, type: type.value })}
                          className={`p-3 rounded-xl border transition-colors flex items-center gap-2 ${
                            newIncome.type === type.value
                              ? "bg-success-dim border-success text-success"
                              : "bg-background border-border hover:border-success/50"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleAddIncome}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl bg-success text-black font-medium"
                  >
                    Add Income
                  </motion.button>
                  <motion.button
                    onClick={() => setShowAddIncome(false)}
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

        {/* Income List */}
        {data.incomeSources.length > 0 && (
          <div className="space-y-2">
            {data.incomeSources.map((income, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success-dim flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium capitalize">{income.type}</p>
                    <p className="text-xs text-muted capitalize">
                      {income.frequency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-success">
                    {income.amount.toLocaleString()}
                  </p>
                  <button
                    onClick={() => {}}
                    className="p-2 rounded-lg hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-danger" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleContinue}
        className="w-full py-4 md:py-5 rounded-2xl bg-primary text-black font-semibold text-base md:text-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25"
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
