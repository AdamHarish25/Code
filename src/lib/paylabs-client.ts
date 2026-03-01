/**
 * Paylabs API Client
 * Core client for Paylabs Payin (v2.1) and Remit (v1.2) APIs
 * 
 * Documentation:
 * - Payin API v2.1: https://sit-pay.paylabs.co.id/docs
 * - Remit API v1.2: https://sit-remit-api.paylabs.co.id/docs
 */

import {
  signPaylabsPayinRequest,
  signPaylabsRemitRequest,
  verifyPaylabsWebhook,
  generateNonce,
  generateTimestamp,
} from "@/lib/security";

// Configuration from environment
const CONFIG = {
  // Payin API v2.1
  merchantId: process.env.PAYLABS_MERCHANT_ID || "010001",
  payinUrl: process.env.PAYLABS_PAYIN_URL || "https://sit-pay.paylabs.co.id",
  payinVersion: process.env.PAYLABS_VERSION || "v2.1",
  privateKey: process.env.PAYLABS_PRIVATE_KEY || "",
  publicKey: process.env.PAYLABS_PUBLIC_KEY || "",
  
  // Remit API v1.2
  remitUrl: process.env.PAYLABS_REMIT_URL || "https://sit-remit-api.paylabs.co.id",
  remitVersion: process.env.PAYLABS_REMIT_VERSION || "v1.2",
  remitMerchantId: process.env.PAYLABS_REMIT_MERCHANT_ID || "010001",
  
  // Webhook
  webhookSecret: process.env.PAYLABS_WEBHOOK_SECRET || "",
  environment: process.env.PAYLABS_ENVIRONMENT || "sandbox",
};

/**
 * Paylabs API Response Types
 */
export interface PaylabsResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

/**
 * Payin Transaction Request
 */
export interface PayinTransactionRequest {
  transactionId: string;
  amount: number;
  currency: string;
  merchantId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description?: string;
  callbackUrl?: string;
  returnUrl?: string;
  metadata?: Record<string, string>;
}

/**
 * Payin Transaction Response
 */
export interface PayinTransactionResponse {
  transactionId: string;
  paylabsTransactionId: string;
  status: "pending" | "success" | "failed" | "expired";
  paymentUrl?: string;
  qrCodeUrl?: string;
  vaNumber?: string;
  amount: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Remit (Payout) Request
 */
export interface RemitRequest {
  beneficiaryId: string;
  amount: number;
  currency: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  description: string;
  referenceId: string;
  email?: string;
  phone?: string;
}

/**
 * Remit Response
 */
export interface RemitResponse {
  remitId: string;
  paylabsRemitId: string;
  status: "pending" | "processing" | "success" | "failed" | "rejected";
  amount: number;
  currency: string;
  fee: number;
  totalAmount: number;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  createdAt: string;
  processedAt?: string;
}

/**
 * Webhook Payload
 */
export interface WebhookPayload {
  eventId: string;
  eventType: "transaction.success" | "transaction.failed" | "transaction.pending" | "remit.success" | "remit.failed";
  merchantId: string;
  transactionId?: string;
  remitId?: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  signature: string;
  data?: Record<string, unknown>;
}

/**
 * Paylabs Client Class
 */
export class PaylabsClient {
  private merchantId: string;
  private privateKey: string;
  private publicKey: string;
  private payinBaseUrl: string;
  private remitBaseUrl: string;
  private isConfigured: boolean;

  constructor() {
    this.merchantId = CONFIG.merchantId;
    this.privateKey = CONFIG.privateKey;
    this.publicKey = CONFIG.publicKey;
    this.payinBaseUrl = `${CONFIG.payinUrl}/api/${CONFIG.payinVersion}`;
    this.remitBaseUrl = `${CONFIG.remitUrl}/api/${CONFIG.remitVersion}`;
    this.isConfigured = !!(this.privateKey && this.merchantId);
    
    if (!this.isConfigured && CONFIG.environment !== "production") {
      console.warn("[Paylabs] Client not fully configured. Running in mock mode.");
    }
  }

  /**
   * Create Payin Transaction
   * POST /pay/create
   */
  async createPayinTransaction(
    request: PayinTransactionRequest
  ): Promise<PaylabsResponse<PayinTransactionResponse>> {
    try {
      if (!this.isConfigured) {
        return this.mockPayinResponse(request);
      }

      const nonce = generateNonce();
      const timestamp = generateTimestamp();
      
      const { signature } = signPaylabsPayinRequest({
        merchantId: this.merchantId,
        transactionId: request.transactionId,
        amount: request.amount,
        privateKey: this.privateKey,
      });

      const payload = {
        merchantId: this.merchantId,
        transactionId: request.transactionId,
        amount: request.amount,
        currency: request.currency || "IDR",
        customerEmail: request.customerEmail,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        description: request.description,
        callbackUrl: request.callbackUrl || CONFIG.webhookSecret ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/paylabs` : undefined,
        returnUrl: request.returnUrl,
        metadata: request.metadata,
        signature,
        timestamp,
        nonce,
      };

      const response = await fetch(`${this.payinBaseUrl}/pay/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Paylabs-Merchant-ID": this.merchantId,
          "X-Paylabs-Timestamp": timestamp,
          "X-Paylabs-Nonce": nonce,
          "X-Paylabs-Signature": signature,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          statusCode: response.status,
          error: {
            code: data.code || "API_ERROR",
            message: data.message || "Failed to create transaction",
            details: data.details,
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        statusCode: response.status,
        data: data.data as PayinTransactionResponse,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Paylabs] Create Payin error:", error);
      return {
        success: false,
        statusCode: 500,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get Transaction Status
   * GET /pay/status/:transactionId
   */
  async getTransactionStatus(
    transactionId: string
  ): Promise<PaylabsResponse<PayinTransactionResponse>> {
    try {
      if (!this.isConfigured) {
        return this.mockPayinStatusResponse(transactionId);
      }

      const timestamp = generateTimestamp();
      const nonce = generateNonce();
      
      const signatureString = `${this.merchantId}|${transactionId}|${timestamp}|${nonce}`;
      const signature = signPayload(signatureString, this.privateKey);

      const response = await fetch(
        `${this.payinBaseUrl}/pay/status/${transactionId}`,
        {
          method: "GET",
          headers: {
            "X-Paylabs-Merchant-ID": this.merchantId,
            "X-Paylabs-Timestamp": timestamp,
            "X-Paylabs-Nonce": nonce,
            "X-Paylabs-Signature": signature,
          },
        }
      );

      const data = await response.json();

      return {
        success: response.ok,
        statusCode: response.status,
        data: response.ok ? data.data : undefined,
        error: response.ok
          ? undefined
          : {
              code: data.code || "API_ERROR",
              message: data.message || "Failed to get status",
            },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Paylabs] Get status error:", error);
      return {
        success: false,
        statusCode: 500,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Create Remit (Payout)
   * POST /remit/create
   */
  async createRemit(
    request: RemitRequest
  ): Promise<PaylabsResponse<RemitResponse>> {
    try {
      if (!this.isConfigured) {
        return this.mockRemitResponse(request);
      }

      const { signature, timestamp, nonce } = signPaylabsRemitRequest({
        merchantId: CONFIG.remitMerchantId,
        beneficiaryId: request.beneficiaryId,
        amount: request.amount,
        privateKey: this.privateKey,
      });

      const payload = {
        merchantId: CONFIG.remitMerchantId,
        beneficiaryId: request.beneficiaryId,
        amount: request.amount,
        currency: request.currency || "IDR",
        bankCode: request.bankCode,
        accountNumber: request.accountNumber,
        accountName: request.accountName,
        description: request.description,
        referenceId: request.referenceId,
        email: request.email,
        phone: request.phone,
        signature,
        timestamp,
        nonce,
      };

      const response = await fetch(`${this.remitBaseUrl}/remit/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Paylabs-Merchant-ID": CONFIG.remitMerchantId,
          "X-Paylabs-Timestamp": timestamp,
          "X-Paylabs-Nonce": nonce,
          "X-Paylabs-Signature": signature,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      return {
        success: response.ok,
        statusCode: response.status,
        data: response.ok ? data.data : undefined,
        error: response.ok
          ? undefined
          : {
              code: data.code || "API_ERROR",
              message: data.message || "Failed to create remit",
            },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Paylabs] Create Remit error:", error);
      return {
        success: false,
        statusCode: 500,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Verify Webhook Signature
   */
  verifyWebhookSignature(payload: WebhookPayload): boolean {
    const { signature, ...data } = payload;
    const payloadString = JSON.stringify(data);
    
    return verifyPaylabsWebhook({
      payload: payloadString,
      signature: payload.signature,
      publicKey: this.publicKey,
    });
  }

  /**
   * Mock Payin Response (for development without API keys)
   */
  private async mockPayinResponse(
    request: PayinTransactionRequest
  ): Promise<PaylabsResponse<PayinTransactionResponse>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockResponse: PaylabsResponse<PayinTransactionResponse> = {
      success: true,
      statusCode: 200,
      data: {
        transactionId: request.transactionId,
        paylabsTransactionId: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        status: "success", 
        paymentUrl: `https://sit-pay.paylabs.co.id/pay/${request.transactionId}`,
        amount: request.amount,
        currency: request.currency || "IDR",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      },
      timestamp: new Date().toISOString(),
    };

    // AUTO-APPROVE: Immediately send success webhook
    if (request.callbackUrl) {
      setTimeout(() => {
        this.simulateWebhookCallback(request, mockResponse.data!, "transaction.success");
      }, 500); // Send webhook after 500ms
    }

    return mockResponse;
  }

  /**
   * Simulate webhook callback for testing
   */
  private async simulateWebhookCallback(
    request: PayinTransactionRequest,
    response: PayinTransactionResponse,
    eventType: string = "transaction.success"
  ) {
    const webhookPayload = {
      eventId: `evt_${Date.now()}`,
      eventType: eventType,
      merchantId: this.merchantId,
      transactionId: response.transactionId,
      amount: response.amount,
      currency: response.currency,
      status: response.status,
      timestamp: new Date().toISOString(),
      signature: "mock_signature",
      data: request.metadata,
    };

    console.log("[Paylabs] 🎯 AUTO-APPROVE: Sending webhook:", webhookPayload);

    // Send webhook to callback URL
    try {
      await fetch(request.callbackUrl || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-paylabs-signature": webhookPayload.signature,
          "x-paylabs-timestamp": webhookPayload.timestamp,
          "x-paylabs-merchant-id": this.merchantId,
        },
        body: JSON.stringify(webhookPayload),
      });
      console.log("[Paylabs] ✅ Webhook sent - transaction approved!");
    } catch (error) {
      console.error("[Paylabs] Webhook failed:", error);
    }
  }

  /**
   * Mock Payin Status Response
   */
  private async mockPayinStatusResponse(
    transactionId: string
  ): Promise<PaylabsResponse<PayinTransactionResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      statusCode: 200,
      data: {
        transactionId,
        paylabsTransactionId: `pl_${Date.now()}`,
        status: "success",
        amount: 100000,
        currency: "IDR",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Mock Remit Response
   */
  private async mockRemitResponse(
    request: RemitRequest
  ): Promise<PaylabsResponse<RemitResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      statusCode: 200,
      data: {
        remitId: request.referenceId,
        paylabsRemitId: `rl_${Date.now()}`,
        status: "pending",
        amount: request.amount,
        currency: request.currency || "IDR",
        fee: 2500,
        totalAmount: request.amount + 2500,
        beneficiaryName: request.accountName,
        bankName: "BCA",
        accountNumber: request.accountNumber,
        createdAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// Helper function for RSA signing (used internally)
function signPayload(payload: string, privateKey: string): string {
  const { createSign } = require("crypto");
  const sign = createSign("SHA256");
  sign.update(payload, "utf8");
  sign.end();
  return sign.sign(privateKey, "base64");
}

// Singleton instance
let paylabsClient: PaylabsClient | null = null;

export function getPaylabsClient(): PaylabsClient {
  if (!paylabsClient) {
    paylabsClient = new PaylabsClient();
  }
  return paylabsClient;
}
