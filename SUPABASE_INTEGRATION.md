# Duitly Supabase Database Integration Guide

**Version:** 3.1.0  
**Last Updated:** March 1, 2026

---

## Overview

Duitly now uses **Supabase** as its unified database platform for:
- User profiles & authentication
- Income sources tracking
- Budget category allocations
- Financial goals
- Transactions (with Paylabs integration)
- AI insights & notifications
- OCR receipt storage
- Webhook audit logs

---

## Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Configure:
   - **Name:** `duitly`
   - **Database Password:** (save securely!)
   - **Region:** Choose closest to users
4. Click **"Create new project"**

### 2. Run Database Migrations

1. In Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy contents of `supabase/schema.sql`
4. Click **"Run"** (takes ~2 seconds)

### 3. Get API Keys

1. Go to **Settings** → **API**
2. Copy to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 4. Enable Database

```bash
# .env.local
NEXT_PUBLIC_ENABLE_DATABASE=true
```

### 5. (Optional) Load Seed Data

For development/testing:
1. Edit `supabase/seed.sql`
2. Replace `'YOUR-USER-ID-HERE'` with your Supabase user ID
3. Run in SQL Editor

---

## Database Schema

### Tables Overview

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

### Key Functions

**`get_monthly_income(user_id UUID)`**
- Calculates total monthly income from all active sources
- Handles frequency conversion (weekly, biweekly, yearly)

**`get_allocation_status(user_id UUID)`**
- Returns JSONB with allocation status
- Fields: totalIncome, totalAllocated, remainingToAllocate, allocationPercentage, status, message

---

## Integration Points

### Server Actions

All server actions now use Supabase:

```typescript
// src/actions/transactions.ts
import { createTransaction as dbCreateTransaction } from "@/lib/database";

export async function createTransaction(data: TransactionFormData) {
  // 1. Process with Paylabs
  const paylabsResult = await processPayinTransaction(data);
  
  // 2. Save to Supabase
  const dbResult = await dbCreateTransaction({
    user_id: userId,
    type: data.type,
    category: data.category,
    amount: parseFloat(data.amount),
    // ... other fields
  });
  
  return { success: true, transactionId: paylabsResult.transactionId };
}
```

### Database Services

```typescript
// src/lib/database.ts

// Income Sources
getIncomeSources(userId)
createIncomeSource(data)
updateIncomeSource(id, data)
deleteIncomeSource(id)

// Category Allocations
getCategoryAllocations(userId)
createCategoryAllocation(data)
updateCategoryAllocation(id, data)
deleteCategoryAllocation(id)

// Transactions
getTransactions(userId, limit)
createTransaction(data)
updateTransaction(id, data)
deleteTransaction(id)

// Goals, Insights, Notifications...
```

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only **access their own data**
- Service role can **bypass RLS** for server operations
- **Authenticated** users can insert their own data

### Example Policy

```sql
-- Users can view own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Real-time Subscriptions (Future)

Supabase supports real-time updates:

```typescript
// Subscribe to transaction changes
supabase
  .channel('transactions')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'transactions',
      filter: `user_id=eq.${userId}`
    }, 
    (payload) => {
      console.log('Transaction updated:', payload);
    }
  )
  .subscribe();
```

---

## Storage (Optional)

For receipt images:

### 1. Create Bucket

```sql
-- In SQL Editor
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false);
```

### 2. Add Policies

```sql
-- Users can upload their own receipts
CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Upload from App

```typescript
const { data, error } = await supabase.storage
  .from('receipts')
  .upload(`${userId}/${file.name}`, file);
```

---

## Testing

### Check Connection

```typescript
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .limit(1);

console.log("Supabase connected:", !!data);
```

### Test Database Functions

```sql
-- In SQL Editor
SELECT public.get_monthly_income('your-user-id');
SELECT public.get_allocation_status('your-user-id');
```

### Verify Data

```typescript
import { getIncomeSources, getCategoryAllocations } from "@/lib/database";

const income = await getIncomeSources(userId);
const allocations = await getCategoryAllocations(userId);
```

---

## Production Checklist

- [ ] Run `schema.sql` in production
- [ ] Enable RLS on all tables
- [ ] Configure authentication providers
- [ ] Set up email templates
- [ ] Create storage bucket (if using)
- [ ] Enable daily backups
- [ ] Set up monitoring alerts
- [ ] Test all CRUD operations
- [ ] Verify RLS policies work
- [ ] Configure production env vars
- [ ] Load seed data (development only)

---

## Troubleshooting

### "Invalid API key"
**Solution:** Check you're using correct key:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client
- `SUPABASE_SERVICE_ROLE_KEY` for server only

### "relation does not exist"
**Solution:** Run `schema.sql` in Supabase SQL Editor

### "permission denied for table"
**Solution:** Check RLS policies and user authentication

### "duplicate key value violates unique constraint"
**Solution:** Clear duplicate data or use different IDs

---

## Backup & Restore

### Automatic Backups

Supabase backs up daily. Configure in:
**Settings** → **Database** → **Backups**

### Manual Backup

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Using pg_dump
pg_dump -h db.xxxxx.supabase.co -U postgres duitly > backup.sql
```

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://postgresql.org/docs
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Database Functions:** https://supabase.com/docs/guides/database/functions

---

## Migration from Mock Data

The app previously used in-memory mock data. All features now persist to Supabase:

| Feature | Before | After |
|---------|--------|-------|
| Transactions | In-memory array | `public.transactions` table |
| Income Sources | React state | `public.income_sources` table |
| Budget Allocations | React state | `public.category_allocations` table |
| Insights | In-memory array | `public.budget_insights` table |

**Fallback:** If database is not configured (`NEXT_PUBLIC_ENABLE_DATABASE=false`), features still work with mock data.

---

**Support:** Check `DOCUMENTATION.md` for full app documentation
