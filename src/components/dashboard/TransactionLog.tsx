"use client";

/**
 * TransactionLog Component
 * Chronological list of transactions for a category
 */

import { motion } from "framer-motion";
import { Calendar, TrendingUp, Utensils, Home, Train, Heart, Gamepad2, ShoppingBag, Zap, MoreHorizontal } from "lucide-react";

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  note: string | null;
  status: string;
}

interface TransactionLogProps {
  transactions: Transaction[];
  category: string;
  isLoading?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  food: <Utensils className="w-4 h-4" />,
  housing: <Home className="w-4 h-4" />,
  transport: <Train className="w-4 h-4" />,
  healthcare: <Heart className="w-4 h-4" />,
  entertainment: <Gamepad2 className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  utilities: <Zap className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
};

export function TransactionLog({
  transactions,
  category,
  isLoading,
}: TransactionLogProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-surface border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transaction Log</h3>
          <TrendingUp className="w-5 h-5 text-muted" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-background border border-border animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-hover" />
                  <div>
                    <div className="h-4 bg-surface-hover rounded w-24 mb-2" />
                    <div className="h-3 bg-surface-hover rounded w-16" />
                  </div>
                </div>
                <div className="h-4 bg-surface-hover rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-surface border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transaction Log</h3>
          <TrendingUp className="w-5 h-5 text-muted" />
        </div>
        <div className="text-center py-8 text-muted">
          No transactions found for this category
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-surface border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Transaction Log</h3>
          <p className="text-sm text-muted">
            {transactions.length} transactions • {formatCurrency(totalAmount)} total
          </p>
        </div>
        <TrendingUp className="w-5 h-5 text-muted" />
      </div>

      <div className="space-y-3">
        {transactions.map((transaction, index) => {
          const percentageOfTotal = totalAmount > 0 
            ? ((transaction.amount / totalAmount) * 100).toFixed(1)
            : 0;

          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-2xl bg-background border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-danger-dim flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-danger" />
                  </div>

                  {/* Info */}
                  <div>
                    <p className="font-medium">{transaction.merchant}</p>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(transaction.date)}</span>
                      {transaction.note && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">
                            {transaction.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Impact */}
                <div className="text-right">
                  <p className="text-lg font-bold text-danger">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-muted">
                    {percentageOfTotal}% of category
                  </p>
                </div>
              </div>

              {/* Impact Bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(parseFloat(percentageOfTotal as string), 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-danger rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
