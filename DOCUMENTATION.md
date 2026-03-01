# Duitly - Complete Technical Documentation

**Version:** 3.1.0 (Supabase Integration)  
**Last Updated:** March 1, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Architecture Overview](#architecture-overview)
4. [Tech Stack](#tech-stack)
5. [Features](#features)
6. [Installation & Setup](#installation--setup)
7. [Database (Supabase)](#database-supabase)
8. [Paylabs Integration](#paylabs-integration)
9. [AI Integration (Qwen)](#ai-integration-qwen)
10. [Smart Budgeting Module](#smart-budgeting-module)
11. [Transaction Entry Module](#transaction-entry-module)
12. [Security](#security)
13. [API Reference](#api-reference)
14. [Design System](#design-system)
15. [Testing](#testing)
16. [Deployment](#deployment)
17. [Troubleshooting](#troubleshooting)

---

## Introduction

**Duitly** is an AI-powered smart budgeting application that combines:
- **Supabase** for unified database management
- **Paylabs Payment Gateway** (v2.1 Payin, v1.2 Remit) for secure transactions
- **Alibaba Cloud Qwen AI** for intelligent categorization and insights
- **Modern React/Next.js** for a responsive, beautiful dark-mode UI

### Key Capabilities

| Capability | Description |
|------------|-------------|
| 💰 Income Management | Track multiple income sources with frequency conversion |
| 📊 Smart Budgeting | AI-powered budget generation using 50/30/20 rule |
| 💳 Transaction Entry | Manual, Photo OCR, or File upload methods |
| 🤖 AI Categorization | Auto-categorize transactions using Qwen AI |
| 🏦 Paylabs Integration | Real payment processing with RSA security |
| 📱 Real-time Updates | Webhook-based transaction confirmations |
| 🎨 Dark Mode UI | Beautiful Xtreme Black theme |

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/duitly.git
cd duitly

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your API keys (see Setup section)

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Duitly Application                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Frontend  │  │   Backend   │  │      External APIs      │  │
│  │             │  │             │  │                         │  │
│  │  - Pages    │  │  - Actions  │  │  - Supabase Database    │  │
│  │  - Components│ │  - Services │  │  - Paylabs Gateway      │  │
│  │  - Hooks    │  │  - Utils    │  │  - Qwen AI              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Supabase     │  │  Paylabs Payin  │  │  Qwen AI (OCR,  │
│    (PostgreSQL) │  │  & Remit APIs   │  │  Chat, Insights)│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Data Flow

```
User Input → Server Action → Supabase DB → Paylabs API → Webhook → UI Update
                ↓
            Qwen AI (Categorization/OCR)
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **Language** | TypeScript | 5.x |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Styling** | Tailwind CSS | 4.x |
| **Animations** | Framer Motion | 12.x |
| **Icons** | Lucide React | 0.575.0 |
| **Payments** | Paylabs API | v2.1/v1.2 |
| **AI** | Alibaba Cloud Qwen | qwen-max, qwen-vl-max |

---

## Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| Smart Budgeting | AI-powered budget generation | ✅ Complete |
| Income Management | Multi-source income tracking | ✅ Complete |
| Transaction Entry | Manual, Photo, Upload methods | ✅ Complete |
| Receipt OCR | AI extraction from images | ✅ Complete |
| Auto-Categorization | Smart merchant categorization | ✅ Complete |
| Supabase Database | PostgreSQL with RLS | ✅ Complete |
| Paylabs Integration | Secure payment processing | ✅ Complete |
| Webhook Handling | Real-time updates | ✅ Complete |
| Dark Mode UI | Xtreme Black theme | ✅ Complete |

### Coming Soon

- [ ] User Authentication (NextAuth.js + Supabase Auth)
- [ ] Real-time subscriptions
- [ ] Multi-currency Support
- [ ] Bill Reminders
- [ ] Investment Tracking
- [ ] Export to CSV/PDF
- [ ] Mobile App (React Native)

---

## Installation & Setup

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account (free tier works)
- Paylabs merchant account (sandbox for dev)
- Alibaba Cloud account (for Qwen AI)

### Environment Variables

Create `.env.local` with:

```bash
# ============================================
# SUPABASE DATABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_ENABLE_DATABASE=true

# ============================================
# ALIBABA CLOUD QWEN AI
# ============================================
ALIBABA_CLOUD_API_KEY=sk-your_api_key_here
ALIBABA_CLOUD_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_API_KEY=sk-your_api_key_here
QWEN_API_ENDPOINT=https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation

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

# ============================================
# PAYLABS WEBHOOK
# ============================================
PAYLABS_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYLABS_WEBHOOK_URL=http://localhost:3000/api/webhooks/paylabs
PAYLABS_ENVIRONMENT=sandbox

# ============================================
# APPLICATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_AI_INSIGHTS=true
NEXT_PUBLIC_ENABLE_PAYLABS=true
```

### Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in details and create

2. **Run Schema Migration**
   - In Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/schema.sql`
   - Click "Run"

3. **(Optional) Load Seed Data**
   - Edit `supabase/seed.sql`
   - Replace `'YOUR-USER-ID-HERE'` with your user ID
   - Run in SQL Editor

### Getting API Keys

#### Supabase
1. Settings → API
2. Copy Project URL and Keys

#### Paylabs
1. Register at [Paylabs Merchant Portal](https://merchant.paylabs.co.id)
2. Settings → API Keys
3. Generate RSA Key Pair
4. Copy Merchant ID, Private Key, Public Key

#### Alibaba Cloud Qwen
1. Create account at [Alibaba Cloud](https://www.aliyun.com)
2. Navigate to Model Studio
3. Create API Key

---

## Database (Supabase)

### Schema Overview

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profiles | ✅ |
| `income_sources` | Income tracking | ✅ |
| `category_allocations` | Budget categories | ✅ |
| `financial_goals` | Savings goals | ✅ |
| `transactions` | All transactions | ✅ |
| `budget_insights` | AI insights | ✅ |
| `notifications` | User notifications | ✅ |
| `paylabs_webhooks` | Webhook audit | ✅ |
| `ocr_receipts` | Receipt OCR | ✅ |

### Database Functions

**`get_monthly_income(user_id UUID)`**
```sql
SELECT public.get_monthly_income('user-uuid');
-- Returns: DECIMAL(12, 2) - Total monthly income
```

**`get_allocation_status(user_id UUID)`**
```sql
SELECT public.get_allocation_status('user-uuid');
-- Returns: JSONB with totalIncome, totalAllocated, remainingToAllocate, etc.
```

### CRUD Operations

```typescript
import { 
  getIncomeSources, 
  createTransaction,
  getCategoryAllocations 
} from "@/lib/database";

// Get user's income sources
const income = await getIncomeSources(userId);

// Create transaction
const result = await createTransaction({
  user_id: userId,
  type: "expense",
  category: "food",
  amount: 50000,
  date: "2026-03-01",
  // ... other fields
});
```

### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only access their own data
- Service role bypasses RLS for server operations
- Authenticated users can insert their own data

**Documentation:** See `SUPABASE_INTEGRATION.md` for complete guide

---

## Paylabs Integration

### Overview

Duitly integrates with Paylabs for:
- **Payin (v2.1)** - Collect payments/transactions
- **Remit (v1.2)** - Send payouts/transfers

### Payin Flow

```
User creates transaction
       ↓
App generates transaction ID
       ↓
RSA sign request with private key
       ↓
POST to Paylabs Payin API
       ↓
Receive payment URL/confirmation
       ↓
Save to Supabase database
       ↓
Paylabs sends webhook
       ↓
Verify signature & update status
```

### Code Example

```typescript
import { processPayinTransaction } from "@/lib/paylabs-services";

const result = await processPayinTransaction({
  type: "expense",
  category: "food",
  amount: "50000",
  date: "2026-03-01",
  merchant: "Starbucks",
  note: "Morning coffee",
});

console.log(result.transactionId);
console.log(result.paylabsTransactionId);
```

### Webhook Handling

Webhooks handled at `/api/webhooks/paylabs`:
- Automatic signature verification
- AI categorization on `transaction.success`
- Budget updates
- Notification triggers

**Documentation:** See `PAYLABS_INTEGRATION.md` for complete guide

---

## AI Integration (Qwen)

### Models Used

| Model | Purpose |
|-------|---------|
| `qwen-max` | Text chat, categorization, insights, budget optimization |
| `qwen-vl-max` | Vision/language (OCR for receipts) |

### Receipt OCR

```typescript
import { extractReceiptOCR } from "@/lib/qwen-client";

const result = await extractReceiptOCR(base64Image, true);
// {
//   merchant: "Starbucks",
//   date: "2026-03-01",
//   amount: 45000,
//   confidence: 0.95
// }
```

### Smart Categorization

```typescript
import { smartCategorize } from "@/lib/qwen-client";

const result = await smartCategorize("Starbucks", 45000, "expense");
// { 
//   category: "food", 
//   confidence: 0.92, 
//   reasoning: "Coffee shop transaction" 
// }
```

### Budget Optimization

```typescript
import { optimizeBudget } from "@/lib/qwen-client";

const result = await optimizeBudget(
  10000000, // Monthly income
  [
    { name: "Emergency Fund", targetAmount: 50000000, priority: "high" }
  ]
);
// Returns optimal allocation using 50/30/20 rule
```

---

## Smart Budgeting Module

### Components

| Component | File | Purpose |
|-----------|------|---------|
| BudgetingSummaryCard | `BudgetingSummaryCard.tsx` | Shows remaining allocation |
| IncomeManagementModule | `IncomeManagementModule.tsx` | Add/edit income sources |
| CategoryAllocationList | `CategoryAllocationList.tsx` | Budget category tracking |
| AccountDistributionView | `AccountDistributionView.tsx` | Top allocations display |
| AIBudgetGenerator | `AIBudgetGenerator.tsx` | AI budget generation |
| AIAllocationInsight | `AIAllocationInsight.tsx` | Dynamic AI feedback |

### Usage

1. Navigate to **Budgeting** tab
2. Add income sources in **Income** tab
3. Click **AI Generate** to create budget
4. Review and adjust allocations
5. Monitor status in **Overview**

---

## Transaction Entry Module

### Components

| Component | File | Purpose |
|-----------|------|---------|
| TransactionTypeSelector | `TransactionTypeSelector.tsx` | Income vs Expense |
| CategoryAccountSelector | `CategoryAccountSelector.tsx` | Category selection |
| InputMethodSelector | `InputMethodSelector.tsx` | Manual/Photo/Upload |
| ManualEntryForm | `ManualEntryForm.tsx` | Manual data entry |
| OCRReceiptUpload | `OCRReceiptUpload.tsx` | Photo/upload with OCR |
| TransactionSuccessModal | `TransactionSuccessModal.tsx` | Success confirmation |
| AddTransactionModal | `AddTransactionModal.tsx` | Main modal container |

### Usage

1. Click floating **+** button (Primary Lime, bottom-right)
2. Select transaction type (Income/Expense)
3. Choose category
4. Select input method:
   - **Manual**: Enter details by hand
   - **Photo**: Take receipt photo (AI extracts)
   - **Upload**: Upload receipt image (AI extracts)
5. Review and confirm
6. Success notification appears (354x120px Soda Green card)

---

## Security

### RSA Signing (Paylabs)

All Paylabs requests signed using RSA-SHA256:

```typescript
import { signPaylabsPayinRequest } from "@/lib/security";

const { signature, timestamp, nonce } = signPaylabsPayinRequest({
  merchantId: "010001",
  transactionId: "txn_123",
  amount: 100000,
  privateKey: process.env.PAYLABS_PRIVATE_KEY,
});
```

### Signature Format

```
signatureString = merchantId|transactionId|amount|timestamp|nonce
signature = RSA-SHA256(signatureString, privateKey)
```

### Webhook Verification

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

### Security Best Practices

- ✅ Never expose private keys to client-side
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Rotate API keys regularly
- ✅ Implement rate limiting
- ✅ Log all transactions
- ✅ Row Level Security on all tables

---

## API Reference

### Server Actions

| Action | Module | Description |
|--------|--------|-------------|
| `processPayinTransaction(data)` | `paylabs-services` | Create Payin transaction |
| `processRemitTransaction(request)` | `paylabs-services` | Create Remit payout |
| `getTransactionStatus(id)` | `paylabs-services` | Get transaction status |
| `createTransaction(data)` | `transactions` | Create + save transaction |
| `smartCategorize(merchant, amount, type)` | `qwen-client` | AI categorization |
| `extractReceiptOCR(image, isBase64)` | `qwen-client` | Receipt OCR |
| `optimizeBudget(income, goals)` | `qwen-client` | Budget optimization |
| `generateInsight(userData)` | `qwen-client` | Financial insight |
| `getIncomeSources(userId)` | `database` | Get user's income |
| `getCategoryAllocations(userId)` | `database` | Get budget categories |
| `getTransactions(userId, limit)` | `database` | Get transactions |

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/paylabs` | POST | Paylabs webhook handler |
| `/api/webhooks/paylabs` | GET | Get pending notifications |
| `/api/webhooks/paylabs` | DELETE | Clear notifications |
| `/api/insights/stream` | GET | SSE for AI insights |

---

## Design System

### Colors

| Token | Value | Name | Usage |
|-------|-------|------|-------|
| `--background` | `#0F0F0F` | Xtreme Black | Main background |
| `--surface` | `#1A1A1A` | Fake Black | Cards, surfaces |
| `--surface-hover` | `#252525` | - | Hover states |
| `--primary` | `#A3FF47` | Primary Lime | Actions, buttons |
| `--primary-hover` | `#8CE63E` | - | Action hover |
| `--secondary` | `#C3B3EF` | Creamy Taro | AI elements |
| `--success` | `#00D084` | Soda Green | Success, income |
| `--success-dim` | `#00D08420` | - | Success backgrounds |
| `--danger` | `#FF5F5F` | Fresh Red Soda | Errors, over-budget |
| `--danger-dim` | `#FF5F5F20` | - | Danger backgrounds |
| `--warning` | `#FFB800` | - | Warnings |
| `--border` | `#2A2A2A` | - | Borders |
| `--muted` | `#6B6B6B` | - | Muted text |

### Typography

```css
/* Headers: Plus Jakarta Sans */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-jakarta);
}

/* Body: Inter */
body {
  font-family: var(--font-inter);
}

/* Numeric data: Inter */
.amount, .percentage {
  font-family: var(--font-inter);
}
```

### Geometry

| Element | Radius |
|---------|--------|
| Inputs/Textboxes | 16px (`--radius-md`) |
| Cards | 24px-32px (`--radius-lg` to `--radius-xl`) |
| Buttons | 16px-24px |
| Modal | 32px (top corners on mobile) |

### Success Notification Card

Fixed dimensions: **354x120px**
- Background: Surface with success border
- Icon: CheckCircle in Soda Green
- Progress bar: 1px height, full width

---

## Testing

### Unit Testing

```bash
npm run test
```

### E2E Testing

```bash
npm run test:e2e
```

### Webhook Testing

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/paylabs \
  -H "Content-Type: application/json" \
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

### Database Testing

```typescript
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase
  .from("transactions")
  .select("*")
  .limit(5);

console.log("Database connected:", !!data);
```

### Mock Mode

When API keys are not configured, the app runs in mock mode:
- Paylabs returns simulated responses
- AI uses fallback categorization
- Database uses in-memory storage
- All features remain functional

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
vercel env pull
```

### Environment Variables (Production)

Update these for production:
```bash
NEXT_PUBLIC_APP_URL=https://duitly.app
PAYLABS_ENVIRONMENT=production
PAYLABS_WEBHOOK_URL=https://duitly.app/api/webhooks/paylabs
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
```

### Build & Run

```bash
# Build
npm run build

# Start production
npm start
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Troubleshooting

### Common Issues

#### "Invalid API key" (Supabase)
**Solution:** Check you're using correct key:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side
- `SUPABASE_SERVICE_ROLE_KEY` for server-side only

#### "relation does not exist"
**Solution:** Run `supabase/schema.sql` in Supabase SQL Editor

#### "QWEN_API_KEY not configured"
**Solution:** Add `ALIBABA_CLOUD_API_KEY` to `.env.local`

#### "Invalid signature" from Paylabs
**Solution:** Verify private key format in `.env.local`

#### Webhook not received
**Solution:** Check webhook URL in Paylabs dashboard

#### Build fails with TypeScript errors
**Solution:** Run `npm run lint` to identify issues

### Logs

```bash
# View Next.js logs
npm run dev 2>&1 | tee dev.log

# View production logs
pm2 logs duitly
```

---

## File Structure

```
src/
├── actions/
│   ├── budgeting.ts         # AI budget generation
│   ├── insights.ts          # AI insights
│   ├── ocr.ts               # Receipt OCR
│   └── transactions.ts      # Transaction creation
├── app/
│   ├── api/
│   │   ├── insights/stream/ # SSE endpoint
│   │   └── webhooks/paylabs/# Webhook handler
│   ├── globals.css          # Design tokens
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Entry point
├── components/
│   └── dashboard/
│       ├── views/
│       │   ├── SmartBudgetingView.tsx
│       │   └── ...
│       ├── BudgetingSummaryCard.tsx
│       ├── IncomeManagementModule.tsx
│       ├── CategoryAllocationList.tsx
│       ├── AddTransactionModal.tsx
│       └── ...
├── lib/
│   ├── database.ts          # Supabase CRUD
│   ├── database.types.ts    # TypeScript types
│   ├── paylabs-client.ts    # Paylabs API client
│   ├── paylabs-services.ts  # Paylabs services
│   ├── qwen-client.ts       # Qwen AI client
│   ├── security.ts          # RSA signing
│   ├── supabase.ts          # Supabase client
│   └── dashboard-store.tsx  # React state
├── types/
│   └── dashboard.ts         # Type definitions
└── ...

supabase/
├── schema.sql               # Database schema
└── seed.sql                 # Sample data
```

---

## Support

**Documentation Files:**
- `DOCUMENTATION.md` - This file (complete guide)
- `QUICKSTART.md` - Quick start guide (see below)
- `SUPABASE_INTEGRATION.md` - Database setup
- `PAYLABS_INTEGRATION.md` - Payment integration
- `CHANGELOG_DOCUMENTATION.md` - Implementation history

**GitHub:** https://github.com/your-org/duitly  
**Email:** support@duitly.app  

---

## Changelog

### v3.1.0 (March 1, 2026) - Supabase Integration
- ✅ Supabase database integration
- ✅ 9 tables with RLS policies
- ✅ Database functions for income/allocation
- ✅ Seed data for development
- ✅ All actions now persist to database

### v3.0.0 (March 1, 2026) - Paylabs Integration
- ✅ Paylabs Payin v2.1 integration
- ✅ Paylabs Remit v1.2 integration
- ✅ RSA signature verification
- ✅ Webhook handler with validation
- ✅ Qwen AI compatible-mode API

### v2.1.0 (March 1, 2026) - Transaction Entry
- ✅ Transaction entry module
- ✅ Receipt OCR with Qwen Vision
- ✅ Auto-categorization
- ✅ Multi-step modal flow

### v2.0.0 (March 1, 2026) - Smart Budgeting
- ✅ Smart budgeting module
- ✅ AI budget generation
- ✅ Income management
- ✅ Allocation tracking

---

**Built with ❤️ by the Duitly Team**

**License:** MIT
