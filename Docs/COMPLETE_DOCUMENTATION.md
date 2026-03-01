# Signature from Developer

Halo! 👋

Kenalin gw Adam Haris Abd

Gw disini bangun aplikasi ini atas kebutuhan hackathon, dan yang pastinya menggunakan AI untuk kecepatan leverage pembangunan supaya tidak memakan banyak waktu dalam proses pembangunannya.

Aplikasi ini dibangun dengan Next.js 16, Supabase sebagai backend, dan Tailwind CSS untuk styling. Semua fitur utama sudah diimplementasikan, termasuk integrasi Paylabs untuk transaksi dan Qwen AI untuk insights.

Dan Semua yang dibangun ini tidak sepenuhnya dibangun oleh AI (No Code) melainkan ada ulur tangan saya pribadi dalam penanganan menyelesaikan bug yang cukup menantang, dan juga styling bagian yang AI blm bisa menjangkau (ex: Tata letak yang kurang rapih seperti bottom bar dan modal transaksi pada dashboard yang harus di styling ulang untuk tidak saling meniban).

Mungkin cukup dari saya. Sekian Terimakasih!

Adam H.A


# Duitly - Complete Documentation

**Version:** 4.0.0 (Production Ready)
**Last Updated:** March 1, 2026
**Stack:** Next.js 16, Supabase, TypeScript, Tailwind CSS

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [User Journey](#user-journey)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Authentication](#authentication)
6. [Dashboard Features](#dashboard-features)
7. [Paylabs Integration](#paylabs-integration)
8. [AI Integration](#ai-integration)
9. [File Structure](#file-structure)
10. [Environment Setup](#environment-setup)
11. [Troubleshooting](#troubleshooting)

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

## User Journey

### Complete User Flow: From Welcome to Dashboard

This section documents the complete user journey through Duitly, including all UI changes and interactions.

### Phase 1: Welcome & Authentication

#### Step 1.1: Welcome Page (`/auth/welcome`)
```
┌─────────────────────────────────────────┐
│          Welcome to Duitly              │
│     Your Smart Budgeting Assistant      │
│                                         │
│  ✨ AI-Powered Insights                 │
│  📊 Smart Budget Allocation             │
│  💳 Paylabs Integration                 │
│                                         │
│  [Get Started]  [Sign In]               │
└─────────────────────────────────────────┘
```

**User Actions:**
- Click "Get Started" → Goes to Sign Up
- Click "Sign In" → Goes to Sign In page

#### Step 1.2: Sign Up (`/auth/signup`)
```
┌─────────────────────────────────────────┐
│          Create Your Account            │
│                                         │
│  Email: [________________]              │
│  Password: [________________]           │
│  Confirm: [________________]            │
│                                         │
│  [Create Account]                       │
│                                         │
│  Already have account? [Sign In]        │
└─────────────────────────────────────────┘
```

**Flow:**
1. User enters email and password
2. Clicks "Create Account"
3. Account created in Supabase Auth
4. Redirects to onboarding

#### Step 1.3: Sign In (`/auth/signin`)
```
┌─────────────────────────────────────────┐
│          Welcome Back!                  │
│                                         │
│  Email: [________________]              │
│  Password: [________________]           │
│                                         │
│  [Sign In]                              │
│                                         │
│  No account? [Sign Up]                  │
└─────────────────────────────────────────┘
```

---

### Phase 2: Onboarding Flow

#### Step 2.1: Investment Path Selection
**Route:** `/onboarding` → Step 1

**UI Components:**
- Large animated header icon (Sparkles)
- Two gradient cards (Conservative vs Active Compounder)
- Check indicator on selected card
- Feature list with gradient bullets

```
┌─────────────────────────────────────────┐
│              ✨ Choose Your Path        │
│   Select the investment approach...     │
│                                         │
│  ┌──────────────┐ ┌──────────────┐     │
│  │ 🛡️           │ │ 📈           │     │
│  │ Conservative │ │ Active       │     │
│  │ Safe & Steady│ │ Compounder   │     │
│  │              │ │              │     │
│  │ • Capital    │ │ • Aggressive │     │
│  │ • Steady     │ │ • Market     │     │
│  │ • Lower      │ │ • Higher     │     │
│  │ • Bond       │ │ • Stock      │     │
│  └──────────────┘ └──────────────┘     │
│         ✓ Selected                     │
│                                         │
│           [Continue]                    │
└─────────────────────────────────────────┘
```

**User Actions:**
- Click on a card → Card highlights with checkmark
- Click "Continue" → Proceeds to next step

**Data Saved:**
```typescript
{
  investmentPath: "conservative" | "active-compounder"
}
```

#### Step 2.2: Dream Setting
**Route:** `/onboarding` → Step 2

**UI Components:**
- Rotating header icon animation
- Large textarea for dream description
- 4 clickable example dream cards with icons

```
┌─────────────────────────────────────────┐
│          ✨ What's Your Dream?          │
│   Describe your biggest financial...    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ I want to achieve financial...    │ │
│  │                                   │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  🎯 Emergency Fund    🏠 Home          │
│     6 months expenses     Down payment │
│  🌍 Financial Free     💼 Business     │
│     Retire early          Successful   │
│                                         │
│           [Continue]                    │
└─────────────────────────────────────────┘
```

**User Actions:**
- Type in textarea OR click example card
- Click "Continue" → Proceeds to next step

**Data Saved:**
```typescript
{
  dreamDescription: "Build an emergency fund..."
}
```

#### Step 2.3: Goal Setting
**Route:** `/onboarding` → Step 3

**UI Components:**
- Rotating target icon header
- Dashed border "Add Goal" button
- Animated goal cards with progress bars
- Priority badges (Low/Medium/High)

```
┌─────────────────────────────────────────┐
│          🎯 Set Your Goals              │
│   Add specific financial goals...       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  +  Add Your First Goal         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  OR after adding goals:                 │
│  ┌─────────────────────────────────┐   │
│  │ Emergency Fund        [High] 🗑️│   │
│  │ 💰 50,000,000  📅 2026-12-31   │   │
│  │ [========0%========]            │   │
│  └─────────────────────────────────┘   │
│                                         │
│           [Continue]                    │
└─────────────────────────────────────────┘
```

**User Actions:**
- Click "Add Goal" → Form expands
- Fill name, amount, date, priority
- Click "Add Goal" → Card appears
- Click 🗑️ → Remove goal
- Click "Continue" → Proceeds to next step

**Data Saved:**
```typescript
{
  goals: [
    {
      id: "xxx",
      name: "Emergency Fund",
      targetAmount: 50000000,
      targetDate: "2026-12-31",
      priority: "high"
    }
  ]
}
```

#### Step 2.4: Financial Setup
**Route:** `/onboarding` → Step 4

**UI Components:**
- Rotating sparkles header icon
- Income type selector with icons (Wallet/Briefcase/etc.)
- Frequency dropdown
- Income list with type badges

```
┌─────────────────────────────────────────┐
│          ✨ Financial Setup             │
│   Add your income sources...            │
│                                         │
│  💰 Income Sources                      │
│  ┌─────────────────────────────────┐   │
│  │  +  Add Income                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  OR after adding:                       │
│  ┌─────────────────────────────────┐   │
│  │ 💰 Salary                      🗑️│   │
│  │    Monthly • salary            │   │
│  │             15,000,000         │   │
│  └─────────────────────────────────┘   │
│                                         │
│           [Continue]                    │
└─────────────────────────────────────────┘
```

**User Actions:**
- Click "+" → Form expands
- Enter amount, select frequency and type
- Click "Add Income" → Card appears
- Click "Continue" → Saves data and redirects

**Data Saved:**
```typescript
{
  incomeSources: [
    {
      type: "salary",
      amount: 15000000,
      frequency: "monthly"
    }
  ],
  expenses: [],
  completedAt: "2026-03-01T10:00:00Z"
}
```

#### Step 2.5: Onboarding Complete
**Route:** `/onboarding/complete`

**UI Components:**
- Success animation
- Loading spinner while saving
- Auto-redirect to dashboard

```
┌─────────────────────────────────────────┐
│                                         │
│            ✓ Success!                   │
│                                         │
│        Saving your profile...           │
│                                         │
│        [Spinning loader]                │
│                                         │
│      Redirecting to dashboard...        │
│                                         │
└─────────────────────────────────────────┘
```

**Backend Actions:**
1. Save all onboarding data to Supabase
2. Update user metadata (`onboarding_completed: true`)
3. Create profile in `profiles` table
4. Insert income sources
5. Insert category allocations
6. Insert financial goals
7. Redirect to `/dashboard`

---

### Phase 3: Dashboard Experience

#### Step 3.1: Dashboard Home (`/dashboard`)
**Route:** `/dashboard` → Home tab

**UI Components:**
- Summary cards (Balance, Income, Expenses, Savings Rate)
- Smart Insight Card (AI-generated)
- Budget Progress visualization
- Recent Transactions list
- Floating Action Button (+)

```
┌─────────────────────────────────────────┐
│  Good Morning! 👋                       │
│  Here's your financial overview         │
│                                         │
│  ┌──────────┐ ┌──────────┐            │
│  │ 💰 Total │ │ 📈 Income│            │
│  │ Balance  │ │ Monthly  │            │
│  │ 1,975,000│ │ 2,000,000│            │
│  └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐            │
│  │ 📉 Exp   │ │ 💵 Savings│            │
│  │ Monthly  │ │ Rate     │            │
│  │ 25,000   │ │ 98.75%   │            │
│  └──────────┘ └──────────┘            │
│                                         │
│  ✨ AI Insight                          │
│  "Your budget looks well-balanced..."  │
│                                         │
│  📊 Budget Progress                     │
│  [========98%========]                 │
│                                         │
│  📝 Recent Transactions                 │
│  • Shell - Rp 10,000                   │
│  • McDonald's - Rp 15,000              │
│                                         │
│                            [+] FAB      │
└─────────────────────────────────────────┘
```

**Data Flow:**
1. Dashboard loads → `DashboardProvider` initializes
2. `fetchAllDashboardData()` called
3. Supabase queries:
   - `transactions` (last 100)
   - `income_sources` (active only)
   - `category_allocations` (all)
   - `financial_goals` (all)
   - `budget_insights` (last 10)
   - `get_allocation_status()` RPC function
4. Data transformed to app types
5. Summary calculated
6. State updated
7. Views render with real data

#### Step 3.2: Adding Transaction
**Action:** Click FAB (+) button

**UI Flow:**
```
1. Click [+] → Modal opens
2. Select Type → Income/Expense
3. Select Category → Food/Transport/etc.
4. Select Method → Manual/Photo/Upload
5. Enter Details → Amount, Date, Merchant
6. Submit → Paylabs processes
7. Success → Transaction saved
8. Webhook → Status updated to "completed"
9. Dashboard → Balance updates automatically
```

**Backend Flow:**
```typescript
// 1. Create transaction
POST /api/transactions
{
  type: "expense",
  category: "food",
  amount: 75000,
  merchant: "Starbucks",
  date: "2026-03-01"
}

// 2. Paylabs processes
{
  transactionId: "duitly_xxx",
  paylabsTransactionId: "pl_xxx",
  status: "pending"
}

// 3. Webhook callback (500ms later)
POST /api/webhooks/paylabs
{
  eventType: "transaction.success",
  transactionId: "duitly_xxx",
  amount: 75000
}

// 4. Database updated
UPDATE transactions
SET status = "completed"
WHERE paylabs_transaction_id = "pl_xxx"

// 5. Dashboard refreshes
// Balance: 2,000,000 → 1,925,000
```

#### Step 3.3: Budget View
**Route:** `/dashboard` → Budget tab

```
┌─────────────────────────────────────────┐
│  Budget                                 │
│  Track and manage your spending         │
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐     │
│  │🐷 Total│ │📉 Spent│ │📊 Left │     │
│  │Budget  │ │This Mo │ │Remaining     │
│  │40,000  │ │25,000  │ │15,000        │
│  └────────┘ └────────┘ └────────┘     │
│                                         │
│  Budget Categories                      │
│  ┌─────────────────────────────────┐   │
│  │ 🏠 Housing                      │   │
│  │ Rp 20,000 / Rp 20,000 (100%)   │   │
│  │ [============] ⚠️ Over budget  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🍔 Food & Dining                │   │
│  │ Rp 5,000 / Rp 15,000 (33%)     │   │
│  │ [====        ] ✓ On track       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Step 3.4: Analytics View
**Route:** `/dashboard` → Analytics tab

```
┌─────────────────────────────────────────┐
│  Analytics                              │
│  Visual insights into spending          │
│                                         │
│  ✨ AI Insights                         │
│  "Your spending increased 10%..."      │
│                                         │
│  ┌──────────┐ ┌──────────┐            │
│  │ Net      │ │ Income   │            │
│  │ Balance  │ │ vs Exp   │            │
│  │ 1,975,000│ │ [Chart]  │            │
│  └──────────┘ └──────────┘            │
│                                         │
│  Expense Breakdown                      │
│  [Pie Chart]                            │
│  • Food: 60%                           │
│  • Transport: 40%                      │
│                                         │
│  Expenses by Category                   │
│  • Food: Rp 15,000 / Rp 20,000        │
│  • Transport: Rp 10,000 / Rp 10,000   │
└─────────────────────────────────────────┘
```

#### Step 3.5: Goals View
**Route:** `/dashboard` → Goals tab

```
┌─────────────────────────────────────────┐
│  Financial Goals                  [+ Add]│
│  Track progress towards your dreams     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🏠 Emergency Fund      [High]  │   │
│  │                                  │   │
│  │  Progress: [======30%======]    │   │
│  │  Saved: Rp 15,000,000           │   │
│  │  Target: Rp 50,000,000          │   │
│  │  📅 Target: Dec 31, 2026        │   │
│  │                                  │   │
│  │  [+ Rp 100,000] Quick Add       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Step 3.6: Insights View
**Route:** `/dashboard` → Insights tab

```
┌─────────────────────────────────────────┐
│  AI Insights        [🔄 New Insight]   │
│  Personalized financial intelligence    │
│                                         │
│  🧠 Your Personal Financial Advisor     │
│  "Our AI analyzes your spending..."    │
│                                         │
│  Recent Insights                        │
│  ┌─────────────────────────────────┐   │
│  │ 💡 Spending Pattern Alert       │   │
│  │ "Your dining expenses increased │   │
│  │  by 23% this month..."          │   │
│  │  alert • 2 hours ago            │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 📈 Savings Opportunity          │   │
│  │ "You have Rp 500,000 extra..."  │   │
│  │  opportunity • 1 day ago        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

### Phase 4: Settings & Profile

#### Step 4.1: Settings Page (`/settings`)
**Access:** Click profile icon → Settings

```
┌─────────────────────────────────────────┐
│  Settings                               │
│  Manage your account and preferences    │
│                                         │
│  👤 Profile                             │
│  [Avatar]  Full Name: [Input]          │
│            Email: user@example.com     │
│                                         │
│  🎨 Preferences                         │
│  Theme: [Dark ▼]  Currency: [IDR ▼]   │
│  Language: [English ▼]                  │
│                                         │
│  🔔 Notifications                       │
│  ☑ Email Notifications                 │
│  ☑ Push Notifications                  │
│                                         │
│  🛡️ Account                             │
│  [Change Password]                      │
│  [Delete Account]                       │
│                                         │
│  [Save Changes]  [Sign Out]             │
└─────────────────────────────────────────┘
```

**Settings Saved To:**
- Supabase Auth user metadata
- Persists across sessions

---

## Architecture

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
