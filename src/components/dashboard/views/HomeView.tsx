"use client";

/**
 * HomeView Component
 * Main dashboard home with financial overview and insights
 */

import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { SmartInsightCard } from "../SmartInsightCard";
import { TransactionFeed } from "../TransactionFeed";
import { BudgetProgress } from "../BudgetProgress";
import { formatCurrency } from "@/lib/utils";

export function HomeView() {
  const { summary } = useDashboard();

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
            <span>+12.5% from last month</span>
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
            <span>On track</span>
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
            <span>{summary.budgetProgress.toFixed(0)}% of budget</span>
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
            <span>Great job!</span>
          </div>
        </div>
      </motion.div>

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
    </motion.div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}
