"use client";

/**
 * TransactionSuccessModal Component
 * Step 5: Success confirmation screen with illustration
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface TransactionSuccessModalProps {
  isOpen: boolean;
  transactionType: "income" | "expense";
  amount: string;
  category: string;
  merchant?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function TransactionSuccessModal({
  isOpen,
  transactionType,
  amount,
  category,
  merchant,
  onClose,
  onConfirm,
}: TransactionSuccessModalProps) {
  // Auto-close after delay if needed
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        // Could auto-close here if desired
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm">
              {/* Success Card - Fixed dimensions 354x120px as per spec */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="bg-surface border-2 border-success rounded-3xl overflow-hidden"
                style={{ minHeight: "120px" }}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Success Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-14 h-14 rounded-full bg-success-dim flex items-center justify-center flex-shrink-0"
                    >
                      <CheckCircle className="w-8 h-8 text-success" />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1">
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg font-bold text-success"
                      >
                        {transactionType === "income" ? "Income" : "Expense"} Added!
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-muted"
                      >
                        ${parseFloat(amount).toLocaleString()} • {category}
                      </motion.p>
                      {merchant && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-xs text-muted mt-1"
                        >
                          {merchant}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="h-1 bg-success"
                />
              </motion.div>

              {/* Confirmation Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 space-y-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="w-full py-4 rounded-2xl bg-primary text-black font-semibold text-lg shadow-lg shadow-primary/20"
                >
                  Confirm
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-surface-hover text-muted font-medium"
                >
                  Add Another
                </motion.button>
              </motion.div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white/70" />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
