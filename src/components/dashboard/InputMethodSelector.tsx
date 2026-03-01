"use client";

/**
 * InputMethodSelector Component
 * Step 3: Choose input method - Manual, Photo, or Upload
 */

import { motion } from "framer-motion";
import { Keyboard, Camera, FileUp, Receipt } from "lucide-react";
import { TransactionInputMethod } from "@/types/dashboard";

interface InputMethodSelectorProps {
  selectedMethod: TransactionInputMethod | null;
  onSelect: (method: TransactionInputMethod) => void;
}

export function InputMethodSelector({
  selectedMethod,
  onSelect,
}: InputMethodSelectorProps) {
  const options: {
    id: TransactionInputMethod;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: "manual",
      label: "Manually",
      description: "Enter transaction details by hand",
      icon: <Keyboard className="w-8 h-8" />,
    },
    {
      id: "photo",
      label: "Photo",
      description: "Take a photo of your receipt",
      icon: <Camera className="w-8 h-8" />,
      badge: "AI-Powered",
    },
    {
      id: "upload",
      label: "Upload File",
      description: "Upload receipt image or PDF",
      icon: <FileUp className="w-8 h-8" />,
      badge: "AI-Powered",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
          <Receipt className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Choose Input Method</h2>
        <p className="text-muted">How would you like to add this transaction?</p>
      </div>

      {/* Method Selection Cards */}
      <div className="grid grid-cols-1 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option.id)}
            className={`relative p-5 rounded-3xl border-2 transition-all text-left ${
              selectedMethod === option.id
                ? "border-primary bg-surface"
                : "border-border bg-surface hover:border-muted"
            }`}
          >
            {/* Selection Indicator */}
            {selectedMethod === option.id && (
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

            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={`p-4 rounded-2xl ${
                  selectedMethod === option.id
                    ? "bg-primary text-black"
                    : "bg-surface-hover text-muted"
                }`}
              >
                {option.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{option.label}</h3>
                  {option.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">
                      {option.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted mt-1">{option.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* AI Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-secondary/20">
            <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary">AI Receipt Scanning</p>
            <p className="text-xs text-muted mt-1">
              Our AI will automatically extract merchant, date, and amount from your receipt
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
