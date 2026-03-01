"use client";

/**
 * ExpensesSummaryCard Component
 * Displays Net Balance, Total Income, and Expenses Summary with period change
 */

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, DollarSign, PieChart } from "lucide-react";
import { ExpensesSummary } from "@/actions/analytics";

interface ExpensesSummaryCardProps {
  summary: ExpensesSummary | null;
  isLoading?: boolean;
}

export function ExpensesSummaryCard({ summary, isLoading }: ExpensesSummaryCardProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-3xl bg-surface border border-border animate-pulse">
            <div className="h-4 bg-surface-hover rounded w-24 mb-3" />
            <div className="h-8 bg-surface-hover rounded w-32 mb-2" />
            <div className="h-3 bg-surface-hover rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  const { netBalance, totalIncome, totalExpenses, changePercent } = summary;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getChangeIcon = () => {
    if (changePercent > 0) {
      return <TrendingUp className="w-4 h-4" />;
    } else if (changePercent < 0) {
      return <TrendingDown className="w-4 h-4" />;
    }
    return null;
  };

  const getChangeColor = () => {
    if (changePercent > 20) return "text-danger";
    if (changePercent > 0) return "text-warning";
    if (changePercent < -10) return "text-success";
    return "text-muted";
  };

  const getChangeText = () => {
    if (changePercent > 0) {
      return `+${changePercent}% Increase`;
    } else if (changePercent < 0) {
      return `${changePercent}% Decrease`;
    }
    return "No Change";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Net Balance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm text-muted">Net Balance</span>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-primary mb-2">
          {formatCurrency(netBalance)}
        </p>
        <div className="flex items-center gap-1 text-xs">
          <span className={getChangeColor()}>
            {getChangeText()} from last period
          </span>
        </div>
      </motion.div>

      {/* Total Income */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-3xl bg-surface border border-border"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-success-dim flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <span className="text-sm text-muted">Total Income</span>
        </div>
        <p className="text-2xl font-bold text-success mb-2">
          {formatCurrency(totalIncome)}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted">
          <DollarSign className="w-3 h-3" />
          <span>From all sources</span>
        </div>
      </motion.div>

      {/* Total Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-3xl bg-surface border border-border"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-danger-dim flex items-center justify-center">
            <PieChart className="w-5 h-5 text-danger" />
          </div>
          <span className="text-sm text-muted">Total Expenses</span>
        </div>
        <p className="text-2xl font-bold text-danger mb-2">
          {formatCurrency(totalExpenses)}
        </p>
        <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
          {getChangeIcon()}
          <span>{getChangeText()} from last period</span>
        </div>
      </motion.div>
    </div>
  );
}
