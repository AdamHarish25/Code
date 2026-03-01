"use client";

/**
 * CategoryAccountSelector Component
 * Step 2: Choose Category and Income Account
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Utensils,
  Train,
  Heart,
  Gamepad2,
  ShoppingBag,
  Zap,
  MoreHorizontal,
  Wallet,
  Laptop,
  TrendingUp,
  Briefcase,
  Megaphone,
  Check,
  ChevronDown,
} from "lucide-react";
import { TransactionType, TransactionCategoryOption, IncomeAccountOption } from "@/types/dashboard";

const expenseCategories: TransactionCategoryOption[] = [
  { value: "housing", label: "Rent & Utilities", icon: "home", type: "expense" },
  { value: "food", label: "Food and Beverage", icon: "utensils", type: "expense" },
  { value: "transport", label: "Public Transport", icon: "train", type: "expense" },
  { value: "healthcare", label: "Healthcare", icon: "heart", type: "expense" },
  { value: "entertainment", label: "Entertainment", icon: "gamepad", type: "expense" },
  { value: "shopping", label: "Shopping", icon: "shopping-bag", type: "expense" },
  { value: "utilities", label: "Utilities", icon: "zap", type: "expense" },
  { value: "other", label: "Other", icon: "more-horizontal", type: "both" },
];

const incomeCategories: TransactionCategoryOption[] = [
  { value: "salary", label: "Salary", icon: "wallet", type: "income" },
  { value: "freelance", label: "Freelancing", icon: "laptop", type: "income" },
  { value: "investment", label: "Investment", icon: "trending-up", type: "income" },
  { value: "side-hustle", label: "Side Hustle", icon: "briefcase", type: "income" },
  { value: "other", label: "Other Income", icon: "more-horizontal", type: "both" },
];

const incomeAccounts: IncomeAccountOption[] = [
  { value: "salary", label: "Salary", icon: "wallet" },
  { value: "freelance", label: "Freelance Work", icon: "laptop" },
  { value: "digital-marketing", label: "Digital Marketing", icon: "megaphone" },
  { value: "stock-dividends", label: "Stock Dividends", icon: "trending-up" },
  { value: "rental", label: "Rental Income", icon: "home" },
  { value: "side-hustle", label: "Side Hustle", icon: "briefcase" },
  { value: "other", label: "Other", icon: "more-horizontal" },
];

const iconMap: Record<string, React.ReactNode> = {
  home: <Home className="w-5 h-5" />,
  utensils: <Utensils className="w-5 h-5" />,
  train: <Train className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  gamepad: <Gamepad2 className="w-5 h-5" />,
  "shopping-bag": <ShoppingBag className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  "more-horizontal": <MoreHorizontal className="w-5 h-5" />,
  wallet: <Wallet className="w-5 h-5" />,
  laptop: <Laptop className="w-5 h-5" />,
  "trending-up": <TrendingUp className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
  megaphone: <Megaphone className="w-5 h-5" />,
};

interface CategoryAccountSelectorProps {
  transactionType: TransactionType;
  selectedCategory: string;
  selectedAccount: string;
  onCategorySelect: (category: string) => void;
  onAccountSelect: (account: string) => void;
}

export function CategoryAccountSelector({
  transactionType,
  selectedCategory,
  selectedAccount,
  onCategorySelect,
  onAccountSelect,
}: CategoryAccountSelectorProps) {
  const categories =
    transactionType === "income" ? incomeCategories : expenseCategories;
  const accounts = transactionType === "income" ? incomeAccounts : [];
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold mb-2">Choose Category & Account</h2>
        <p className="text-muted">
          {transactionType === "income"
            ? "Select where this income comes from"
            : "Select what this expense is for"}
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Category</label>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => (
            <motion.button
              key={category.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCategorySelect(category.value)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                selectedCategory === category.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface hover:border-muted"
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div
                  className={`p-3 rounded-xl ${
                    selectedCategory === category.value
                      ? "bg-primary text-black"
                      : "bg-surface-hover text-muted"
                  }`}
                >
                  {iconMap[category.icon]}
                </div>
                <span className="text-xs font-medium">{category.label}</span>
                {selectedCategory === category.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-black" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Account Selection (Income only) */}
      {transactionType === "income" && accounts.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-3">
            Income Account
          </label>
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="w-full p-4 rounded-2xl bg-surface border-2 border-border hover:border-muted transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {selectedAccount ? (
                  <>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {iconMap[
                        accounts.find((a) => a.value === selectedAccount)?.icon ||
                          "wallet"
                      ]}
                    </div>
                    <span className="font-medium">
                      {accounts.find((a) => a.value === selectedAccount)?.label}
                    </span>
                  </>
                ) : (
                  <span className="text-muted">Select income account</span>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted transition-transform ${
                  showAccountDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {showAccountDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 w-full mt-2 p-3 rounded-2xl bg-surface border border-border shadow-xl"
              >
                {accounts.map((account) => (
                  <button
                    key={account.value}
                    onClick={() => {
                      onAccountSelect(account.value);
                      setShowAccountDropdown(false);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                      selectedAccount === account.value
                        ? "bg-primary/10"
                        : "hover:bg-surface-hover"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        selectedAccount === account.value
                          ? "bg-primary text-black"
                          : "bg-surface-hover text-muted"
                      }`}
                    >
                      {iconMap[account.icon]}
                    </div>
                    <span className="font-medium flex-1 text-left">
                      {account.label}
                    </span>
                    {selectedAccount === account.value && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
