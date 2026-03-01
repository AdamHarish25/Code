"use client";

/**
 * DetailCategoryView Component
 * Deep-dive screen for specific category with budget status and transaction log
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { CategoryDetail } from "@/actions/analytics";
import { TransactionLog } from "./TransactionLog";

interface DetailCategoryViewProps {
  category: string;
  data: CategoryDetail | null;
  isLoading?: boolean;
  onClose: () => void;
  onBack: () => void;
}

export function DetailCategoryView({
  category,
  data,
  isLoading,
  onClose,
  onBack,
}: DetailCategoryViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getBudgetStatus = () => {
    if (!data) return { color: "text-muted", bg: "bg-muted", label: "Unknown" };
    
    if (data.percentage > 100) {
      return { color: "text-danger", bg: "bg-danger-dim", label: "Over Budget" };
    } else if (data.percentage > 80) {
      return { color: "text-warning", bg: "bg-warning/10", label: "Almost There" };
    } else if (data.percentage > 50) {
      return { color: "text-primary", bg: "bg-primary/10", label: "On Track" };
    }
    return { color: "text-success", bg: "bg-success-dim", label: "Good" };
  };

  const status = getBudgetStatus();

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold">{category}</h2>
              <p className="text-xs text-muted">Category Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-6">
        {isLoading ? (
          <>
            <div className="p-6 rounded-3xl bg-surface border border-border animate-pulse">
              <div className="h-4 bg-surface-hover rounded w-24 mb-4" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-16 bg-surface-hover rounded-2xl" />
                <div className="h-16 bg-surface-hover rounded-2xl" />
                <div className="h-16 bg-surface-hover rounded-2xl" />
              </div>
            </div>
            <div className="h-64 bg-surface-hover rounded-3xl animate-pulse" />
          </>
        ) : data ? (
          <>
            {/* Budget Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-surface border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${status.bg}`}>
                    <Wallet className={`w-5 h-5 ${status.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Budget Status</h3>
                    <p className={`text-sm ${status.color}`}>{status.label}</p>
                  </div>
                </div>
                {data.percentage > 100 && (
                  <div className="flex items-center gap-2 text-danger">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Over Budget</span>
                  </div>
                )}
              </div>

              {/* Budget Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Budget Limit */}
                <div className="p-4 rounded-2xl bg-background border border-border">
                  <p className="text-xs text-muted mb-2">Budget Limit</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(data.budget)}
                  </p>
                </div>

                {/* Spent */}
                <div className="p-4 rounded-2xl bg-background border border-border">
                  <p className="text-xs text-muted mb-2">Spent</p>
                  <p className="text-lg font-bold text-danger">
                    {formatCurrency(data.spent)}
                  </p>
                  <p className="text-xs text-muted mt-1">{data.percentage}% used</p>
                </div>

                {/* Remaining */}
                <div className="p-4 rounded-2xl bg-background border border-border">
                  <p className="text-xs text-muted mb-2">Remaining</p>
                  <p
                    className={`text-lg font-bold ${
                      data.remaining < 0 ? "text-danger" : "text-success"
                    }`}
                  >
                    {formatCurrency(data.remaining)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Budget Usage</span>
                  <span
                    className={`text-sm font-medium ${
                      data.percentage > 100
                        ? "text-danger"
                        : data.percentage > 80
                        ? "text-warning"
                        : "text-success"
                    }`}
                  >
                    {data.percentage > 100
                      ? `${data.percentage}% (Over)`
                      : `${data.percentage}%`}
                  </span>
                </div>
                <div className="h-3 bg-background rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(data.percentage, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full ${
                      data.percentage > 100
                        ? "bg-danger"
                        : data.percentage > 80
                        ? "bg-warning"
                        : "bg-primary"
                    } rounded-full`}
                  />
                </div>
              </div>
            </motion.div>

            {/* Transaction Log */}
            <TransactionLog transactions={data.transactions} category={category} />
          </>
        ) : (
          <div className="text-center py-12 text-muted">
            No data available for {category}
          </div>
        )}
      </div>
    </motion.div>
  );
}
