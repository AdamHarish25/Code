# Duitly - Supabase Setup Guide

**Version:** 3.2.0  
**Last Updated:** March 1, 2026

---

## Quick Start

### 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "New Project"
3. Fill in:
   - **Project Name:** `duitly`
   - **Database Password:** (save this securely!)
   - **Region:** Choose closest to your users (e.g., Singapore for Indonesia)
4. Click "Create new project"

Wait ~2 minutes for provisioning.

---

### 2. Get API Keys

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these three values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

---

### 3. Configure Environment

Create `.env.local` in your project root:

```bash
# Copy this to .env.local and fill in your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Replace the values with your actual Supabase credentials!**

---

### 4. Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open `supabase/schema.sql` from the project
4. Copy ALL contents
5. Paste into SQL Editor
6. Click **"Run"** (or Cmd/Ctrl + Enter)

You should see "Success. No rows returned"

---

### 5. Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Toggle it **ON** (if not already enabled)
4. (Optional) Disable email confirmation for development:
   - Go to **Authentication** → **Settings**
   - Under "Email Auth", uncheck "Confirm email"
   - Click "Save"

---

### 6. Test Authentication

```bash
# Start development server
npm run dev
```

1. Navigate to onboarding (or refresh if already there)
2. Complete all 5 steps
3. At Step 5 (Auth), enter a real email and password
4. Click "Create Account & Save"

**Success!** You should see:
- Account created in Supabase (check Authentication → Users)
- Onboarding data saved (check Table Editor → profiles, financial_goals, etc.)

---

## Verify Setup

### Check Supabase Dashboard

1. **Authentication → Users**
   - You should see your newly created user

2. **Table Editor**
   - `profiles` - Should have your user's profile
   - `financial_goals` - Your goals from onboarding
   - `income_sources` - Your income sources
   - `category_allocations` - Your expense categories

---

## Troubleshooting

### "Supabase is not configured" error

**Solution:** Make sure `.env.local` exists with all three Supabase variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Then restart the dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### "Invalid API key" error

**Solution:** Double-check you copied the correct keys:
- `NEXT_PUBLIC_SUPABASE_URL` - Project URL (starts with `https://`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - anon/public key (starts with `eyJ...`)
- `SUPABASE_SERVICE_ROLE_KEY` - service_role key (starts with `eyJ...`)

⚠️ **Important:** Don't mix up anon key and service role key!

### "relation does not exist" error

**Solution:** Run the schema migration:
1. Go to SQL Editor in Supabase
2. Run contents of `supabase/schema.sql`

### Email not received for verification

**Solution:** Check spam folder, or disable email confirmation for development:
1. Authentication → Settings
2. Uncheck "Confirm email"
3. Save

---

## Production Deployment

### Environment Variables (Production)

When deploying to Vercel/production, add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Enable Row Level Security (RLS)

RLS is already enabled in the schema. Verify in Supabase:
1. **Authentication** → **Policies**
2. All tables should show "RLS enabled"

### Set up Production Webhook URL

Update Paylabs webhook URL in production:
```bash
PAYLABS_WEBHOOK_URL=https://your-domain.com/api/webhooks/paylabs
```

---

## Database Schema Overview

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profiles | ✅ |
| `income_sources` | Income tracking | ✅ |
| `category_allocations` | Budget categories | ✅ |
| `financial_goals` | Savings goals | ✅ |
| `transactions` | All transactions | ✅ |
| `budget_insights` | AI insights | ✅ |
| `notifications` | User notifications | ✅ |
| `paylabs_webhooks` | Webhook audit log | ✅ |
| `ocr_receipts` | Receipt OCR data | ✅ |

---

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Keep service_role key secret** - Never expose to client-side code
3. **Use environment variables** - Don't hardcode credentials
4. **Enable RLS** - Already enabled in schema
5. **Use HTTPS in production** - Required for secure auth

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security
- **Duitly Docs:** See `DOCUMENTATION.md`

---

**Need Help?** Check `DOCUMENTATION.md` or contact support.
