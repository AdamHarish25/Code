# RLS Onboarding Fix Guide

**Issue:** Users can sign up but can't complete onboarding because RLS policies block INSERT operations.

**Version:** 3.2.1  
**Date:** March 1, 2026

---

## Problem Description

When new users sign up and try to complete onboarding:
1. ✅ User creates account via Supabase Auth
2. ✅ User fills in onboarding forms (path, dreams, goals, income)
3. ❌ **FAILS** when trying to save data to database
4. Error: "new row violates row-level security policy"

**Root Cause:** 
- New users don't have a profile row in `public.profiles` table
- RLS policies prevent INSERT without proper permissions

---

## Solution

### Option 1: Run Migration SQL (Recommended for Existing Projects)

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy the contents of** `supabase/migrations/001_rls_onboarding_fix.sql`
3. **Run the migration**
4. **Done!** New users will now be able to complete onboarding

### Option 2: Re-run Full Schema (For New Projects)

If you haven't created tables yet:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy the contents of** `supabase/schema.sql`
3. **Run the full schema**
4. **Done!** Everything will be set up correctly

---

## What Was Changed

### 1. Added INSERT Policy for Profiles

```sql
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Why:** Allows users to create their own profile row during onboarding.

### 2. Updated Onboarding Code

The `saveOnboardingData` function now:
1. Creates profile first using UPSERT (works with INSERT policy)
2. Then inserts goals, income sources, and allocations
3. All operations respect RLS policies

---

## How It Works Now

### User Signup Flow

```
1. User signs up via email/password
   ↓
2. Supabase Auth creates user in auth.users
   ↓
3. User completes onboarding forms
   ↓
4. saveOnboardingData() is called
   ↓
5. Profile created via UPSERT (INSERT policy allows this)
   ↓
6. Goals, income, allocations inserted (user_id matches auth.uid())
   ↓
7. ✅ All operations succeed due to RLS policies
```

### Onboarding Save Flow

```
saveOnboardingData(userId, data)
   ↓
1. UPSERT into profiles (INSERT policy allows it)
   ↓
2. Update auth.user_metadata (onboarding_completed: true)
   ↓
3. INSERT into financial_goals (user_id matches auth.uid())
   ↓
4. INSERT into income_sources (user_id matches auth.uid())
   ↓
5. INSERT into category_allocations (user_id matches auth.uid())
   ↓
6. ✅ All operations succeed
```

---

## Verification

### Check if Trigger Exists

Run this in SQL Editor:

```sql
SELECT tgname, tgrelid::regclass, tgfoid::regprocedure
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

Should return 1 row.

### Check if Policies Exist

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

Should show 3 policies:
- SELECT (view own profile)
- UPDATE (update own profile)
- **INSERT (insert own profile)** ← New!

### Test with New User

1. Sign up a new test account
2. Check if profile was created:

```sql
SELECT id, email, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 1;
```

3. Complete onboarding
4. Should work without errors! ✅

---

## Fix Existing Users (Optional)

If you have existing users who can't onboard, run this:

```sql
-- Create profiles for users without one
INSERT INTO public.profiles (id, email, updated_at)
SELECT 
  u.id,
  u.email,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

---

## RLS Security

### Is This Secure?

**Yes!** The policies still enforce:
- ✅ Users can only access their own data
- ✅ `auth.uid() = id` ensures user owns the profile
- ✅ Service role can still bypass RLS for server operations

### What Changed

| Before | After |
|--------|-------|
| ❌ No INSERT policy for profiles | ✅ INSERT policy added |
| ❌ No auto-profile creation | ✅ Trigger creates profile on signup |
| ✅ Users can only view own data | ✅ (unchanged) |
| ✅ Users can only update own data | ✅ (unchanged) |

---

## Troubleshooting

### "Policy already exists"

**Solution:** Drop the policy first:
```sql
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
```

### "Function already exists"

**Solution:** Use `CREATE OR REPLACE`:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
```

### "Trigger already exists"

**Solution:** Drop the trigger first:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

### Still Getting RLS Errors

**Check:**
1. User is authenticated: `SELECT auth.uid();`
2. Profile exists: `SELECT * FROM public.profiles WHERE id = auth.uid();`
3. Policies are active: Check `pg_policies` table

---

## Files Modified

| File | Changes |
|------|---------|
| `supabase/schema.sql` | Added INSERT policy, trigger function, trigger |
| `supabase/migrations/001_rls_onboarding_fix.sql` | New migration file |

---

## Next Steps

1. ✅ Run the migration SQL
2. ✅ Test with a new user account
3. ✅ Verify onboarding completes successfully
4. ✅ (Optional) Fix existing users without profiles

---

**Support:** Check `DOCUMENTATION.md` or `SUPABASE_INTEGRATION.md`
