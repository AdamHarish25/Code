/**
 * Paylabs Webhook Handler
 * Handles incoming webhooks from Paylabs with signature verification
 *
 * Payin API v2.1 Webhooks:
 * - transaction.success
 * - transaction.failed
 * - transaction.pending
 * - transaction.expired
 *
 * Remit API v1.2 Webhooks:
 * - remit.success
 * - remit.failed
 * - remit.processing
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPaylabsWebhook } from "@/lib/security";
import { smartCategorize } from "@/lib/qwen-client";
import { createClient } from "@supabase/supabase-js";

// In-memory store for demo (replace with database in production)
const processedWebhooks = new Map<string, WebhookEvent>();
const pendingNotifications: WebhookEvent[] = [];

interface WebhookEvent {
  eventId: string;
  eventType: string;
  merchantId: string;
  transactionId?: string;
  remitId?: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

/**
 * POST /api/webhooks/paylabs
 * Handles incoming Paylabs webhook events with signature verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-paylabs-signature");
    const timestamp = request.headers.get("x-paylabs-timestamp");
    const nonce = request.headers.get("x-paylabs-nonce");
    const merchantId = request.headers.get("x-paylabs-merchant-id");

    // Validate required headers
    if (!signature || !timestamp || !merchantId) {
      console.warn("[Webhook] Missing required headers");
      return NextResponse.json(
        { error: "Missing required headers" },
        { status: 400 }
      );
    }

    // Verify webhook signature (skip in sandbox mode)
    const publicKey = process.env.PAYLABS_PUBLIC_KEY;
    if (publicKey && process.env.PAYLABS_ENVIRONMENT === "production") {
      const payloadString = JSON.stringify(body);
      const isValid = verifyPaylabsWebhook({
        payload: payloadString,
        signature,
        publicKey,
      });

      if (!isValid) {
        console.error("[Webhook] Invalid signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Validate payload
    const event = body as WebhookEvent;
    if (!event.eventId || !event.eventType || !event.merchantId) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Prevent duplicate processing
    if (processedWebhooks.has(event.eventId)) {
      console.log(`[Webhook] Event ${event.eventId} already processed`);
      return NextResponse.json({ success: true, duplicate: true });
    }

    processedWebhooks.set(event.eventId, event);

    console.log(`[Webhook] Received ${event.eventType} for merchant ${event.merchantId}`);

    // Process based on event type
    switch (event.eventType) {
      case "transaction.success":
        await handleTransactionSuccess(event);
        break;
      case "transaction.failed":
        await handleTransactionFailed(event);
        break;
      case "transaction.pending":
        await handleTransactionPending(event);
        break;
      case "transaction.expired":
        await handleTransactionExpired(event);
        break;
      case "remit.success":
        await handleRemitSuccess(event);
        break;
      case "remit.failed":
        await handleRemitFailed(event);
        break;
      default:
        console.log(`[Webhook] Unhandled event type: ${event.eventType}`);
    }

    // Add to pending notifications for client polling
    pendingNotifications.push(event);

    // Keep only last 20 notifications
    if (pendingNotifications.length > 20) {
      pendingNotifications.shift();
    }

    return NextResponse.json({
      success: true,
      eventId: event.eventId,
      processed: true,
    });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/paylabs
 * Retrieve pending notifications (for client polling)
 */
export async function GET() {
  const events = [...pendingNotifications];
  pendingNotifications.length = 0; // Clear after retrieval

  return NextResponse.json({
    success: true,
    events,
    count: events.length,
  });
}

/**
 * Handle successful transaction
 * Saves transaction to database with AI categorization
 */
async function handleTransactionSuccess(event: WebhookEvent) {
  console.log(`[Webhook] Transaction success: ${event.transactionId} - $${event.amount}`);

  // Extract data from metadata
  const metadata = event.data as Record<string, unknown> | undefined;
  const merchant = metadata?.merchant as string | undefined;
  let category = metadata?.category as string | undefined;
  const aiCategory = metadata?.aiCategory as string | undefined;
  const type = metadata?.type as string | undefined;
  const account = metadata?.account as string | undefined;
  const note = metadata?.note as string | undefined;

  // AI categorization if merchant provided and no category
  if (merchant && !category) {
    try {
      const categoryResult = await smartCategorize(merchant, event.amount, type as "expense" | "income");
      console.log(`[Webhook] AI categorized ${merchant} as ${categoryResult.category}`);
      category = categoryResult.category;
    } catch (error) {
      console.error("[Webhook] AI categorization failed:", error);
      category = "other";
    }
  }

  // Save to Supabase database
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log("[Webhook] Looking for transaction with paylabs_transaction_id:", event.transactionId);

    // First, try to find the transaction by paylabs_transaction_id
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("id, paylabs_transaction_id")
      .eq("paylabs_transaction_id", event.transactionId)
      .single();

    console.log("[Webhook] Found transaction:", existingTransaction);

    let updateError;
    
    if (existingTransaction) {
      // Update existing transaction
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          paylabs_response: event,
          ai_category: category || aiCategory,
          ai_confidence: 0.8,
          metadata: {
            ...metadata,
            paylabsEventId: event.eventId,
            confirmedAt: new Date().toISOString(),
          },
        })
        .eq("id", existingTransaction.id);
      
      updateError = error;
    } else {
      // Transaction not found by paylabs_transaction_id, try matching by amount and merchant
      // This handles cases where the transaction was created without a paylabs ID
      const { data: matchedTransaction } = await supabase
        .from("transactions")
        .select("id")
        .eq("merchant", metadata?.merchant as string)
        .eq("amount", event.amount)
        .eq("type", metadata?.type as string)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      console.log("[Webhook] Matched transaction:", matchedTransaction);
      
      if (matchedTransaction) {
        // Update the matched transaction
        const { error } = await supabase
          .from("transactions")
          .update({
            status: "completed",
            paylabs_transaction_id: event.transactionId,
            paylabs_response: event,
            ai_category: category || aiCategory,
            ai_confidence: 0.8,
            metadata: {
              ...metadata,
              paylabsEventId: event.eventId,
              confirmedAt: new Date().toISOString(),
            },
          })
          .eq("id", matchedTransaction.id);
        
        updateError = error;
      } else {
        console.warn("[Webhook] No matching transaction found, creating new one");
        
        // Create new transaction if none found
        const { error } = await supabase
          .from("transactions")
          .insert({
            user_id: "60e15ee0-189b-4701-8afa-75bde3167ac5", // Your user ID
            type: metadata?.type || "expense",
            category: category || (metadata?.category as string) || "other",
            account: (metadata?.account as string) || "cash",
            amount: event.amount,
            merchant: metadata?.merchant as string,
            date: new Date().toISOString().split("T")[0],
            status: "completed",
            paylabs_transaction_id: event.transactionId,
            paylabs_response: event,
            ai_category: category || aiCategory,
            ai_confidence: 0.8,
            input_method: "manual",
            metadata: {
              ...metadata,
              paylabsEventId: event.eventId,
              confirmedAt: new Date().toISOString(),
            },
          });
        
        updateError = error;
      }
    }

    if (updateError) {
      console.error("[Webhook] Failed to update transaction:", updateError);
    } else {
      console.log(`[Webhook] ✅ Transaction ${event.transactionId} marked as completed`);
    }
  } catch (error) {
    console.error("[Webhook] Database update failed:", error);
  }
}

/**
 * Get user ID from transaction (for webhook confirmation)
 * In production, this would query your database
 */
async function getUserIdFromTransaction(transactionId?: string): Promise<string | null> {
  // For now, return a default user ID for testing
  // In production, query your database using transactionId
  return "60e15ee0-189b-4701-8afa-75bde3167ac5"; // Your user ID
}

/**
 * Handle failed transaction
 */
async function handleTransactionFailed(event: WebhookEvent) {
  console.log(`[Webhook] Transaction failed: ${event.transactionId} - $${event.amount}`);

  // In production:
  // 1. Update transaction status
  // 2. Notify user of failure
  // 3. Log for analysis
}

/**
 * Handle pending transaction
 */
async function handleTransactionPending(event: WebhookEvent) {
  console.log(`[Webhook] Transaction pending: ${event.transactionId} - $${event.amount}`);

  // In production:
  // 1. Update transaction status
  // 2. Show pending state in UI
}

/**
 * Handle expired transaction
 */
async function handleTransactionExpired(event: WebhookEvent) {
  console.log(`[Webhook] Transaction expired: ${event.transactionId}`);

  // In production:
  // 1. Update transaction status
  // 2. Notify user
}

/**
 * Handle successful remit (payout)
 */
async function handleRemitSuccess(event: WebhookEvent) {
  console.log(`[Webhook] Remit success: ${event.remitId} - $${event.amount}`);

  // In production:
  // 1. Update remit status
  // 2. Deduct from user balance
  // 3. Notify user
}

/**
 * Handle failed remit
 */
async function handleRemitFailed(event: WebhookEvent) {
  console.log(`[Webhook] Remit failed: ${event.remitId} - $${event.amount}`);

  // In production:
  // 1. Update remit status
  // 2. Refund to user balance
  // 3. Notify user with reason
}

/**
 * Webhook Signature Verification Helper
 * Verifies Paylabs webhook signatures using RSA public key
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  publicKey: string
): boolean {
  return verifyPaylabsWebhook({
    payload,
    signature,
    publicKey,
  });
}
