"use client";

/**
 * TransactionTypeSelector Component
 * Step 1: Choose between Income or Expenses
 */

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { TransactionType } from "@/types/dashboard";

interface TransactionTypeSelectorProps {
  selectedType: TransactionType | null;
  onSelect: (type: TransactionType) => void;
}

export function TransactionTypeSelector({
  selectedType,
  onSelect,
}: TransactionTypeSelectorProps) {
  const options: {
    id: TransactionType;
    label: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
  }[] = [
    {
      id: "income",
      label: "Income",
      description: "Money coming in (salary, freelance, investments)",
      icon: <TrendingUp className="w-8 h-8" />,
      gradient: "from-success/20 to-success/5",
    },
    {
      id: "expense",
      label: "Expenses",
      description: "Money going out (bills, shopping, food)",
      icon: <TrendingDown className="w-8 h-8" />,
      gradient: "from-danger/20 to-danger/5",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <DollarSign className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Add Transaction</h2>
        <p className="text-muted">Select the transaction type to continue</p>
      </div>

      {/* Type Selection Cards */}
      <div className="grid grid-cols-1 gap-4">
        {options.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => onSelect(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative p-6 rounded-3xl border-2 transition-all text-left ${
              selectedType === option.id
                ? "border-primary bg-surface"
                : "border-border bg-surface hover:border-muted"
            }`}
          >
            {/* Selection Indicator */}
            {selectedType === option.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`p-4 rounded-2xl bg-gradient-to-br ${option.gradient} ${
                  selectedType === option.id ? "text-primary" : ""
                }`}
              >
                {option.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{option.label}</h3>
                <p className="text-sm text-muted">{option.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
