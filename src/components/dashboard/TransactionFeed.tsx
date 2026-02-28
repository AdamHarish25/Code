"use client";

/**
 * TransactionFeed Component
 * Displays recent transactions with auto-categorization
 */

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  MoreHorizontal,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-store";
import { Transaction } from "@/types/dashboard";
import { formatCurrency, formatRelativeTime, getCategoryIcon } from "@/lib/utils";

interface TransactionFeedProps {
  limit?: number;
  showAll?: boolean;
}

export function TransactionFeed({ limit, showAll }: TransactionFeedProps) {
  const { transactions, addTransaction } = useDashboard();

  const loadSampleTransactions = useCallback(() => {
    const sampleTransactions: Transaction[] = [
      {
        id: "1",
        merchant: "McDonald's",
        amount: 12.50,
        category: "food",
        date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: "completed",
        type: "expense",
        isAutoCategorized: true,
      },
      {
        id: "2",
        merchant: "Uber",
        amount: 24.00,
        category: "transport",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: "completed",
        type: "expense",
        isAutoCategorized: true,
      },
      {
        id: "3",
        merchant: "Salary Deposit",
        amount: 3500.00,
        category: "salary",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: "completed",
        type: "income",
        isAutoCategorized: false,
      },
      {
        id: "4",
        merchant: "Netflix",
        amount: 15.99,
        category: "entertainment",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        status: "completed",
        type: "expense",
        isAutoCategorized: true,
      },
      {
        id: "5",
        merchant: "Starbucks",
        amount: 6.75,
        category: "food",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        status: "completed",
        type: "expense",
        isAutoCategorized: true,
      },
      {
        id: "6",
        merchant: "Electric Company",
        amount: 120.00,
        category: "utilities",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        status: "completed",
        type: "expense",
        isAutoCategorized: true,
      },
    ];

    sampleTransactions.forEach((t) => addTransaction(t));
  }, [addTransaction]);

  useEffect(() => {
    if (transactions.length === 0) {
      loadSampleTransactions();
    }
  }, [transactions.length, loadSampleTransactions]);

  const displayedTransactions = limit
    ? transactions.slice(0, limit)
    : transactions;

  return (
    <div className="rounded-3xl bg-surface border border-border p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        {!showAll && (
          <button className="text-sm text-primary hover:text-primary-hover transition-colors">
            View All
          </button>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        <AnimatePresence>
          {displayedTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted"
            >
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs">Transactions will appear here automatically</p>
            </motion.div>
          ) : (
            displayedTransactions.map((transaction, index) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                delay={index * 0.05}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  delay?: number;
}

function TransactionItem({
  transaction,
  delay = 0,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, backgroundColor: "var(--surface-hover)" }}
      className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between cursor-pointer transition-colors"
    >
      {/* Left Side */}
      <div className="flex items-center gap-3 flex-1">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
            isIncome
              ? "bg-success-dim"
              : "bg-danger-dim"
          }`}
        >
          {getCategoryIcon(transaction.category)}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground truncate">
              {transaction.merchant}
            </h4>
            {transaction.isAutoCategorized && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">AI Categorized</span>
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted capitalize">
              {transaction.category}
            </span>
            <span className="text-xs text-muted">•</span>
            <span className="text-xs text-muted">
              {formatRelativeTime(transaction.date)}
            </span>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Amount */}
        <div
          className={`text-right ${
            isIncome ? "text-success" : "text-danger"
          }`}
        >
          <p className="font-semibold">
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-muted capitalize">{transaction.status}</p>
        </div>

        {/* Menu */}
        <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
          <MoreHorizontal className="w-4 h-4 text-muted" />
        </button>
      </div>

      {/* Success Badge for Income */}
      {isIncome && transaction.status === "completed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 right-2"
        >
          <CheckCircle2 className="w-4 h-4 text-success" />
        </motion.div>
      )}
    </motion.div>
  );
}
