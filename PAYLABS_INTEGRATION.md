# Duitly Paylabs & AI Integration Guide

**Version:** 3.0.0 (Paylabs Integration Complete)  
**Last Updated:** March 1, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Configuration](#environment-configuration)
3. [Paylabs API Integration](#paylabs-api-integration)
4. [Alibaba Cloud Qwen AI](#alibaba-cloud-qwen-ai)
5. [Security Implementation](#security-implementation)
6. [Webhook Handling](#webhook-handling)
7. [API Reference](#api-reference)
8. [Testing Guide](#testing-guide)

---

## Overview

This document describes the complete integration of Duitly with:
- **Paylabs Payment Gateway** (Payin v2.1, Remit v1.2)
- **Alibaba Cloud Qwen AI** (qwen-max, qwen-vl-max)

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Paylabs Client  │────▶│ Paylabs Gateway │
│   (Frontend)    │     │  (RSA Signing)   │     │   (v2.1/v1.2)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Qwen Client   │────▶│  AI Services     │◀────│   Webhooks      │
│  (OCR/Chat)     │     │  (Categorization)│     │  (Signature)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## Environment Configuration

### Required Variables (`.env.local`)

```bash
# ============================================
# ALIBABA CLOUD QWEN AI
# ============================================
ALIBABA_CLOUD_API_KEY=sk-your_api_key_here
ALIBABA_CLOUD_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1

# ============================================
# PAYLABS PAYIN (v2.1)
# ============================================
PAYLABS_MERCHANT_ID=010001
PAYLABS_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
PAYLABS_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQE...
PAYLABS_PAYIN_URL=https://sit-pay.paylabs.co.id
PAYLABS_VERSION=v2.1

# ============================================
# PAYLABS REMIT (v1.2)
# ============================================
PAYLABS_REMIT_URL=https://sit-remit-api.paylabs.co.id
PAYLABS_REMIT_VERSION=v1.2
PAYLABS_REMIT_MERCHANT_ID=010001

# ============================================
# PAYLABS WEBHOOK
# ============================================
PAYLABS_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYLABS_WEBHOOK_URL=https://your-domain.com/api/webhooks/paylabs
PAYLABS_ENVIRONMENT=sandbox
```

### Getting Paylabs Credentials

1. **Register** at [Paylabs Merchant Portal](https://merchant.paylabs.co.id)
2. **Navigate** to Settings → API Keys
3. **Generate** RSA Key Pair (or upload your own)
4. **Copy** Merchant ID, Private Key, and Public Key
5. **Configure** webhook URL in Paylabs dashboard

---

## Paylabs API Integration

### Payin API v2.1 (Payment Collection)

**Base URL:** `https://sit-pay.paylabs.co.id/api/v2.1`

#### Create Transaction

```typescript
import { getPaylabsClient } from "@/lib/paylabs-client";

const client = getPaylabsClient();

const response = await client.createPayinTransaction({
  transactionId: "duitly_123456",
  amount: 100000,
  currency: "IDR",
  merchantId: "010001",
  customerEmail: "customer@example.com",
  customerName: "John Doe",
  description: "Payment for order #123",
  callbackUrl: "https://your-domain.com/api/webhooks/paylabs",
});
```

**Request Headers:**
```
X-Paylabs-Merchant-ID: 010001
X-Paylabs-Timestamp: 2026-03-01T12:00:00.000Z
X-Paylabs-Nonce: a1b2c3d4e5f6
X-Paylabs-Signature: [RSA-SHA256 signature]
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "transactionId": "duitly_123456",
    "paylabsTransactionId": "pl_1709294400_abc123",
    "status": "pending",
    "paymentUrl": "https://sit-pay.paylabs.co.id/pay/duitly_123456",
    "amount": 100000,
    "currency": "IDR",
    "createdAt": "2026-03-01T12:00:00.000Z",
    "expiresAt": "2026-03-01T13:00:00.000Z"
  }
}
```

### Remit API v1.2 (Payout/Transfer)

**Base URL:** `https://sit-remit-api.paylabs.co.id/api/v1.2`

#### Create Remit

```typescript
const response = await client.createRemit({
  beneficiaryId: "benef_123",
  amount: 500000,
  currency: "IDR",
  bankCode: "BCA",
  accountNumber: "1234567890",
  accountName: "Jane Doe",
  description: "Salary payment",
  referenceId: "salary_march_2026",
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "remitId": "salary_march_2026",
    "paylabsRemitId": "rl_1709294400_xyz789",
    "status": "pending",
    "amount": 500000,
    "fee": 2500,
    "totalAmount": 502500,
    "beneficiaryName": "Jane Doe",
    "bankName": "BCA",
    "createdAt": "2026-03-01T12:00:00.000Z"
  }
}
```

---

## Alibaba Cloud Qwen AI

### Configuration

**Base URL:** `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`

**Models:**
- `qwen-max` - Text chat, categorization, insights
- `qwen-vl-max` - Vision/language (OCR for receipts)

### Smart Categorization

```typescript
import { smartCategorize } from "@/lib/qwen-client";

const result = await smartCategorize("Starbucks", 45000, "expense");
// { category: "food", confidence: 0.92, reasoning: "Coffee shop transaction" }
```

### Receipt OCR

```typescript
import { extractReceiptOCR } from "@/lib/qwen-client";

const result = await extractReceiptOCR(base64ImageData, true);
// {
//   merchant: "Starbucks Indonesia",
//   date: "2026-03-01",
//   amount: 45000,
//   confidence: 0.95
// }
```

### Budget Optimization

```typescript
import { optimizeBudget } from "@/lib/qwen-client";

const result = await optimizeBudget(
  10000000, // Total income
  [
    { name: "Emergency Fund", targetAmount: 50000000, priority: "high" },
    { name: "Vacation", targetAmount: 10000000, priority: "medium" }
  ]
);
// Returns optimal allocation based on 50/30/20 rule
```

---

## Security Implementation

### RSA Signature Generation

```typescript
import { signPaylabsPayinRequest } from "@/lib/security";

const { signature, timestamp, nonce } = signPaylabsPayinRequest({
  merchantId: "010001",
  transactionId: "txn_123",
  amount: 100000,
  privateKey: process.env.PAYLABS_PRIVATE_KEY,
});
```

### Signature Format (Payin v2.1)

```
signatureString = merchantId|transactionId|amount|timestamp|nonce
signature = RSA-SHA256(signatureString, privateKey)
```

### Webhook Signature Verification

```typescript
import { verifyPaylabsWebhook } from "@/lib/security";

const isValid = verifyPaylabsWebhook({
  payload: JSON.stringify(body),
  signature: request.headers.get("x-paylabs-signature"),
  publicKey: process.env.PAYLABS_PUBLIC_KEY,
});

if (!isValid) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
}
```

---

## Webhook Handling

### Endpoint: `POST /api/webhooks/paylabs`

### Event Types

| Event | Description |
|-------|-------------|
| `transaction.success` | Payment completed successfully |
| `transaction.failed` | Payment failed |
| `transaction.pending` | Payment awaiting confirmation |
| `transaction.expired` | Payment link expired |
| `remit.success` | Payout completed |
| `remit.failed` | Payout failed |

### Webhook Payload

```json
{
  "eventId": "evt_1709294400_abc",
  "eventType": "transaction.success",
  "merchantId": "010001",
  "transactionId": "duitly_123456",
  "amount": 100000,
  "currency": "IDR",
  "status": "success",
  "timestamp": "2026-03-01T12:05:00.000Z",
  "signature": "RSA-SHA256-signature-here",
  "data": {
    "merchant": "Starbucks",
    "category": "food",
    "aiCategory": "food"
  }
}
```

### Handler Implementation

```typescript
// src/app/api/webhooks/paylabs/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const signature = request.headers.get("x-paylabs-signature");
  
  // Verify signature
  const isValid = verifyPaylabsWebhook({
    payload: JSON.stringify(body),
    signature,
    publicKey: process.env.PAYLABS_PUBLIC_KEY,
  });
  
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  
  // Process event
  await handleTransactionSuccess(body);
  
  return NextResponse.json({ success: true });
}
```

---

## API Reference

### Server Actions

| Action | Module | Description |
|--------|--------|-------------|
| `processPayinTransaction(data)` | `paylabs-services` | Create Payin with AI categorization |
| `processRemitTransaction(request)` | `paylabs-services` | Create Remit/Payout |
| `getTransactionStatus(id)` | `paylabs-services` | Get transaction status |
| `smartCategorize(merchant, amount, type)` | `qwen-client` | AI categorization |
| `extractReceiptOCR(image, isBase64)` | `qwen-client` | Receipt OCR |
| `optimizeBudget(income, goals)` | `qwen-client` | Budget optimization |

### Client Methods

| Method | Class | Description |
|--------|-------|-------------|
| `createPayinTransaction(request)` | `PaylabsClient` | Create payment |
| `getTransactionStatus(id)` | `PaylabsClient` | Check status |
| `createRemit(request)` | `PaylabsClient` | Create payout |
| `verifyWebhookSignature(payload)` | `PaylabsClient` | Verify webhook |

---

## Testing Guide

### Local Testing with Mock Mode

When API keys are not configured, the system runs in mock mode:

```typescript
// Transactions will use mock responses
const result = await processPayinTransaction({
  type: "expense",
  category: "food",
  amount: "50000",
  date: "2026-03-01",
  merchant: "Test Store",
});
// Returns mock transaction ID and payment URL
```

### Webhook Testing

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/paylabs \
  -H "Content-Type: application/json" \
  -H "X-Paylabs-Merchant-ID: 010001" \
  -H "X-Paylabs-Signature: test_signature" \
  -d '{
    "eventId": "test_001",
    "eventType": "transaction.success",
    "merchantId": "010001",
    "transactionId": "duitly_test",
    "amount": 50000,
    "currency": "IDR",
    "status": "success",
    "timestamp": "2026-03-01T12:00:00.000Z"
  }'
```

### AI Testing

```bash
# Test categorization (requires API key)
curl -X POST http://localhost:3000/api/test/categorize \
  -H "Content-Type: application/json" \
  -d '{"merchant": "Starbucks", "amount": 45000}'
```

---

## Error Handling

### Paylabs Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `INVALID_SIGNATURE` | RSA signature verification failed | Check private key |
| `INVALID_MERCHANT` | Merchant ID not found | Verify merchant ID |
| `DUPLICATE_TRANSACTION` | Transaction ID already exists | Use unique ID |
| `INSUFFICIENT_BALANCE` | Account balance too low | Add funds |
| `EXPIRED_REQUEST` | Timestamp too old | Check system time |

### AI Error Handling

All AI functions have fallback mechanisms:
- **OCR fails** → Return default values with 0 confidence
- **Categorization fails** → Use keyword-based fallback
- **Budget optimization fails** → Apply 50/30/20 rule

---

## Production Checklist

- [ ] Configure production API keys
- [ ] Set up webhook URL in Paylabs dashboard
- [ ] Enable HTTPS for webhook endpoint
- [ ] Configure rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Enable transaction logging
- [ ] Configure backup payment method
- [ ] Test webhook signature verification
- [ ] Set up alerting for failed transactions

---

## Support

**Paylabs Documentation:** https://docs.paylabs.co.id  
**Alibaba Cloud Qwen:** https://help.aliyun.com/product/42154.html  
**Duitly Support:** support@duitly.app

---

**Build Status:** ✅ Passing  
**Last Verified:** March 1, 2026
