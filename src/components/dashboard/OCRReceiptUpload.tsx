"use client";

/**
 * OCRReceiptUpload Component
 * Step 4: Photo/Upload receipt with AI OCR extraction
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  FileUp,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import { extractReceiptData, suggestCategory } from "@/actions/ocr";
import { TransactionType } from "@/types/dashboard";

/**
 * Convert file to base64 for OCR processing (client-side only)
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || result;
      resolve(`data:image/jpeg;base64,${base64}`);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface OCRReceiptUploadProps {
  transactionType: TransactionType;
  method: "photo" | "upload";
  onExtractComplete: (data: {
    merchant: string;
    date: string;
    amount: string;
    category?: string;
  }) => void;
  onFileSelect?: (file: File | null) => void;
}

export function OCRReceiptUpload({
  transactionType,
  method,
  onExtractComplete,
  onFileSelect,
}: OCRReceiptUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    merchant: string;
    date: string;
    amount: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    onFileSelect?.(file);
    setError(null);
    setExtractedData(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Convert to base64 for OCR
    try {
      const base64 = await fileToBase64(file);
      await processOCR(base64);
    } catch (err) {
      setError("Failed to process image");
      console.error(err);
    }
  }, [onFileSelect]);

  const processOCR = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Extract receipt data using Qwen Vision
      const ocrResult = await extractReceiptData(imageData, true);

      if (ocrResult.success && ocrResult.data) {
        const { merchant, date, amount } = ocrResult.data;

        setExtractedData({ merchant, date, amount });

        // Auto-suggest category based on merchant
        const categoryResult = await suggestCategory(merchant, amount, transactionType);

        onExtractComplete({
          merchant,
          date,
          amount: amount.toString(),
          category: categoryResult.category,
        });
      } else {
        setError(ocrResult.error || "Failed to extract receipt data");
      }
    } catch (err) {
      setError("OCR processing failed. Please try manual entry.");
      console.error("OCR error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect?.(null);
  };

  const retryOCR = () => {
    if (previewUrl) {
      processOCR(previewUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold mb-2">
          {method === "photo" ? "Take a Photo" : "Upload Receipt"}
        </h2>
        <p className="text-muted">
          AI will extract merchant, date, and amount automatically
        </p>
      </div>

      {/* File Upload Area */}
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="space-y-4"
        >
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-3xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture={method === "photo" ? "environment" : undefined}
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {method === "photo" ? (
                <Camera className="w-10 h-10 text-primary" />
              ) : (
                <FileUp className="w-10 h-10 text-primary" />
              )}
            </div>
            <p className="text-lg font-semibold mb-2">
              {method === "photo"
                ? "Tap to take a photo"
                : "Drop your receipt here"}
            </p>
            <p className="text-sm text-muted">
              or click to {method === "photo" ? "open camera" : "browse files"}
            </p>
          </div>

          {/* Supported formats */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              JPG, PNG
            </span>
            <span>•</span>
            <span>Max 10MB</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-surface border border-border">
            <img
              src={previewUrl || ""}
              alt="Receipt preview"
              className="w-full h-48 object-cover"
            />
            <button
              onClick={removeFile}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Processing Overlay */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mb-3"
                    >
                      <Loader2 className="w-10 h-10 text-primary" />
                    </motion.div>
                    <p className="text-white font-medium">Analyzing receipt...</p>
                    <p className="text-white/70 text-sm">AI is extracting details</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Extracted Data Display */}
          {extractedData && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-success-dim border border-success/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-medium text-success">Data Extracted</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Merchant:</span>
                  <span className="font-medium">{extractedData.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Date:</span>
                  <span className="font-medium">{extractedData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Amount:</span>
                  <span className="font-medium text-primary">
                    ${extractedData.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-danger-dim border border-danger/20"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-danger">Extraction Failed</p>
                  <p className="text-sm text-muted mt-1">{error}</p>
                  <button
                    onClick={retryOCR}
                    className="mt-2 text-sm text-primary flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Manual Edit Fields */}
          {extractedData && !isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-sm font-medium text-muted">
                Review and edit if needed:
              </p>
              {/* Fields will be populated by parent component via onExtractComplete */}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
