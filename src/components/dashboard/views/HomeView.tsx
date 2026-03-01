"use client";

/**
 * HomeView Component
 * Main dashboard home with financial overview and insights
 * Displays real data from Supabase via dashboard store
 */

import { useEffect } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { SmartInsightCard } from "../SmartInsightCard";
import { TransactionFeed } from "../TransactionFeed";
import { BudgetProgress } from "../BudgetProgress";
import { AddTransactionModal } from "../AddTransactionModal";
import { formatCurrency } from "@/lib/utils";

export function HomeView() {
  const { summary, transactions, incomeSources, categoryAllocations, isLoading } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("[HomeView] Dashboard state:", {
      summary,
      transactionsCount: transactions.length,
      incomeSourcesCount: incomeSources.length,
      allocationsCount: categoryAllocations.length,
      isLoading,
    });
  }, [summary, transactions, incomeSources, categoryAllocations, isLoading]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 md:px-6 py-6 space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Good {getTimeOfDay()}!
        </h1>
        <p className="text-muted">
          Here&apos;s your financial overview for today
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {/* Total Balance */}
        <div className="col-span-2 md:col-span-1 p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted">Total Balance</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-primary">
            {formatCurrency(summary.totalBalance)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-success">
            <ArrowUpRight className="w-3 h-3" />
            <span>
              {summary.totalBalance >= 0 ? '+' : ''}{((summary.totalBalance / (summary.monthlyIncome || 1)) * 100).toFixed(1)}% from income
            </span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="p-5 rounded-3xl bg-surface border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success-dim flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-muted">Monthly Income</span>
          </div>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(summary.monthlyIncome)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-success">
            <ArrowUpRight className="w-3 h-3" />
            <span>{incomeSources.length} sources</span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-5 rounded-3xl bg-surface border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-danger-dim flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-danger" />
            </div>
            <span className="text-sm text-muted">Monthly Expenses</span>
          </div>
          <p className="text-2xl font-bold text-danger">
            {formatCurrency(summary.monthlyExpenses)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted">
            <span>{transactions.filter(t => t.type === 'expense').length} transactions</span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="p-5 rounded-3xl bg-surface border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-sm text-muted">Savings Rate</span>
          </div>
          <p className="text-2xl font-bold text-secondary">
            {summary.savingsRate.toFixed(1)}%
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-success">
            <ArrowUpRight className="w-3 h-3" />
            <span>{summary.savingsRate > 20 ? 'Excellent!' : 'Keep improving'}</span>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div variants={itemVariants} className="text-center py-8 text-muted">
          <p>Loading your financial data...</p>
        </motion.div>
      )}

      {/* Smart Insight Card */}
      <motion.div variants={itemVariants}>
        <SmartInsightCard />
      </motion.div>

      {/* Budget Progress */}
      <motion.div variants={itemVariants}>
        <BudgetProgress />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <TransactionFeed limit={5} />
      </motion.div>

      {/* Floating Action Button - Add Transaction */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary text-black shadow-lg shadow-primary/30 flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6 md:w-8 md:h-8" />
      </motion.button>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(transactionId) => {
          console.log("Transaction created:", transactionId);
        }}
      />
    </motion.div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
