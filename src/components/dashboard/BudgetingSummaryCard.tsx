"use client";

/**
 * BudgetingSummaryCard Component
 * Displays Remaining Allocation and Total Monthly Income
 */

import { motion } from "framer-motion";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { AllocationStatus } from "@/types/dashboard";

interface BudgetingSummaryCardProps {
  allocationStatus: AllocationStatus | null;
  onManageIncome?: () => void;
}

export function BudgetingSummaryCard({
  allocationStatus,
  onManageIncome,
}: BudgetingSummaryCardProps) {
  if (!allocationStatus) {
    return (
      <div className="p-6 rounded-3xl bg-surface border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Budgeting Summary</h3>
          <Wallet className="w-5 h-5 text-muted" />
        </div>
        <p className="text-muted text-sm">Loading budget data...</p>
      </div>
    );
  }

  const {
    totalIncome,
    remainingToAllocate,
    allocationPercentage,
    status,
    message,
  } = allocationStatus;

  const getStatusColor = () => {
    switch (status) {
      case "balanced":
        return "text-success";
      case "warning":
        return "text-warning";
      case "critical":
        return "text-danger";
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case "balanced":
        return "bg-success-dim";
      case "warning":
        return "bg-warning/10";
      case "critical":
        return "bg-danger-dim";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "balanced":
        return <TrendingUp className="w-5 h-5 text-success" />;
      default:
        return <AlertCircle className="w-5 h-5 text-danger" />;
    }
  };

  const getProgressColor = () => {
    if (allocationPercentage > 100) return "bg-danger";
    if (allocationPercentage >= 95) return "bg-success";
    if (allocationPercentage >= 70) return "bg-warning";
    return "bg-danger";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-surface border border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Budgeting Summary</h3>
        <div className={`p-2 rounded-xl ${getStatusBg()}`}>
          {getStatusIcon()}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Monthly Income */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-2xl bg-background border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-muted" />
            <span className="text-xs text-muted">Total Monthly Income</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          {onManageIncome && (
            <button
              onClick={onManageIncome}
              className="mt-2 text-xs text-primary hover:text-primary-hover transition-colors font-medium"
            >
              Manage Income →
            </button>
          )}
        </motion.div>

        {/* Remaining Allocation */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-2xl bg-background border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-muted" />
            <span className="text-xs text-muted">Remaining to Allocate</span>
          </div>
          <p className={`text-2xl font-bold ${getStatusColor()}`}>
            ${remainingToAllocate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          {message && (
            <p className={`mt-1 text-xs ${getStatusColor()}`}>{message}</p>
          )}
        </motion.div>
      </div>

      {/* Allocation Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted">Allocation Progress</span>
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {allocationPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-background rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(allocationPercentage, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full ${getProgressColor()} rounded-full`}
          />
        </div>
      </div>

      {/* Status Indicator */}
      <div className={`p-3 rounded-xl ${getStatusBg()} flex items-center gap-3`}>
        <div className={`p-1.5 rounded-lg ${status === "balanced" ? "bg-success/20" : "bg-danger/20"}`}>
          {status === "balanced" ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <AlertCircle className="w-4 h-4 text-danger" />
          )}
        </div>
        <div>
          <p className={`text-sm font-medium ${getStatusColor()}`}>
            {status === "balanced" ? "Balanced" : status === "warning" ? "Attention Needed" : "Critical"}
          </p>
          <p className="text-xs text-muted">
            {status === "balanced"
              ? "Your budget is well-distributed"
              : message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
