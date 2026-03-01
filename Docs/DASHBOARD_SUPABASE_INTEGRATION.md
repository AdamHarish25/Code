# Duitly Dashboard - Supabase Data Integration

**Status:** ✅ Complete
**Last Updated:** March 1, 2026

## Overview

All dashboard views now fetch **real data from Supabase** instead of mock data. The integration is complete and production-ready.

---

## Database Schema Alignment

### Tables Used by Dashboard

| Table | Dashboard Use | Fields Accessed |
|-------|---------------|-----------------|
| `profiles` | User info | `id`, `email`, `full_name`, `avatar_url` |
| `income_sources` | Smart Budgeting income | `id`, `name`, `amount`, `frequency`, `type`, `is_active` |
| `category_allocations` | Budget categories | `id`, `name`, `category`, `allocated_amount`, `spent_amount`, `is_essential`, `impact_indicator`, `color` |
| `financial_goals` | Goals view | `id`, `name`, `target_amount`, `current_amount`, `target_date`, `priority`, `icon` |
| `transactions` | Home, Analytics, Transactions views | `id`, `type`, `category`, `account`, `amount`, `merchant`, `date`, `status`, `ai_category` |
| `budget_insights` | Insights view | `id`, `title`, `content`, `type`, `created_at`, `is_read` |
| `notifications` | Notification center | `id`, `type`, `title`, `message`, `created_at`, `is_read` |

### Database Functions Used

```sql
-- Get monthly income from all active sources
get_monthly_income(p_user_id UUID) 
RETURNS DECIMAL(12, 2)

-- Get allocation status (balanced/warning/critical)
get_allocation_status(p_user_id UUID) 
RETURNS JSONB {
  totalIncome, 
  totalAllocated, 
  remainingToAllocate, 
  allocationPercentage, 
  status, 
  message
}

-- Analytics: Get expenses summary for period
get_expenses_summary(p_user_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS JSONB

-- Analytics: Get income vs expenses trend by year
get_income_expenses_trend(p_user_id UUID, p_years INTEGER[])
RETURNS JSONB[]

-- Analytics: Get category breakdown
get_category_breakdown(p_user_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS JSONB[]

-- Analytics: Get expenses by account with budget comparison
get_expenses_by_account(p_user_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS JSONB[]

-- Analytics: Get transactions for specific category
get_category_transactions(p_user_id UUID, p_category TEXT, p_start_date DATE, p_end_date DATE, p_limit INTEGER)
RETURNS JSONB
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Dashboard Views                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │  Home    │ │  Budget  │ │Analytics │ │  Goals   │ │Insights││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘│
└───────┼───────────┼─────────────┼─────────────┼───────────┼─────┘
        │           │             │             │           │
        └───────────┴─────────────┴─────────────┴───────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Dashboard Store                               │
│  - React Context for state management                           │
│  - Fetches data from Supabase on mount                          │
│  - Transforms DB records → App types                            │
│  - Provides CRUD operations                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Supabase Services Layer                         │
│  - supabase-services.ts                                         │
│  - All CRUD operations                                          │
│  - Uses (supabase as any) for type safety                       │
│  - Proper error handling                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Database                             │
│  - PostgreSQL with RLS                                          │
│  - User-specific data isolation                                 │
│  - Database functions for complex queries                       │
│  - Real-time capable                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Integration Details

### 1. HomeView (`src/components/dashboard/views/HomeView.tsx`)

**Data Sources:**
- `summary.totalBalance` ← Calculated from transactions
- `summary.monthlyIncome` ← Sum of income transactions this month
- `summary.monthlyExpenses` ← Sum of expense transactions this month
- `summary.savingsRate` ← (income - expenses) / income * 100
- `transactions` ← Recent transactions from `public.transactions`
- `insights` ← From `public.budget_insights`
- `allocationStatus` ← From `get_allocation_status()` function

**Key Code:**
```typescript
const { summary, transactions } = useDashboard();

// Display real balance
<p className="text-2xl md:text-3xl font-bold text-primary">
  {formatCurrency(summary.totalBalance)}
</p>
```

### 2. BudgetView (`src/components/dashboard/views/BudgetView.tsx`)

**Data Sources:**
- `categoryAllocations` ← From `public.category_allocations`
- `transactions` ← From `public.transactions` (for calculating spent)
- `allocationStatus` ← From `get_allocation_status()`

**Key Code:**
```typescript
const { categoryAllocations, transactions } = useDashboard();

// Calculate totals from allocations
const totalBudget = categoryAllocations.reduce(
  (sum, c) => sum + c.allocatedAmount, 
  0
);
const totalSpent = categoryAllocations.reduce(
  (sum, c) => sum + c.spentAmount, 
  0
);
```

### 3. TransactionsView (`src/components/dashboard/views/TransactionsView.tsx`)

**Data Sources:**
- `transactions` ← All from `public.transactions` (ordered by date DESC)

**Key Code:**
```typescript
const { transactions } = useDashboard();

// Filter and display
<TransactionFeed 
  transactions={transactions} 
  showAll 
/>
```

### 4. GoalsView (`src/components/dashboard/views/GoalsView.tsx`)

**Data Sources:**
- `goals` ← From `public.financial_goals`
- Creates goals using `createFinancialGoal()` service

**Key Code:**
```typescript
const { goals, addGoalProgress, refreshData } = useDashboard();

// Create new goal in Supabase
const result = await createFinancialGoalService({
  name: newGoal.name,
  target_amount: newGoal.targetAmount,
  current_amount: newGoal.currentAmount,
  priority: newGoal.priority,
});

// Refresh to get updated data
await refreshData();
```

### 5. AnalyticsView (`src/components/dashboard/views/AnalyticsView.tsx`)

**Data Sources:**
- Uses server actions that call database functions:
  - `getExpensesSummary()` ← `get_expenses_summary()` function
  - `getIncomeExpensesTrend()` ← `get_income_expenses_trend()` function
  - `getCategoryBreakdown()` ← `get_category_breakdown()` function
  - `getExpensesByAccount()` ← `get_expenses_by_account()` function
  - `getCategoryTransactions()` ← `get_category_transactions()` function

**Key Code:**
```typescript
// Load analytics data using DB functions
const [summaryData, trendData, breakdownData, expensesData] = await Promise.all([
  getExpensesSummary(),
  getIncomeExpensesTrend(),
  getCategoryBreakdown(),
  getExpensesByAccount(),
]);
```

### 6. SmartBudgetingView (`src/components/dashboard/views/SmartBudgetingView.tsx`)

**Data Sources:**
- `incomeSources` ← From `public.income_sources`
- `categoryAllocations` ← From `public.category_allocations`
- `allocationStatus` ← From `get_allocation_status()` function

**Key Code:**
```typescript
const { allocationStatus, categoryAllocations, incomeSources } = useDashboard();

// Display allocation status from DB
{allocationStatus && (
  <AIAllocationInsight />
)}
```

### 7. InsightsView (`src/components/dashboard/views/InsightsView.tsx`)

**Data Sources:**
- `insights` ← From `public.budget_insights`
- Creates insights using `createBudgetInsight()` service

**Key Code:**
```typescript
const { insights, addInsight, refreshData } = useDashboard();

// Generate and save new insight
const result = await getSmartInsight();
if (result.success && result.insight) {
  await addInsight({
    title: "New Financial Insight",
    content: result.insight,
    type: "advice",
  });
  await refreshData();
}
```

---

## Data Transformation

### Database → App Types

The `dashboard-store.tsx` transforms database records to app types:

```typescript
// Transaction transformation
function transformTransactions(dbTransactions: any[]): Transaction[] {
  return dbTransactions.map((t) => ({
    id: t.id,
    merchant: t.merchant || t.category || "Unknown",
    amount: t.amount,
    category: (t.category as TransactionCategory) || "other",
    date: t.date,
    status: (t.status as "pending" | "completed" | "failed") || "completed",
    type: (t.type as "income" | "expense") || "expense",
    isAutoCategorized: !!t.paylabs_transaction_id,
    paylabsId: t.paylabs_transaction_id,
  }));
}

// Income Source transformation
function transformIncomeSources(dbSources: any[]): IncomeSourceDetail[] {
  return dbSources.map((s) => ({
    id: s.id,
    name: s.name || "Income",
    amount: parseFloat(s.amount) || 0,
    frequency: (s.frequency as "weekly" | "biweekly" | "monthly" | "yearly") || "monthly",
    type: (s.type as "salary" | "freelance" | "investment" | "side-hustle" | "other") || "other",
  }));
}

// Category Allocation transformation
function transformAllocations(dbAllocations: any[]): CategoryAllocation[] {
  return dbAllocations.map((a) => ({
    id: a.id,
    name: a.name || a.category || "Category",
    category: (a.category as TransactionCategory) || "other",
    allocatedAmount: parseFloat(a.allocated_amount) || 0,
    spentAmount: parseFloat(a.spent_amount) || 0,
    isEssential: a.is_essential ?? true,
    impactIndicator: (a.impact_indicator as "high" | "medium" | "low") || "medium",
    color: a.color || "#A3FF47",
  }));
}
```

---

## CRUD Operations

### Creating Records

All create operations save to Supabase and refresh local state:

```typescript
// Add transaction
const addTransaction = useCallback(async (transaction: Transaction) => {
  const result = await createTransactionService({
    type: transaction.type,
    category: transaction.category,
    account: "Cash",
    amount: transaction.amount,
    date: transaction.date,
    merchant: transaction.merchant,
    status: transaction.status,
  });

  if (result.success && result.data) {
    // Update local state with DB record
    setState((prev) => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));
  }
}, []);
```

### Updating Records

```typescript
// Add goal progress
const addGoalProgress = useCallback(async (id: string, amount: number) => {
  const result = await addGoalProgressService(id, amount);
  
  if (result.success && result.data) {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id 
          ? { ...g, currentAmount: parseFloat(result.data!.current_amount) } 
          : g
      ),
    }));
  }
}, []);
```

### Deleting Records

```typescript
// Delete income source
const handleDelete = async (id: string) => {
  try {
    await deleteIncomeSourceService(id);
    await refreshData(); // Reload from DB
  } catch (error) {
    console.error("Failed to delete income source:", error);
  }
};
```

---

## Real-time Updates

The dashboard automatically refreshes data:

1. **On Mount:** `fetchAllDashboardData()` loads all data
2. **On Auth Change:** Reloads when user signs in
3. **After CRUD:** Manual `refreshData()` calls
4. **Future:** Can add Supabase real-time subscriptions

```typescript
// Subscribe to auth changes
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === "SIGNED_IN" && session) {
        fetchAllDashboardData().then((data) => {
          setState((prev) => ({
            ...prev,
            transactions: transformTransactions(data.transactions),
            // ... other data
          }));
        });
      }
    }
  );
  return () => subscription.unsubscribe();
}, [isInitialized]);
```

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:

```sql
-- Users can only view their own data
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);
```

**Important:** All queries automatically filter by `user_id` using the authenticated user's ID.

---

## Testing the Integration

### 1. Verify Supabase Connection

```typescript
// In browser console (on dashboard page)
const { data, error } = await supabase
  .from("transactions")
  .select("*")
  .limit(1);

console.log("Supabase connected:", !!data, error);
```

### 2. Check Data Loading

```typescript
// Check dashboard store state
// Look for console logs:
// "[Dashboard] Raw data from Supabase:"
// "[Dashboard] Income sources:"
// "[Dashboard] Allocations:"
```

### 3. Test Database Functions

Run in Supabase SQL Editor (replace with your user ID):

```sql
-- Check monthly income
SELECT public.get_monthly_income('your-user-id-here') as monthly_income;

-- Check allocation status
SELECT public.get_allocation_status('your-user-id-here') as allocation_status;

-- Count records
SELECT
  (SELECT COUNT(*) FROM income_sources WHERE user_id = 'your-user-id-here') as income_sources,
  (SELECT COUNT(*) FROM category_allocations WHERE user_id = 'your-user-id-here') as allocations,
  (SELECT COUNT(*) FROM transactions WHERE user_id = 'your-user-id-here') as transactions;
```

### 4. Verify RLS Policies

```sql
-- Should return YOUR data
SELECT * FROM transactions WHERE user_id = auth.uid();

-- Should return empty (can't see other users' data)
-- This tests RLS is working
```

---

## Troubleshooting

### No Data Showing

**Check:**
1. User is authenticated (`supabase.auth.getUser()`)
2. Data exists in Supabase tables for that user ID
3. Console for errors: `[Dashboard] Load data error:`
4. RLS policies allow access

**Solution:**
```bash
# Check .env.local has correct Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### Allocation Status Shows Null

**Check:**
1. `income_sources` table has active records
2. `get_allocation_status()` function exists in DB

**Solution:**
```sql
-- Re-run function creation from schema.sql
-- Or verify in SQL Editor:
SELECT public.get_allocation_status('your-user-id');
```

### Transactions Not Saving

**Check:**
1. RLS policy allows INSERT
2. All required fields provided
3. Console for errors

**Solution:**
```sql
-- Verify RLS policy exists
SELECT * FROM pg_policies 
WHERE tablename = 'transactions' 
AND policyname LIKE '%insert%';
```

---

## Files Modified

| File | Purpose |
|------|---------|
| `src/lib/supabase-services.ts` | All Supabase CRUD operations |
| `src/lib/dashboard-store.tsx` | State management + data transformation |
| `src/components/dashboard/views/HomeView.tsx` | Uses real summary data |
| `src/components/dashboard/views/BudgetView.tsx` | Uses real allocations |
| `src/components/dashboard/views/GoalsView.tsx` | Creates/reads goals from DB |
| `src/components/dashboard/views/AnalyticsView.tsx` | Uses DB analytics functions |
| `src/components/dashboard/views/SmartBudgetingView.tsx` | Uses real income/allocations |
| `src/components/dashboard/views/InsightsView.tsx` | Saves insights to DB |
| `src/components/dashboard/IncomeManagementModule.tsx` | CRUD for income sources |
| `src/components/dashboard/TransactionFeed.tsx` | Displays real transactions |
| `src/components/dashboard/BudgetProgress.tsx` | Calculates from real data |

---

## Next Steps (Optional Enhancements)

1. **Real-time Subscriptions:** Add Supabase real-time for instant updates
2. **Optimistic Updates:** Update UI before DB confirmation
3. **Pagination:** Load transactions in batches
4. **Caching:** React Query or SWR for better performance
5. **Offline Support:** Local-first with sync

---

## Summary

✅ **All dashboard views now display real Supabase data**
✅ **CRUD operations save to database**
✅ **Data transformation aligns with schema**
✅ **RLS policies ensure data isolation**
✅ **Build compiles successfully**

The dashboard is **production-ready** and fully integrated with Supabase.
