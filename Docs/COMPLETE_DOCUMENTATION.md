# Duitly - Complete Documentation

**Version:** 4.0.0 (Production Ready)  
**Last Updated:** March 1, 2026  
**Stack:** Next.js 16, Supabase, TypeScript, Tailwind CSS

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Authentication](#authentication)
5. [Dashboard Features](#dashboard-features)
6. [Paylabs Integration](#paylabs-integration)
7. [AI Integration](#ai-integration)
8. [File Structure](#file-structure)
9. [Environment Setup](#environment-setup)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 20.x or higher
- Supabase account (free tier works)
- Paylabs merchant account (sandbox for dev)
- Alibaba Cloud Qwen API key (optional)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd duitly

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your credentials
# See Environment Setup section

# Run development server
npm run dev

# Open http://localhost:3000
```

### Database Setup

1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/schema.sql` (creates all tables)
3. (Optional) Run `supabase/seed.sql` with your user ID

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│  Dashboard Views  │  Auth Pages  │  Onboarding Flow    │
│  - Home           │  - Sign In   │  - 5 Steps          │
│  - Budget         │  - Sign Up   │  - Data Collection  │
│  - Analytics      │  - Verify    │                     │
│  - Transactions   │              │                     │
│  - Goals          │              │                     │
│  - Insights       │              │                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Backend Services (Server Actions)           │
├─────────────────────────────────────────────────────────┤
│  Transactions  │  Budgeting  │  Analytics  │  OCR      │
│  - Create      │  - Allocate │  - Summary  │  - Parse  │
│  - Update      │  - Status   │  - Trends   │  - Extract│
│  - Delete      │  - Insight  │  - Breakdown│           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   External Services                      │
├─────────────────────────────────────────────────────────┤
│  Supabase (Database)  │  Paylabs (Payments)            │
│  - PostgreSQL         │  - Payin (v2.1)                │
│  - Auth               │  - Remit (v1.2)                │
│  - RLS Policies       │  - Webhooks                    │
│                       │                                 │
│  Qwen AI (Insights)   │                                 │
│  - Categorization     │                                 │
│  - Recommendations    │                                 │
│  - OCR Processing     │                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User profiles | `id`, `email`, `investment_path`, `currency` |
| `income_sources` | Recurring income | `name`, `amount`, `frequency`, `type` |
| `category_allocations` | Budget categories | `category`, `allocated_amount`, `spent_amount` |
| `financial_goals` | Savings goals | `target_amount`, `current_amount`, `target_date` |
| `transactions` | All transactions | `type`, `category`, `amount`, `merchant`, `status` |
| `budget_insights` | AI insights | `title`, `content`, `type`, `is_read` |
| `notifications` | User notifications | `type`, `title`, `message`, `is_read` |

### Database Functions

```sql
-- Calculate monthly income from all sources
get_monthly_income(user_id UUID) RETURNS DECIMAL

-- Get budget allocation status
get_allocation_status(user_id UUID) RETURNS JSONB {
  totalIncome, totalAllocated, remainingToAllocate,
  allocationPercentage, status, message
}

-- Analytics: Get expenses summary
get_expenses_summary(user_id, start_date, end_date) RETURNS JSONB

-- Analytics: Get category breakdown
get_category_breakdown(user_id, start_date, end_date) RETURNS JSONB
```

### Row-Level Security (RLS)

All tables have RLS enabled. Users can only access their own data:

```sql
-- Example policy
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Authentication

### Flow

```
Welcome Page → Sign Up/Sign In → Email Verification → Onboarding → Dashboard
```

### Centralized Auth (`src/lib/auth-config.ts`)

```typescript
// Client-side auth
const user = await getCurrentUserClient();
const userId = await getCurrentUserIdClient();
const { data: { session } } = await getSession();

// Listen to auth changes
onAuthStateChange((user) => {
  console.log("User:", user?.email);
});
```

### Usage in Components

```typescript
// Dashboard page
const { data: { session } } = await getSession();
if (!session) router.push("/auth/signin");

// Transaction creation
const userId = await getCurrentUserIdClient();
await createTransaction(data, userId);
```

---

## Dashboard Features

### 1. Home View
- **Total Balance**: Income - Expenses (real-time)
- **Monthly Income**: From income sources
- **Monthly Expenses**: From transactions
- **Savings Rate**: Percentage calculation
- **Recent Transactions**: Last 5 transactions
- **Smart Insight**: AI-generated financial tip

### 2. Budget View
- **Total Budget**: Sum of allocations
- **Total Spent**: From transactions
- **Remaining**: Budget - Spent
- **Category Breakdown**: Progress bars per category
- **Budget Progress**: Overall percentage

### 3. Analytics View
- **Net Balance**: Income - Expenses
- **Expense Breakdown**: Pie chart by category
- **Expenses by Category**: Budget vs actual
- **Trend Analysis**: Year-over-year comparison

### 4. Transactions View
- **Transaction List**: All transactions
- **Search & Filter**: By category, date, amount
- **Export**: CSV download
- **Add Transaction**: Manual/OCR/Upload

### 5. Goals View
- **Goal Tracking**: Progress bars
- **Add Progress**: Quick contribution
- **Priority Levels**: Low/Medium/High
- **Target Dates**: Countdown display

### 6. Insights View
- **AI Insights**: Qwen-generated tips
- **Categories**: Advice/Alert/Opportunity/Achievement
- **Read Status**: Mark as read
- **Generate New**: Refresh insights

---

## Paylabs Integration

### Configuration

```bash
# .env.local
PAYLABS_MERCHANT_ID=010641
PAYLABS_PRIVATE_KEY=MIIEowIBAAK...
PAYLABS_PUBLIC_KEY=MIIBIjANBgkq...
PAYLABS_PAYIN_URL=https://sit-pay.paylabs.co.id
PAYLABS_VERSION=v2.1
PAYLABS_REMIT_URL=https://sit-remit-api.paylabs.co.id
PAYLABS_REMIT_VERSION=v1.2
```

### Transaction Flow

```
User Creates Transaction
    ↓
Paylabs Payin API (v2.1)
    ↓
Payment Processing
    ↓
Webhook Callback (/api/webhooks/paylabs)
    ↓
Update Transaction Status → "completed"
    ↓
Dashboard Updates Automatically
```

### Webhook Handler

```typescript
// /api/webhooks/paylabs/route.ts
export async function POST(request: NextRequest) {
  const event = await request.json();
  
  switch (event.eventType) {
    case "transaction.success":
      await handleTransactionSuccess(event);
      // Updates database status to "completed"
      break;
  }
}
```

### Auto-Approval (Testing)

For development, transactions auto-approve after 500ms:

```typescript
// paylabs-client.ts (mock mode)
setTimeout(() => {
  simulateWebhookCallback(request, response, "transaction.success");
}, 500);
```

---

## AI Integration

### Qwen AI Configuration

```bash
# .env.local
QWEN_API_KEY=sk-7a6ace55cd07...
QWEN_API_ENDPOINT=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

### AI Features

| Feature | Model | Purpose |
|---------|-------|---------|
| **Smart Categorization** | qwen-flash | Auto-categorize transactions |
| **Financial Insights** | qwen-flash | Personalized advice |
| **Budget Optimization** | qwen-flash | Allocation recommendations |
| **Receipt OCR** | qwen-vl-max | Extract data from images |

### Usage

```typescript
// Generate insight
import { generateInsight } from "@/lib/qwen-client";

const insight = await generateInsight({
  income: 2000000,
  expenses: 500000,
  goals: ["Emergency Fund"],
  investmentPath: "conservative",
});

// Categorize transaction
import { smartCategorize } from "@/lib/qwen-client";

const { category, confidence } = await smartCategorize(
  "Starbucks",
  75000,
  "expense"
);
// Returns: { category: "food", confidence: 0.92 }
```

### Cost Optimization

- **Model**: `qwen-flash` (60% cheaper than qwen-turbo)
- **Average Tokens**: ~95 per insight
- **Fallback**: Predefined insights when API fails

---

## File Structure

```
src/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard pages
│   ├── onboarding/          # Onboarding flow
│   ├── auth/                # Authentication pages
│   └── api/                 # API routes
│       └── webhooks/        # Paylabs webhooks
│
├── components/              # React components
│   ├── dashboard/          # Dashboard components
│   │   ├── views/         # Page views
│   │   │   ├── HomeView.tsx
│   │   │   ├── BudgetView.tsx
│   │   │   ├── AnalyticsView.tsx
│   │   │   └── ...
│   │   ├── SmartInsightCard.tsx
│   │   ├── TransactionFeed.tsx
│   │   └── ...
│   └── auth/              # Auth components
│
├── lib/                   # Utilities & services
│   ├── auth-config.ts     # Centralized auth
│   ├── supabase.ts        # Supabase client
│   ├── supabase-services.ts  # Database operations
│   ├── database.ts        # CRUD operations
│   ├── paylabs-client.ts  # Paylabs API client
│   ├── paylabs-services.ts   # High-level Paylabs
│   ├── qwen-client.ts     # Qwen AI client
│   ├── dashboard-store.tsx   # React context
│   └── utils.ts           # Formatting helpers
│
├── actions/               # Server actions
│   ├── transactions.ts    # Transaction actions
│   ├── budgeting.ts       # Budget actions
│   ├── analytics.ts       # Analytics actions
│   ├── insights.ts        # AI insights
│   └── onboarding-db.ts   # Onboarding save
│
└── types/                 # TypeScript types
    ├── dashboard.ts       # App types
    └── database.types.ts  # Supabase types
```

---

## Environment Setup

### Required Variables

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_ENABLE_DATABASE=true

# Paylabs (REQUIRED for payments)
PAYLABS_MERCHANT_ID=010641
PAYLABS_PRIVATE_KEY=MIIEowIBAAK...
PAYLABS_PUBLIC_KEY=MIIBIjANBgkq...
PAYLABS_PAYIN_URL=https://sit-pay.paylabs.co.id
PAYLABS_VERSION=v2.1
PAYLABS_REMIT_URL=https://sit-remit-api.paylabs.co.id
PAYLABS_REMIT_VERSION=v1.2

# Qwen AI (OPTIONAL - has fallbacks)
QWEN_API_KEY=sk-7a6ace55cd07...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_AI_INSIGHTS=true
```

### Supabase Setup

1. **Create Project** at supabase.com
2. **Get Credentials** from Settings → API
3. **Run Schema** in SQL Editor:
   ```bash
   # Copy contents of supabase/schema.sql
   # Paste and run in Supabase SQL Editor
   ```
4. **Verify Tables**:
   ```sql
   SELECT COUNT(*) FROM profiles;
   SELECT COUNT(*) FROM income_sources;
   SELECT COUNT(*) FROM category_allocations;
   ```

---

## Troubleshooting

### "No authenticated user"

**Cause:** Session not persisting

**Solution:**
```bash
# Check .env.local has Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Clear browser cache and localStorage
# Re-sign in
```

### "Row violates RLS policy"

**Cause:** Using anon client for inserts

**Solution:**
```typescript
// In database.ts - use admin client
const supabase = getSupabaseAdmin();  // Bypasses RLS
```

### "Transactions not updating balance"

**Cause:** Transaction status is "pending"

**Solution:**
- Wait for webhook callback (auto-approves after 500ms in dev)
- Or manually update status in Supabase:
  ```sql
  UPDATE transactions SET status = 'completed' WHERE user_id = 'xxx';
  ```

### "AI insights not generating"

**Cause:** Qwen API key not configured

**Solution:**
```bash
# Add to .env.local
QWEN_API_KEY=sk-...

# Or use fallback insights (works without API key)
```

### "Currency showing as USD"

**Cause:** Locale not set correctly

**Solution:**
```typescript
// In utils.ts - already fixed
const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "IDR";
```

### "Webhook not receiving callbacks"

**Cause:** Paylabs can't reach localhost

**Solution:**
- Use ngrok for local testing:
  ```bash
  ngrok http 3000
  # Update callback URL in Paylabs dashboard
  ```
- Or use auto-approve mode (enabled by default in dev)

---

## API Reference

### Server Actions

```typescript
// Transactions
await createTransaction(data, userId);
await updateTransaction(id, updates);
await deleteTransaction(id);

// Budgeting
await createIncomeSource(data);
await createCategoryAllocation(data);
await getAllocationStatus(userId);

// Analytics
await getExpensesSummary(startDate, endDate);
await getCategoryBreakdown(startDate, endDate);

// AI
await generateInsight(userData);
await smartCategorize(merchant, amount, type);
```

### Database Services

```typescript
// Income Sources
await getIncomeSources(userId);
await createIncomeSource(data);
await updateIncomeSource(id, data);

// Category Allocations
await getCategoryAllocations(userId);
await createCategoryAllocation(data);
await updateCategoryAllocation(id, data);

// Transactions
await getTransactions(userId, limit);
await createTransaction(data);
await updateTransaction(id, data);
```

---

## Key Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| **User Authentication** | ✅ Complete | Supabase Auth with email |
| **Onboarding Flow** | ✅ Complete | 5-step data collection |
| **Dashboard** | ✅ Complete | Real-time data from Supabase |
| **Budget Management** | ✅ Complete | Income sources + allocations |
| **Transaction Entry** | ✅ Complete | Manual/OCR/Upload methods |
| **Paylabs Integration** | ✅ Complete | Payin + Remit + Webhooks |
| **AI Categorization** | ✅ Complete | qwen-flash model |
| **AI Insights** | ✅ Complete | Personalized recommendations |
| **Analytics** | ✅ Complete | Charts + trends + breakdowns |
| **Financial Goals** | ✅ Complete | Track progress |
| **Notifications** | ✅ Complete | Real-time alerts |
| **Mobile Responsive** | ✅ Complete | Works on all devices |

---

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify Supabase credentials in `.env.local`
3. Ensure database schema is loaded
4. Check RLS policies in Supabase dashboard
5. Review this documentation

**Status:** ✅ Production Ready - All features working with real Supabase data

---

**End of Documentation**
