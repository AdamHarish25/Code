/**
 * Paylabs Services
 * High-level services for Payin and Remit operations with AI integration
 */

"use server";

import { getPaylabsClient, PayinTransactionRequest, RemitRequest } from "@/lib/paylabs-client";
import { suggestCategory } from "@/actions/ocr";
import { TransactionFormData } from "@/types/dashboard";

/**
 * Payin Service Response
 */
interface PayinServiceResponse {
  success: boolean;
  transactionId?: string;
  paylabsTransactionId?: string;
  paymentUrl?: string;
  status?: string;
  error?: string;
  aiCategory?: string;
}

/**
 * Remit Service Response
 */
interface RemitServiceResponse {
  success: boolean;
  remitId?: string;
  paylabsRemitId?: string;
  status?: string;
  fee?: number;
  totalAmount?: number;
  error?: string;
}

/**
 * Process Payin Transaction with AI Categorization
 * This is the main entry point for expense transactions
 */
export async function processPayinTransaction(
  data: TransactionFormData
): Promise<PayinServiceResponse> {
  try {
    const client = getPaylabsClient();
    
    // Generate unique transaction ID
    const transactionId = `duitly_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // AI-powered categorization if merchant provided
    let aiCategory: string | undefined;
    if (data.merchant && data.type === "expense") {
      const amount = parseFloat(data.amount) || 0;
      const categoryResult = await suggestCategory(data.merchant, amount, "expense");
      aiCategory = categoryResult.category;
    }
    
    // Create Paylabs Payin request
    const payinRequest: PayinTransactionRequest = {
      transactionId,
      amount: parseFloat(data.amount) || 0,
      currency: "IDR",
      merchantId: process.env.PAYLABS_MERCHANT_ID || "010001",
      customerEmail: "customer@example.com", // Would come from user session
      customerName: "Customer Name", // Would come from user session
      customerPhone: data.type === "expense" ? undefined : "+62xxx",
      description: data.note || `${data.type} - ${data.category}`,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/paylabs`,
      metadata: {
        category: data.category,
        type: data.type,
        account: data.account,
        aiCategory: aiCategory || "",
        merchant: data.merchant || "",
      },
    };
    
    // Send to Paylabs
    const response = await client.createPayinTransaction(payinRequest);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error?.message || "Failed to process transaction",
        aiCategory,
      };
    }
    
    return {
      success: true,
      transactionId,
      paylabsTransactionId: response.data?.paylabsTransactionId,
      paymentUrl: response.data?.paymentUrl,
      status: response.data?.status,
      aiCategory,
    };
  } catch (error) {
    console.error("[Payin Service] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Process Remit (Payout) Transaction
 * Used for withdrawals, transfers, or payouts to beneficiaries
 */
export async function processRemitTransaction(
  request: {
    beneficiaryId: string;
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    description: string;
    referenceId: string;
    email?: string;
    phone?: string;
  }
): Promise<RemitServiceResponse> {
  try {
    const client = getPaylabsClient();
    
    const remitRequest: RemitRequest = {
      beneficiaryId: request.beneficiaryId,
      amount: request.amount,
      currency: "IDR",
      bankCode: request.bankCode,
      accountNumber: request.accountNumber,
      accountName: request.accountName,
      description: request.description,
      referenceId: request.referenceId,
      email: request.email,
      phone: request.phone,
    };
    
    const response = await client.createRemit(remitRequest);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error?.message || "Failed to process remit",
      };
    }
    
    return {
      success: true,
      remitId: response.data?.remitId,
      paylabsRemitId: response.data?.paylabsRemitId,
      status: response.data?.status,
      fee: response.data?.fee,
      totalAmount: response.data?.totalAmount,
    };
  } catch (error) {
    console.error("[Remit Service] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get Transaction Status from Paylabs
 */
export async function getTransactionStatus(
  transactionId: string
): Promise<{
  success: boolean;
  status?: string;
  amount?: number;
  currency?: string;
  error?: string;
}> {
  try {
    const client = getPaylabsClient();
    const response = await client.getTransactionStatus(transactionId);
    
    if (!response.success) {
      return {
        success: false,
        error: response.error?.message || "Failed to get status",
      };
    }
    
    return {
      success: true,
      status: response.data?.status,
      amount: response.data?.amount,
      currency: response.data?.currency,
    };
  } catch (error) {
    console.error("[Status Service] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Simulate Paylabs Webhook for Development
 * Call this to test webhook handling without real Paylabs callbacks
 */
export async function simulatePaylabsWebhook(
  eventType: "transaction.success" | "transaction.failed" | "transaction.pending",
  transactionId: string,
  amount: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // In development, we'll just log the webhook event
    // In production, Paylabs would call our webhook endpoint directly
    console.log("[Webhook Simulation]", {
      eventType,
      transactionId,
      amount,
      timestamp: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: `Webhook ${eventType} simulated for transaction ${transactionId}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Simulation failed",
    };
  }
}
