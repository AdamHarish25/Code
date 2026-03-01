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

    // Verify webhook signature
    const publicKey = process.env.PAYLABS_PUBLIC_KEY;
    if (publicKey) {
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
 * Triggers AI categorization and budget updates
 */
async function handleTransactionSuccess(event: WebhookEvent) {
  console.log(`[Webhook] Transaction success: ${event.transactionId} - $${event.amount}`);

  // Extract merchant from metadata if available
  const merchant = event.data?.merchant as string | undefined;
  const category = event.data?.category as string | undefined;

  // AI categorization if merchant provided and no category
  if (merchant && !category) {
    try {
      const aiCategory = await smartCategorize(merchant, event.amount, "expense");
      console.log(`[Webhook] AI categorized ${merchant} as ${aiCategory.category}`);
      
      // In production, update database with AI category
      event.data = {
        ...event.data,
        aiCategory: aiCategory.category,
        aiConfidence: aiCategory.confidence,
      };
    } catch (error) {
      console.error("[Webhook] AI categorization failed:", error);
    }
  }

  // In production:
  // 1. Update transaction status in database
  // 2. Update budget calculations
  // 3. Trigger real-time notifications via WebSocket
  // 4. Send push notification to user
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
