# Duitly - Quick Start Guide

**Version:** 3.1.0  
**Read Time:** 5 minutes

---

## What is Duitly?

Duitly is a smart budgeting app that helps you:
- 📊 Track income and expenses
- 🤖 Get AI-powered budget recommendations
- 💳 Process payments via Paylabs
- 📸 Scan receipts with AI OCR
- 💰 Set and track financial goals

---

## Architecture at a Glance

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│   Supabase   │────▶│   Paylabs    │
│   Frontend   │     │  (Database)  │     │  (Payments)  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Qwen AI     │     │  TypeScript  │     │  Webhooks    │
│ (OCR/Chat)   │     │   (Types)    │     │ (Real-time)  │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 5-Minute Setup

### Step 1: Install (1 min)

```bash
git clone https://github.com/your-org/duitly.git
cd duitly
npm install
```

### Step 2: Environment Setup (2 min)

```bash
cp .env.example .env.local
```

Edit `.env.local` - minimum required:

```bash
# Supabase (get from supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Qwen AI (optional - app works without it)
ALIBABA_CLOUD_API_KEY=sk-your-key

# Paylabs (optional - mock mode enabled by default)
PAYLABS_MERCHANT_ID=010001
```

### Step 3: Database Setup (2 min)

1. Go to Supabase Dashboard → SQL Editor
2. Copy `supabase/schema.sql` contents
3. Paste and click "Run"

Done! Your database is ready.

### Step 4: Run

```bash
npm run dev
```

Open http://localhost:3000

---

## Key Features

### 1. Add Transaction

Click the **+ button** (bottom-right) → Choose:
- **Manual** - Type details
- **Photo** - Scan receipt (AI extracts data)
- **Upload** - Upload receipt image

### 2. Smart Budgeting

Go to **Budgeting** tab → **AI Generate** → Get optimal allocation

### 3. Income Management

Go to **Budgeting** → **Income** tab → Add income sources

---

## Project Structure

```
src/
├── actions/          # Server actions (API calls)
├── app/              # Next.js app router
├── components/       # React components
├── lib/              # Utilities & clients
│   ├── database.ts   # Supabase CRUD
│   ├── paylabs-*.ts  # Paylabs integration
│   ├── qwen-client.ts# AI integration
│   └── supabase.ts   # Database client
└── types/            # TypeScript types

supabase/
├── schema.sql        # Database schema
└── seed.sql          # Sample data
```

---

## Data Flow Example

**User adds expense:**

```
1. User fills form → AddTransactionModal
2. Click "Confirm" → createTransaction() action
3. Action calls:
   - Paylabs API (process payment)
   - Qwen AI (categorize merchant)
   - Supabase (save to database)
4. Webhook confirms → Update UI
```

---

## Database Tables

| Table | What it stores |
|-------|----------------|
| `profiles` | User info |
| `income_sources` | Salary, freelance, etc. |
| `category_allocations` | Budget categories |
| `financial_goals` | Savings goals |
| `transactions` | All transactions |
| `budget_insights` | AI tips |
| `notifications` | Alerts |

---

## Common Tasks

### Add Sample Data

Run `supabase/seed.sql` in SQL Editor (replace user ID first)

### Check Database Connection

```typescript
// In browser console
import { supabase } from "@/lib/supabase"
const { data } = await supabase.from("profiles").select("*").limit(1)
console.log(data)
```

### Test Paylabs Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks/paylabs \
  -H "Content-Type: application/json" \
  -d '{"eventId":"test","eventType":"transaction.success","merchantId":"010001","amount":50000}'
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | Check Node.js version (need 20+) |
| Database errors | Run `schema.sql` in Supabase |
| AI not working | Check `ALIBABA_CLOUD_API_KEY` |
| Paylabs errors | Check `PAYLABS_MERCHANT_ID` |

---

## Next Steps

1. **Read Full Docs:** `DOCUMENTATION.md`
2. **Database Guide:** `SUPABASE_INTEGRATION.md`
3. **Paylabs Guide:** `PAYLABS_INTEGRATION.md`

---

## Quick Reference

### Commands

```bash
npm run dev      # Development
npm run build    # Production build
npm run start    # Start production
npm run lint     # Check code
```

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Database URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Database key |
| `ALIBABA_CLOUD_API_KEY` | No | AI features |
| `PAYLABS_*` | No | Payment processing |

---

**Need Help?** Check `DOCUMENTATION.md` or email support@duitly.app
