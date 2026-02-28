/**
 * Paylabs Webhook Handler
 * Processes real-time transaction webhooks from Paylabs
 */

import { NextRequest, NextResponse } from "next/server";
import { categorizeTransaction } from "@/actions/insights";
import { PaylabsWebhookPayload } from "@/types/dashboard";

// In-memory store for demo (replace with database/Redis in production)
const processedWebhooks = new Set<string>();
const pendingNotifications: Array<{
  id: string;
  merchant: string;
  amount: number;
}> = [];

/**
 * POST /api/webhooks/paylabs
 * Handles incoming Paylabs webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = body as PaylabsWebhookPayload;

    // Validate payload
    if (!payload.event || !payload.transaction) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Prevent duplicate processing
    const webhookId = payload.transaction.id;
    if (processedWebhooks.has(webhookId)) {
      console.log(`Webhook ${webhookId} already processed`);
      return NextResponse.json({ success: true, duplicate: true });
    }

    processedWebhooks.add(webhookId);

    // Process based on event type
    switch (payload.event) {
      case "transaction.success":
        await handleSuccessfulTransaction(payload);
        break;
      case "transaction.failed":
        await handleFailedTransaction(payload);
        break;
      case "transaction.pending":
        await handlePendingTransaction(payload);
        break;
      default:
        console.log(`Unhandled event type: ${payload.event}`);
    }

    return NextResponse.json({
      success: true,
      processed: true,
      eventId: webhookId,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful transaction
 * Auto-categorizes and triggers notification
 */
async function handleSuccessfulTransaction(payload: PaylabsWebhookPayload) {
  const { transaction } = payload;

  console.log(`Processing successful transaction: ${transaction.merchant} - $${transaction.amount}`);

  // Auto-categorize transaction using AI
  const categorization = await categorizeTransaction(
    transaction.merchant,
    transaction.amount
  );

  console.log(
    `Auto-categorized ${transaction.merchant} as ${categorization.category} (confidence: ${categorization.confidence})`
  );

  // Add to pending notifications for display
  pendingNotifications.push({
    id: transaction.id,
    merchant: transaction.merchant,
    amount: transaction.amount,
  });

  // In a real app, you would:
  // 1. Save transaction to database
  // 2. Update budget calculations
  // 3. Trigger real-time updates via WebSocket/SSE
  // 4. Send push notification

  // Keep only last 10 notifications
  if (pendingNotifications.length > 10) {
    pendingNotifications.shift();
  }

  return {
    success: true,
    category: categorization.category,
    confidence: categorization.confidence,
  };
}

/**
 * Handle failed transaction
 */
async function handleFailedTransaction(payload: PaylabsWebhookPayload) {
  const { transaction } = payload;

  console.log(`Transaction failed: ${transaction.merchant} - $${transaction.amount}`);

  // In a real app, notify user of failed transaction
  // and suggest alternative payment methods

  return { success: true, status: "failed" };
}

/**
 * Handle pending transaction
 */
async function handlePendingTransaction(payload: PaylabsWebhookPayload) {
  const { transaction } = payload;

  console.log(`Transaction pending: ${transaction.merchant} - $${transaction.amount}`);

  // In a real app, show pending state in UI
  // and update when confirmed

  return { success: true, status: "pending" };
}

/**
 * GET /api/webhooks/paylabs/notifications
 * Retrieve pending notifications (for polling)
 */
export async function GET() {
  const notifications = [...pendingNotifications];
  pendingNotifications.length = 0; // Clear after retrieval

  return NextResponse.json({
    success: true,
    notifications,
    count: notifications.length,
  });
}

/**
 * Webhook Signature Verification
 * In production, verify Paylabs webhook signatures
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function verifyWebhookSignature(request: NextRequest): boolean {
  const signature = request.headers.get("x-paylabs-signature");
  const timestamp = request.headers.get("x-paylabs-timestamp");

  if (!signature || !timestamp) {
    return false;
  }

  // Implement signature verification logic here
  // Compare with expected signature using your webhook secret

  return true; // Placeholder - implement in production
}
