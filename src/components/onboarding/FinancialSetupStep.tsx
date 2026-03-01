"use client";

/**
 * Step 4: Financial Setup Component
 * User inputs monthly income and major expenses
 * Enhanced with haptic feedback and touch interactions
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Plus,
  Trash2,
  Home,
  Utensils,
  Car,
  Zap,
  Gamepad2,
  Heart,
  MoreHorizontal,
  Briefcase,
  Coins,
} from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";
import { IncomeSource, ExpenseCategory } from "@/types/onboarding";
import { useState } from "react";

// Haptic feedback helper
function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

const incomeTypes = [
  { value: "salary", label: "Salary", icon: Briefcase },
  { value: "freelancing", label: "Freelancing", icon: Coins },
  { value: "other", label: "Other", icon: MoreHorizontal },
] as const;

const expenseCategories = [
  { value: "housing", label: "Housing", icon: Home, isEssential: true },
  { value: "food", label: "Food", icon: Utensils, isEssential: true },
  { value: "transport", label: "Transport", icon: Car, isEssential: true },
  { value: "utilities", label: "Utilities", icon: Zap, isEssential: true },
  { value: "entertainment", label: "Entertainment", icon: Gamepad2, isEssential: false },
  { value: "healthcare", label: "Healthcare", icon: Heart, isEssential: true },
  { value: "other", label: "Other", icon: MoreHorizontal, isEssential: false },
] as const;

const frequencyOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

export function FinancialSetupStep({ onNext }: { onNext: () => void }) {
  const { data, addIncomeSource, removeIncomeSource, addExpense, removeExpense } =
    useOnboarding();
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newIncome, setNewIncome] = useState<Omit<IncomeSource, "type">>({
    amount: 0,
    frequency: "monthly",
  });
  const [newExpense, setNewExpense] = useState<ExpenseCategory>({
    category: "housing",
    amount: 0,
    isEssential: true,
  });

  const handleAddIncome = () => {
    if (newIncome.amount > 0) {
      triggerHaptic([30, 50, 30]);
      addIncomeSource({ ...newIncome, type: "salary" });
      setNewIncome({ amount: 0, frequency: "monthly" });
      setShowAddIncome(false);
    }
  };

  const handleAddExpense = () => {
    if (newExpense.amount > 0) {
      triggerHaptic([30, 50, 30]);
      addExpense(newExpense);
      setNewExpense({ category: "housing", amount: 0, isEssential: true });
      setShowAddExpense(false);
    }
  };

  const handleRemoveIncome = (index: number) => {
    triggerHaptic(20);
    removeIncomeSource(index);
  };

  const handleRemoveExpense = (index: number) => {
    triggerHaptic(20);
    removeExpense(index);
  };

  const handleContinue = () => {
    if (data.incomeSources.length > 0) {
      triggerHaptic([30, 50, 30]);
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

  const calculateMonthlyIncome = () => {
    return data.incomeSources.reduce((total, source) => {
      const multiplier =
        source.frequency === "weekly"
          ? 4.33
          : source.frequency === "biweekly"
            ? 2.17
            : source.frequency === "yearly"
              ? 0.0833
              : 1;
      return total + source.amount * multiplier;
    }, 0);
  };

  const calculateMonthlyExpenses = () => {
    return data.expenses.reduce((total) => total, 0);
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
          Financial Setup
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted"
        >
          Let&apos;s understand your cash flow
        </motion.p>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-muted mb-1">Monthly Cash Flow</p>
            <p
              className={`text-2xl font-bold ${
                calculateMonthlyIncome() - calculateMonthlyExpenses() >= 0
                  ? "text-primary"
                  : "text-error"
              }`}
            >
              {formatCurrency(calculateMonthlyIncome() - calculateMonthlyExpenses())}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted mb-1">Income / Expenses</p>
            <p className="text-sm">
              <span className="text-success">{formatCurrency(calculateMonthlyIncome())}</span>
              <span className="text-muted mx-1">/</span>
              <span className="text-error">{formatCurrency(calculateMonthlyExpenses())}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6">
        {/* Income Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success" />
              Income Sources
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                triggerHaptic(15);
                setShowAddIncome(!showAddIncome);
              }}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover"
            >
              <Plus className="w-4 h-4" />
              Add Income
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddIncome && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-surface border border-border mb-3"
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="number"
                      value={newIncome.amount || ""}
                      onChange={(e) =>
                        setNewIncome({ ...newIncome, amount: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="Amount"
                      className="w-full p-3 pl-9 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <select
                    value={newIncome.frequency}
                    onChange={(e) =>
                      setNewIncome({ ...newIncome, frequency: e.target.value as IncomeSource["frequency"] })
                    }
                    className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                  >
                    {frequencyOptions.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>
                <motion.button
                  onClick={handleAddIncome}
                  disabled={newIncome.amount <= 0}
                  whileHover={newIncome.amount > 0 ? { scale: 1.02 } : {}}
                  whileTap={newIncome.amount > 0 ? { scale: 0.98 } : {}}
                  className="w-full py-2 rounded-xl bg-primary text-black font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Income
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <AnimatePresence>
              {data.incomeSources.map((source, index) => {
                const Icon = incomeTypes.find((t) => t.value === source.type)?.icon || MoreHorizontal;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm capitalize">{source.type}</h4>
                        <p className="text-xs text-muted">
                          {formatCurrency(source.amount)} / {source.frequency}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleRemoveIncome(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg hover:bg-error/20 text-muted hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {data.incomeSources.length === 0 && !showAddIncome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 text-muted"
            >
              <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No income sources added</p>
            </motion.div>
          )}
        </section>

        {/* Expenses Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Coins className="w-4 h-4 text-error" />
              Major Expenses
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                triggerHaptic(15);
                setShowAddExpense(!showAddExpense);
              }}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddExpense && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-surface border border-border mb-3"
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <select
                    value={newExpense.category}
                    onChange={(e) => {
                      const selected = expenseCategories.find(
                        (c) => c.value === e.target.value
                      );
                      setNewExpense({
                        ...newExpense,
                        category: e.target.value as ExpenseCategory["category"],
                        isEssential: selected?.isEssential ?? true,
                      });
                    }}
                    className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                  >
                    {expenseCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="number"
                      value={newExpense.amount || ""}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="Amount"
                      className="w-full p-3 pl-9 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                    />
                  </div>
                </div>
                <motion.button
                  onClick={handleAddExpense}
                  disabled={newExpense.amount <= 0}
                  whileHover={newExpense.amount > 0 ? { scale: 1.02 } : {}}
                  whileTap={newExpense.amount > 0 ? { scale: 0.98 } : {}}
                  className="w-full py-2 rounded-xl bg-primary text-black font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Expense
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <AnimatePresence>
              {data.expenses.map((expense, index) => {
                const Icon =
                  expenseCategories.find((c) => c.value === expense.category)?.icon ||
                  MoreHorizontal;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          expense.isEssential ? "bg-error/20" : "bg-secondary/20"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            expense.isEssential ? "text-error" : "text-secondary"
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm capitalize">{expense.category}</h4>
                        <p className="text-xs text-muted">
                          {formatCurrency(expense.amount)}
                          {!expense.isEssential && " • Non-essential"}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleRemoveExpense(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg hover:bg-error/20 text-muted hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {data.expenses.length === 0 && !showAddExpense && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 text-muted"
            >
              <Coins className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No expenses added</p>
            </motion.div>
          )}
        </section>
      </div>

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleContinue}
        disabled={data.incomeSources.length === 0}
        className={`w-full py-4 rounded-2xl font-semibold transition-all ${
          data.incomeSources.length > 0
            ? "bg-primary text-black hover:bg-primary-hover"
            : "bg-surface text-muted cursor-not-allowed"
        }`}
        whileHover={data.incomeSources.length > 0 ? { scale: 1.02, y: -2 } : {}}
        whileTap={data.incomeSources.length > 0 ? { scale: 0.98 } : {}}
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
