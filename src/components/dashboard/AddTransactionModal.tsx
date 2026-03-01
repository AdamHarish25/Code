"use client";

/**
 * AddTransactionModal Component
 * Main container for the multi-step transaction entry flow
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Loader2 } from "lucide-react";
import {
  TransactionType,
  TransactionInputMethod,
  TransactionFormData,
} from "@/types/dashboard";
import { createTransaction, validateTransaction } from "@/actions/transactions";
import { TransactionTypeSelector } from "./TransactionTypeSelector";
import { CategoryAccountSelector } from "./CategoryAccountSelector";
import { InputMethodSelector } from "./InputMethodSelector";
import { ManualEntryForm } from "./ManualEntryForm";
import { OCRReceiptUpload } from "./OCRReceiptUpload";
import { TransactionSuccessModal } from "./TransactionSuccessModal";

type Step =
  | "type"
  | "category"
  | "method"
  | "entry"
  | "success";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (transactionId: string) => void;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [inputMethod, setInputMethod] = useState<TransactionInputMethod | null>(null);
  const [formData, setFormData] = useState<Partial<TransactionFormData>>({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    merchant: "",
    note: "",
    attachment: null,
  });

  // Reset form when modal opens/closes
  const resetForm = useCallback(() => {
    setCurrentStep("type");
    setTransactionType(null);
    setCategory("");
    setAccount("");
    setInputMethod(null);
    setFormData({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      merchant: "",
      note: "",
      attachment: null,
    });
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Step 1: Select transaction type
  const handleTypeSelect = (type: TransactionType) => {
    setTransactionType(type);
    setCurrentStep("category");
  };

  // Step 2: Select category and account
  const handleCategorySelect = (newCategory: string) => {
    setCategory(newCategory);
  };

  const handleAccountSelect = (newAccount: string) => {
    setAccount(newAccount);
  };

  const handleCategoryContinue = () => {
    if (category && (transactionType === "income" ? account : true)) {
      setCurrentStep("method");
    }
  };

  // Step 3: Select input method
  const handleMethodSelect = (method: TransactionInputMethod) => {
    setInputMethod(method);
    setCurrentStep("entry");
  };

  // Step 4: Handle form data changes
  const handleFormDataChange = (data: Partial<TransactionFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Handle OCR extraction complete
  const handleOCRComplete = (data: {
    merchant: string;
    date: string;
    amount: string;
    category?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      merchant: data.merchant,
      date: data.date,
      amount: data.amount,
      ...(data.category && { category: data.category }),
    }));
    if (data.category && !category) {
      setCategory(data.category);
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File | null) => {
    setFormData((prev) => ({ ...prev, attachment: file }));
  };

  // Step 5: Submit transaction
  const handleSubmit = async () => {
    if (!transactionType) return;

    // Validate
    const validation = await validateTransaction({
      type: transactionType,
      category,
      account: transactionType === "income" ? account : "expense",
      amount: formData.amount || "0",
      date: formData.date || "",
      merchant: formData.merchant,
      note: formData.note,
    });

    if (!validation.valid) {
      alert(validation.errors.join("\n"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user ID
      const { getCurrentUserIdClient } = await import("@/lib/auth-config");
      const userId = await getCurrentUserIdClient();
      
      if (!userId) {
        alert("You must be signed in to create a transaction");
        setIsSubmitting(false);
        return;
      }

      const result = await createTransaction({
        type: transactionType,
        category,
        account: transactionType === "income" ? account : "expense",
        amount: formData.amount || "0",
        date: formData.date || "",
        merchant: formData.merchant,
        note: formData.note,
        attachment: formData.attachment,
      }, userId);  // Pass user ID to server action

      if (result.success && result.transactionId) {
        setCurrentStep("success");
        onSuccess?.(result.transactionId);
      } else {
        alert(result.error || "Failed to create transaction");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle success confirmation
  const handleSuccessConfirm = () => {
    handleClose();
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "type":
        return (
          <TransactionTypeSelector
            selectedType={transactionType}
            onSelect={handleTypeSelect}
          />
        );

      case "category":
        return (
          <CategoryAccountSelector
            transactionType={transactionType!}
            selectedCategory={category}
            selectedAccount={account}
            onCategorySelect={handleCategorySelect}
            onAccountSelect={handleAccountSelect}
          />
        );

      case "method":
        return (
          <InputMethodSelector
            selectedMethod={inputMethod}
            onSelect={handleMethodSelect}
          />
        );

      case "entry":
        if (inputMethod === "manual") {
          return (
            <ManualEntryForm
              transactionType={transactionType!}
              category={category}
              account={account}
              formData={formData}
              onChange={handleFormDataChange}
              onFileSelect={handleFileSelect}
            />
          );
        } else {
          return (
            <OCRReceiptUpload
              transactionType={transactionType!}
              method={inputMethod === "photo" ? "photo" : "upload"}
              onExtractComplete={handleOCRComplete}
              onFileSelect={handleFileSelect}
            />
          );
        }

      default:
        return null;
    }
  };

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case "type":
        return "Add Transaction";
      case "category":
        return "Category & Account";
      case "method":
        return "Input Method";
      case "entry":
        return "Enter Details";
      default:
        return "";
    }
  };

  // Check if continue button should be enabled
  const canContinue = () => {
    switch (currentStep) {
      case "type":
        return !!transactionType;
      case "category":
        return !!category && (transactionType === "income" ? !!account : true);
      case "method":
        return !!inputMethod;
      case "entry":
        return !!formData.amount && !!formData.date;
      default:
        return false;
    }
  };

  // Handle continue/submit
  const handleContinue = () => {
    if (currentStep === "entry") {
      handleSubmit();
    } else if (currentStep === "category") {
      handleCategoryContinue();
    }
  };

  // Handle back navigation
  const handleBack = () => {
    switch (currentStep) {
      case "category":
        setCurrentStep("type");
        break;
      case "method":
        setCurrentStep("category");
        break;
      case "entry":
        setCurrentStep("method");
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-x-0 bottom-20 z-50 md:inset-0 md:flex md:items-center md:justify-center"
          >
            <div className="w-full md:max-w-md md:mx-4">
              <motion.div
                className="bg-surface rounded-t-3xl md:rounded-3xl border border-border overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                {currentStep !== "success" && (
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {currentStep !== "type" && (
                        <button
                          onClick={handleBack}
                          className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                      <h2 className="text-lg font-semibold">{getStepTitle()}</h2>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {renderStepContent()}
                </div>

                {/* Footer Actions */}
                {currentStep !== "success" && (
                  <div className="p-4 border-t border-border space-y-3">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {["type", "category", "method", "entry"].map((step, index) => {
                        const steps = ["type", "category", "method", "entry"];
                        const currentIndex = steps.indexOf(currentStep);
                        const stepIndex = steps.indexOf(step);
                        return (
                          <div
                            key={step}
                            className={`h-1 rounded-full transition-all ${
                              stepIndex <= currentIndex
                                ? "w-8 bg-primary"
                                : "w-4 bg-surface-hover"
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Continue Button */}
                    <motion.button
                      whileHover={canContinue() ? { scale: 1.02 } : {}}
                      whileTap={canContinue() ? { scale: 0.98 } : {}}
                      onClick={handleContinue}
                      disabled={!canContinue() || isSubmitting}
                      className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                        canContinue() && !isSubmitting
                          ? "bg-primary text-black"
                          : "bg-surface-hover text-muted cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : currentStep === "entry" ? (
                        "Confirm Transaction"
                      ) : (
                        "Continue"
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Success Modal */}
          <TransactionSuccessModal
            isOpen={currentStep === "success"}
            transactionType={transactionType!}
            amount={formData.amount || "0"}
            category={category}
            merchant={formData.merchant}
            onClose={handleClose}
            onConfirm={handleSuccessConfirm}
          />
        </>
      )}
    </AnimatePresence>
  );
}
