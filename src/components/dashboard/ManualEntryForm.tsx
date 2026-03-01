"use client";

/**
 * ManualEntryForm Component
 * Step 4: Manual data entry form for transactions
 */

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Calendar,
  FileText,
  Paperclip,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { TransactionFormData, TransactionType } from "@/types/dashboard";

interface ManualEntryFormProps {
  transactionType: TransactionType;
  category: string;
  account: string;
  formData: Partial<TransactionFormData>;
  onChange: (data: Partial<TransactionFormData>) => void;
  onFileSelect?: (file: File) => void;
}

export function ManualEntryForm({
  transactionType,
  category,
  account,
  formData,
  onChange,
  onFileSelect,
}: ManualEntryFormProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChange(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect?.(null as unknown as File);
  };

  return (
    <div className="space-y-5">
      {/* Summary Card */}
      <div className="p-4 rounded-2xl bg-surface border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted">Category</span>
          <span className="text-sm font-medium capitalize">{category}</span>
        </div>
        {transactionType === "income" && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Account</span>
            <span className="text-sm font-medium capitalize">{account}</span>
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Amount</label>
        <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="number"
            value={formData.amount || ""}
            onChange={(e) => onChange({ amount: e.target.value })}
            placeholder="0.00"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface border-2 border-border focus:border-primary focus:outline-none transition-colors text-lg font-semibold"
            step="0.01"
            min="0"
            autoFocus
          />
        </div>
      </div>

      {/* Date Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="date"
            value={formData.date || new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange({ date: e.target.value })}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface border-2 border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Merchant Name (for expenses) */}
      {transactionType === "expense" && (
        <div>
          <label className="block text-sm font-medium mb-2">Merchant</label>
          <input
            type="text"
            value={formData.merchant || ""}
            onChange={(e) => onChange({ merchant: e.target.value })}
            placeholder="Store or restaurant name"
            className="w-full px-4 py-4 rounded-2xl bg-surface border-2 border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Note Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Note <span className="text-muted">(optional)</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-4 top-4 w-5 h-5 text-muted" />
          <textarea
            value={formData.note || ""}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="Add a note for this transaction..."
            rows={3}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface border-2 border-border focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>

      {/* File Attachment */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Attachment <span className="text-muted">(optional)</span>
        </label>
        {formData.attachment ? (
          <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {formData.attachment.name}
                </p>
                <p className="text-xs text-muted">
                  {(formData.attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 rounded-lg hover:bg-danger/10 transition-colors"
            >
              <X className="w-5 h-5 text-danger" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed transition-colors cursor-pointer ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="flex flex-col items-center text-center">
              <Paperclip className="w-8 h-8 text-muted mb-2" />
              <p className="text-sm font-medium">
                Drop your file here, or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted mt-1">
                Supports: JPG, PNG, PDF (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
