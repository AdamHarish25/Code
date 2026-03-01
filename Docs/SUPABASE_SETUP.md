# Duitly Supabase Setup Guide

**Version:** 3.1.0  
**Last Updated:** March 1, 2026

---

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name:** duitly
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users
4. Click "Create new project"

### 2. Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute

### 3. Get API Keys

1. Go to **Settings** → **API**
2. Copy these values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key - keep secret!)

### 4. Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### 5. Update Environment

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_ENABLE_DATABASE=true
```

---

## Database Schema Overview

### Tables

| Table | Purpose | RLS Enabled |
|-------|---------|-------------|
| `profiles` | User profiles | ✅ |
| `income_sources` | Income tracking | ✅ |
| `category_allocations` | Budget categories | ✅ |
| `financial_goals` | Savings goals | ✅ |
| `transactions` | All transactions | ✅ |
| `budget_insights` | AI insights | ✅ |
| `notifications` | User notifications | ✅ |
| `paylabs_webhooks` | Webhook audit log | ✅ |
| `ocr_receipts` | Receipt OCR data | ✅ |

### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only access their own data
- Service role can bypass RLS for server operations
- Webhooks are authenticated

---

## Database Functions

### `get_monthly_income(user_id UUID)`

Calculates total monthly income from all active income sources.

```sql
SELECT public.get_monthly_income('user-uuid-here');
-- Returns: DECIMAL(12, 2)
```

### `get_allocation_status(user_id UUID)`

Returns JSONB with allocation status:
- totalIncome
- totalAllocated
- remainingToAllocate
- allocationPercentage
- status (balanced/warning/critical)
- message

```sql
SELECT public.get_allocation_status('user-uuid-here');
```

---

## Storage Setup (Optional)

For receipt image uploads:

1. Go to **Storage** → **New Bucket**
2. Create bucket: `receipts`
3. Set to **Private**
4. Add policy for authenticated users to upload

### Storage Policy

```sql
-- Allow users to upload their own receipts
CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own receipts
CREATE POLICY "Users can view their receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Testing Connection

### 1. Test from Application

```bash
npm run dev
```

Check browser console for:
- `[Supabase] Connected successfully` (good)
- `[Supabase] Missing environment variables` (check .env.local)

### 2. Test from Supabase Dashboard

1. Go to **Table Editor**
2. Verify all tables exist
3. Try inserting a test row

### 3. Test API

```typescript
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .limit(1);

console.log(data, error);
```

---

## Migrations

### Creating New Migrations

1. Create SQL file in `supabase/migrations/`
2. Name: `YYYYMMDDHHMMSS_description.sql`
3. Run in Supabase SQL Editor

### Example Migration

```sql
-- supabase/migrations/20260301120000_add_indexes.sql

-- Add index for faster transaction lookups
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON public.transactions(user_id, date DESC);
```

---

## Backup & Restore

### Automatic Backups

Supabase automatically backs up your database daily. Configure in:
**Settings** → **Database** → **Backups**

### Manual Backup

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Using pg_dump
pg_dump -h db.xxxxx.supabase.co -U postgres duitly > backup.sql
```

### Restore

```bash
# Using Supabase Dashboard
# SQL Editor → Run backup.sql contents

# Using psql
psql -h db.xxxxx.supabase.co -U postgres -d duitly < backup.sql
```

---

## Troubleshooting

### "Invalid API key"

**Solution:** Check that you're using the correct key:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side
- `SUPABASE_SERVICE_ROLE_KEY` for server-side only

### "relation does not exist"

**Solution:** Run the schema SQL in Supabase SQL Editor

### RLS Policy Errors

**Solution:** Ensure auth is enabled and user is logged in

### Connection Timeout

**Solution:** Check your Supabase project status at [status.supabase.com](https://status.supabase.com)

---

## Production Checklist

- [ ] Run all migrations
- [ ] Enable RLS on all tables
- [ ] Configure authentication providers
- [ ] Set up email templates
- [ ] Create storage bucket for receipts
- [ ] Enable daily backups
- [ ] Set up monitoring alerts
- [ ] Test all CRUD operations
- [ ] Verify RLS policies work correctly
- [ ] Configure production environment variables

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://postgresql.org/docs
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

---

**Support:** Check `DOCUMENTATION.md` for full app documentation
