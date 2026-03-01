/**
 * OCR Server Actions
 * Uses Alibaba Cloud Qwen Vision API to extract data from receipts
 * Updated to use new compatible-mode API
 */

"use server";

import { OCRResult } from "@/types/dashboard";
import { extractReceiptOCR, smartCategorize as aiCategorize } from "@/lib/qwen-client";

interface OCRResponse {
  success: boolean;
  data?: OCRResult;
  error?: string;
}

/**
 * Extract receipt data from image using Qwen Vision API
 * Supports JPEG, PNG, PDF, and base64 images
 */
export async function extractReceiptData(
  imageUrl: string,
  isBase64: boolean = false
): Promise<OCRResponse> {
  try {
    // Use the new Qwen client for OCR
    const ocrResult = await extractReceiptOCR(imageUrl, isBase64);

    return {
      success: true,
      data: ocrResult,
    };
  } catch (error) {
    console.error("OCR extraction failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "OCR failed",
    };
  }
}

/**
 * Auto-categorize merchant based on name
 * Uses Qwen to suggest the best category
 */
export async function suggestCategory(
  merchant: string,
  amount: number,
  type: "income" | "expense" = "expense"
): Promise<{ category: string; confidence: number }> {
  try {
    // Use the new Qwen client for smart categorization
    const result = await aiCategorize(merchant, amount, type);
    return { category: result.category, confidence: result.confidence };
  } catch (error) {
    console.error("Category suggestion failed:", error);
    return { category: fallbackCategorize(merchant, type), confidence: 0.5 };
  }
}

/**
 * Fallback categorization based on keywords
 */
function fallbackCategorize(
  merchant: string,
  type: "income" | "expense"
): string {
  const lower = merchant.toLowerCase();

  if (type === "income") {
    const incomeKeywords: Record<string, string> = {
      salary: "salary",
      payroll: "salary",
      freelance: "freelance",
      upwork: "freelance",
      fiverr: "freelance",
      dividend: "investment",
      interest: "investment",
      rental: "investment",
      uber: "side-hustle",
      lyft: "side-hustle",
      doordash: "side-hustle",
    };

    for (const [keyword, category] of Object.entries(incomeKeywords)) {
      if (lower.includes(keyword)) return category;
    }

    return "other";
  }

  // Expense categorization
  const expenseKeywords: Record<string, string> = {
    mcdonald: "food",
    burger: "food",
    pizza: "food",
    restaurant: "food",
    cafe: "food",
    starbucks: "food",
    grocery: "food",
    supermarket: "food",
    walmart: "shopping",
    target: "shopping",
    amazon: "shopping",
    uber: "transport",
    lyft: "transport",
    taxi: "transport",
      gas: "transport",
    fuel: "transport",
    shell: "transport",
    chevron: "transport",
    netflix: "entertainment",
    spotify: "entertainment",
    cinema: "entertainment",
    game: "entertainment",
    pharmacy: "healthcare",
    hospital: "healthcare",
    clinic: "healthcare",
    rent: "housing",
    mortgage: "housing",
    electric: "utilities",
    water: "utilities",
    internet: "utilities",
    phone: "utilities",
  };

  for (const [keyword, category] of Object.entries(expenseKeywords)) {
    if (lower.includes(keyword)) return category;
  }

  return "other";
}
