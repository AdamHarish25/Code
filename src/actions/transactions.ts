/**
 * Transaction Entry Server Actions
 * Handles transaction creation with Paylabs & Supabase integration
 */

"use server";

import { TransactionFormData } from "@/types/dashboard";
import { processPayinTransaction } from "@/lib/paylabs-services";
import { createTransaction as dbCreateTransaction } from "@/lib/database";

interface TransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  paylabsResponse?: {
    status: string;
    gatewayId: string;
    timestamp: string;
  };
}

/**
 * Create a new transaction with Paylabs & Supabase integration
 */
export async function createTransaction(
  data: TransactionFormData
): Promise<TransactionResult> {
  try {
    // Validate required fields
    if (!data.type || !data.category || !data.account || !data.amount || !data.date) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: "Invalid amount",
      };
    }

    // Use Paylabs service for transaction processing
    const paylabsResult = await processPayinTransaction(data);

    if (!paylabsResult.success) {
      return {
        success: false,
        error: paylabsResult.error || "Failed to process transaction",
      };
    }

    // Save to Supabase database
    const dbResult = await dbCreateTransaction({
      user_id: "current-user-id", // Replace with actual user ID from auth
      type: data.type,
      category: data.category,
      account: data.account,
      amount: amount,
      merchant: data.merchant || null,
      date: data.date,
      note: data.note || null,
      attachment_url: null, // Would come from file upload
      input_method: data.attachment ? "upload" : "manual",
      status: "pending",
      paylabs_transaction_id: paylabsResult.paylabsTransactionId || null,
      paylabs_gateway_id: paylabsResult.paylabsTransactionId || null,
      ai_category: paylabsResult.aiCategory || null,
      ai_confidence: paylabsResult.aiCategory ? 0.8 : null,
      metadata: {
        paylabsStatus: paylabsResult.status,
      },
    });

    if (!dbResult.success) {
      console.warn("[Transaction] Paylabs success but DB failed:", dbResult.error);
      // Still return success since Paylabs processed it
    }

    console.log(`Transaction created: ${paylabsResult.transactionId}`);
    console.log(`Paylabs ID: ${paylabsResult.paylabsTransactionId}`);
    console.log(`DB ID: ${(dbResult.data as any)?.id || "N/A"}`);
    console.log(`Type: ${data.type}, Category: ${data.category}, Amount: $${amount}`);
    console.log(`AI Category: ${paylabsResult.aiCategory || "N/A"}`);

    return {
      success: true,
      transactionId: paylabsResult.transactionId,
      paylabsResponse: {
        status: paylabsResult.status || "pending",
        gatewayId: paylabsResult.paylabsTransactionId || "",
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Transaction creation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Simulate Paylabs Gateway API POST request
 * Deprecated: Use paylabs-services.ts instead
 */
async function simulatePaylabsGateway(
  transaction: {
    transactionId: string;
    type: string;
    category: string;
    account: string;
    amount: number;
    date: string;
    merchant?: string;
    note?: string;
  }
): Promise<{ success: boolean; data?: TransactionResult["paylabsResponse"]; error?: string }> {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate gateway response
    const gatewayResponse = {
      status: "success",
      gatewayId: `paylabs_${Date.now()}`,
      timestamp: new Date().toISOString(),
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
    };

    console.log("[Paylabs Simulation] Transaction processed:", gatewayResponse);

    // In production, this would be:
    // const response = await fetch('https://api.paylabs.io/v1/transactions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.PAYLABS_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     transaction_id: transaction.transactionId,
    //     amount: transaction.amount,
    //     type: transaction.type,
    //     category: transaction.category,
    //     merchant: transaction.merchant,
    //     date: transaction.date,
    //     note: transaction.note,
    //   }),
    // });
    // return await response.json();

    return {
      success: true,
      data: {
        status: gatewayResponse.status,
        gatewayId: gatewayResponse.gatewayId,
        timestamp: gatewayResponse.timestamp,
      },
    };
  } catch (error) {
    console.error("Paylabs gateway simulation error:", error);
    return {
      success: false,
      error: "Gateway communication failed",
    };
  }
}

/**
 * Validate transaction data before submission
 */
export async function validateTransaction(
  data: TransactionFormData
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Required field validation
  if (!data.type) errors.push("Transaction type is required");
  if (!data.category) errors.push("Category is required");
  if (!data.account) errors.push("Account is required");
  if (!data.amount) errors.push("Amount is required");
  if (!data.date) errors.push("Date is required");

  // Amount validation
  if (data.amount) {
    const amount = parseFloat(data.amount);
    if (isNaN(amount)) errors.push("Amount must be a valid number");
    if (amount <= 0) errors.push("Amount must be greater than 0");
    if (amount > 1000000) errors.push("Amount exceeds maximum limit");
  }

  // Date validation
  if (data.date) {
    const date = new Date(data.date);
    const now = new Date();
    if (date > now) errors.push("Date cannot be in the future");
    if (date.getFullYear() < 2000) errors.push("Date is too far in the past");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get suggested categories based on transaction type
 */
export async function getCategoriesForType(type: "income" | "expense") {
  const expenseCategories = [
    { value: "housing", label: "Rent & Utilities", icon: "home", type: "expense" as const },
    { value: "food", label: "Food and Beverage", icon: "utensils", type: "expense" as const },
    { value: "transport", label: "Public Transport", icon: "train", type: "expense" as const },
    { value: "healthcare", label: "Healthcare", icon: "heart", type: "expense" as const },
    { value: "entertainment", label: "Entertainment", icon: "gamepad", type: "expense" as const },
    { value: "shopping", label: "Shopping", icon: "shopping-bag", type: "expense" as const },
    { value: "utilities", label: "Utilities", icon: "zap", type: "expense" as const },
    { value: "other", label: "Other", icon: "more-horizontal", type: "both" as const },
  ];

  const incomeCategories = [
    { value: "salary", label: "Salary", icon: "wallet", type: "income" as const },
    { value: "freelance", label: "Freelancing", icon: "laptop", type: "income" as const },
    { value: "investment", label: "Investment", icon: "trending-up", type: "income" as const },
    { value: "side-hustle", label: "Side Hustle", icon: "briefcase", type: "income" as const },
    { value: "other", label: "Other Income", icon: "more-horizontal", type: "both" as const },
  ];

  if (type === "income") return incomeCategories;
  if (type === "expense") return expenseCategories;
  return [...expenseCategories, ...incomeCategories];
}

/**
 * Get income account options
 */
export async function getIncomeAccounts() {
  return [
    { value: "salary", label: "Salary", icon: "wallet" },
    { value: "freelance", label: "Freelance Work", icon: "laptop" },
    { value: "digital-marketing", label: "Digital Marketing", icon: "megaphone" },
    { value: "stock-dividends", label: "Stock Dividends", icon: "trending-up" },
    { value: "rental", label: "Rental Income", icon: "home" },
    { value: "side-hustle", label: "Side Hustle", icon: "briefcase" },
    { value: "other", label: "Other", icon: "more-horizontal" },
  ];
}
