# Duitly AI Budgeting MVP - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Visual Identity & Design System](#visual-identity--design-system)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Features](#features)
6. [Onboarding Flow](#onboarding-flow)
7. [Dashboard Components](#dashboard-components)
8. [AI Integration (Qwen)](#ai-integration-qwen)
9. [Paylabs Integration](#paylabs-integration)
10. [API Routes](#api-routes)
11. [Environment Setup](#environment-setup)
12. [Getting Started](#getting-started)
13. [Deployment](#deployment)

---

## Overview

**Duitly** is an AI-driven personal finance application that combines intelligent budgeting with real-time payment processing. Built with Next.js 16, React 19, and integrated with Alibaba Cloud Qwen AI and Paylabs infrastructure.

### Key Features

- 🎯 **Multi-step Onboarding** - Collect user financial profiles
- 🤖 **AI-Powered Insights** - Qwen AI provides personalized financial advice
- 💳 **Paylabs Integration** - Real-time transaction webhooks
- 📊 **Interactive Dashboard** - Track income, expenses, and goals
- 🔔 **Smart Notifications** - Success cards for transactions
- 📱 **Mobile-First Design** - Optimized for touch interactions
- 🎨 **Dark Mode UI** - Beautiful Xtreme Black theme

---

## Visual Identity & Design System

### Color Palette (Dark Mode)

| Token | Value | Name | Usage |
|-------|-------|------|-------|
| `--background` | `#0F0F0F` | Xtreme Black | Primary background |
| `--surface` | `#1A1A1A` | Fake Black | Cards, surfaces |
| `--surface-hover` | `#252525` | - | Hover states |
| `--primary` | `#A3FF47` | Primary Lime | Main actions |
| `--primary-hover` | `#8CE63E` | - | Action hover |
| `--secondary` | `#C3B3EF` | Creamy Taro | AI elements |
| `--secondary-hover` | `#A896D9` | - | Secondary hover |
| `--success` | `#00D084` | Soda Green | Success/income |
| `--success-light` | `#00F5A3` | - | Success light |
| `--danger` | `#FF5F5F` | Fresh Red Soda | Danger/over-budget |
| `--danger-light` | `#FF8A8A` | - | Danger light |
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
```

### Geometry

- **Spacing Grid:** 8pt system (4px, 8px, 16px, 24px, 32px)
- **Border Radius:**
  - Inputs: `16px` (radius-md)
  - Cards: `24px-32px` (radius-lg to radius-xl)

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | App Router, Server Actions |
| **React** | 19.2.3 | UI Framework |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 4.x | Styling |
| **Framer Motion** | 12.34.3 | Animations & Gestures |
| **Lucide React** | 0.575.0 | Icons |

---

## Project Structure

```
src/
├── actions/
│   ├── onboarding.ts          # Onboarding server actions
│   └── insights.ts            # AI insights & categorization
├── app/
│   ├── api/
│   │   ├── insights/stream/   # SSE endpoint for AI streaming
│   │   └── webhooks/paylabs/  # Paylabs webhook handler
│   ├── globals.css            # Design tokens & styles
│   ├── layout.tsx             # Root layout with fonts
│   └── page.tsx               # Main entry point
├── components/
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx
│   │   ├── SmartInsightCard.tsx
│   │   ├── TransactionFeed.tsx
│   │   ├── BudgetProgress.tsx
│   │   ├── SuccessNotificationCard.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── views/
│   │   │   ├── HomeView.tsx
│   │   │   ├── TransactionsView.tsx
│   │   │   ├── BudgetView.tsx
│   │   │   ├── GoalsView.tsx
│   │   │   └── InsightsView.tsx
│   │   └── index.ts
│   └── onboarding/
│       ├── OnboardingFlow.tsx
│       ├── WelcomeStep.tsx
│       ├── PathSelectionStep.tsx
│       ├── GoalSettingStep.tsx
│       ├── FinancialSetupStep.tsx
│       └── index.ts
├── hooks/
│   └── use-mobile.ts          # Mobile detection hook
├── lib/
│   ├── onboarding-store.tsx   # Onboarding state management
│   ├── dashboard-store.tsx    # Dashboard state management
│   └── utils.ts               # Utility functions
├── types/
│   ├── onboarding.ts          # Onboarding types
│   └── dashboard.ts           # Dashboard types
└── public/
    └── logohorizontal.png     # Duitly logo
```

---

## Features

### 1. Onboarding Journey (4 Steps)

**Step 1: Welcome**
- Draggable logo card with physics
- Swipe-up gesture navigation
- Haptic feedback
- Particle animations

**Step 2: Path Selection**
- Conservative vs Active Compounder
- Animated feature cards
- Selection glow effects

**Step 3: Goal Setting**
- Dream description textarea
- Add/remove financial goals
- Priority levels (Low, Medium, High)
- Target amounts and dates

**Step 4: Financial Mapping**
- Income sources (Salary, Freelancing, Other)
- Expense categories
- Real-time cash flow calculation

### 2. Dashboard Features

**Home View**
- Financial summary cards (Balance, Income, Expenses, Savings Rate)
- Smart Insight Card (AI-powered)
- Budget progress visualization
- Recent transactions feed

**Transactions View**
- Full transaction list
- Search and filter
- Auto-categorization badges
- Export functionality

**Budget View**
- Category-wise budget tracking
- Progress bars with color coding
- Over-budget alerts
- Essential vs non-essential tags

**Goals View**
- Visual goal cards
- Progress tracking
- Quick contribution buttons
- Priority indicators

**Insights View**
- AI-generated financial advice
- Spending pattern analysis
- Achievement badges
- Real-time recommendations

### 3. AI Integration

**Qwen API Configuration:**
- Region: Singapore (ap-southeast-1)
- Models: `qwen-max`, `qwen-coder-plus`
- SSE Support: `X-DashScope-SSE: enable`

**AI Features:**
- Smart transaction categorization
- Personalized financial insights
- Spending pattern analysis
- Streaming responses via SSE

### 4. Paylabs Integration

**Webhook Events:**
- `transaction.success` - Triggers success notification
- `transaction.failed` - Logs failed transactions
- `transaction.pending` - Shows pending state

**Success Notification Card:**
- Fixed dimensions: 354x120px
- Soda Green (#00D084) theme
- Icon-based success badge
- Auto-dismiss after 5 seconds
- Particle animations

---

## Onboarding Flow

### State Management

```typescript
interface OnboardingData {
  welcomed: boolean;
  investmentPath: "conservative" | "active-compounder" | null;
  goals: FinancialGoal[];
  dreamDescription?: string;
  incomeSources: IncomeSource[];
  expenses: ExpenseCategory[];
  completedAt?: string;
}
```

### Usage

```typescript
import { useOnboarding } from "@/lib/onboarding-store";

const {
  currentStep,
  data,
  nextStep,
  setInvestmentPath,
  addGoal,
  addIncomeSource,
  completeOnboarding,
} = useOnboarding();
```

---

## Dashboard Components

### State Management

```typescript
import { useDashboard } from "@/lib/dashboard-store";

const {
  currentView,
  transactions,
  summary,
  insights,
  addTransaction,
  addInsight,
  setCurrentView,
} = useDashboard();
```

### Navigation Views

- `home` - Main dashboard
- `transactions` - Transaction list
- `budget` - Budget tracking
- `goals` - Goal management
- `insights` - AI insights

---

## AI Integration (Qwen)

### Server Actions

```typescript
// Get smart insight
import { getSmartInsight } from "@/actions/insights";

const result = await getSmartInsight(userData);
// { success: true, insight: "..." }

// Categorize transaction
import { categorizeTransaction } from "@/actions/insights";

const { category, confidence } = await categorizeTransaction(
  "McDonald's",
  12.50
);
// { category: "food", confidence: 0.9 }
```

### SSE Streaming

```typescript
// Client-side SSE connection
const eventSource = new EventSource("/api/insights/stream?data=" + userData);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "chunk") {
    // Stream content incrementally
    setContent((prev) => prev + data.content);
  }
};
```

### Prompt Building

```typescript
function buildQwenPrompt(data: OnboardingData): string {
  const incomeTotal = data.incomeSources.reduce(/* ... */);
  const expensesTotal = data.expenses.reduce(/* ... */);
  const monthlySurplus = incomeTotal - expensesTotal;

  return `You are a friendly financial advisor for Duitly.
  
USER PROFILE:
- Investment Style: ${data.investmentPath}
- Monthly Income: $${incomeTotal}
- Monthly Expenses: $${expensesTotal}
- Monthly Surplus: $${monthlySurplus}
- Goals: ${data.goals.map(g => g.name).join(", ")}

Provide actionable advice (under 100 words).`;
}
```

---

## Paylabs Integration

### Webhook Handler

**Endpoint:** `POST /api/webhooks/paylabs`

**Payload:**
```json
{
  "event": "transaction.success",
  "transaction": {
    "id": "txn_123",
    "amount": 25.00,
    "currency": "USD",
    "merchant": "McDonald's",
    "status": "completed",
    "timestamp": "2025-02-28T10:30:00Z"
  }
}
```

**Processing:**
1. Verify webhook signature
2. Auto-categorize with AI
3. Save to database
4. Trigger notification
5. Update budget calculations

### Success Notification

```typescript
import { NotificationContainer } from "@/components/dashboard";

<NotificationContainer
  notifications={[
    { id: "1", merchant: "McDonald's", amount: 12.50 }
  ]}
  onDismiss={(id) => dismissNotification(id)}
/>
```

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/webhooks/paylabs` | POST | Handle Paylabs webhooks |
| `/api/webhooks/paylabs` | GET | Poll pending notifications |
| `/api/insights/stream` | GET | SSE stream for AI insights |

---

## Environment Setup

### Required Variables

Create `.env.local`:

```bash
# Alibaba Cloud Qwen API
QWEN_API_KEY=your_api_key_here
QWEN_API_ENDPOINT=https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation

# Paylabs
PAYLABS_API_KEY=your_paylabs_key_here
PAYLABS_WEBHOOK_SECRET=your_webhook_secret_here
PAYLABS_ENVIRONMENT=sandbox

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_AI_INSIGHTS=true
```

---

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your API keys
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### Build & Production

```bash
# Build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

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

### Environment-Specific Config

```typescript
// lib/config.ts
export const config = {
  qwendApiEndpoint: process.env.QWEN_API_ENDPOINT,
  paylabsEnv: process.env.PAYLABS_ENVIRONMENT || "sandbox",
  enableAI: process.env.NEXT_PUBLIC_ENABLE_AI_INSIGHTS === "true",
};
```

---

## Testing Paylabs Webhooks Locally

Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Run your dev server
npm run dev

# Expose to internet
ngrok http 3000

# Configure Paylabs webhook URL
# https://your-ngrok-subdomain.ngrok.io/api/webhooks/paylabs
```

---

## Troubleshooting

### Qwen API Errors

**Issue:** `QWEN_API_KEY not configured`

**Solution:** Ensure `.env.local` exists with valid API key.

### Build Fails

**Issue:** TypeScript errors

**Solution:** Run `npm run lint` to identify issues.

### Mobile Detection

**Issue:** Desktop shows onboarding

**Solution:** The app detects mobile via user agent + screen width. Test on actual mobile device or resize browser < 768px.

---

## Future Enhancements

- [ ] User authentication (NextAuth.js)
- [ ] Database integration (PostgreSQL/Prisma)
- [ ] Real-time WebSocket updates
- [ ] Export to CSV/PDF
- [ ] Multi-currency support
- [ ] Bill reminders
- [ ] Investment tracking
- [ ] Open Banking integration

---

## Credits

**Design System:** Inspired by modern FinTech applications  
**Icons:** [Lucide React](https://lucide.dev)  
**Animations:** [Framer Motion](https://www.framer.com/motion)  
**AI:** [Alibaba Cloud Qwen](https://www.aliyun.com/product/dashscope)  
**Payments:** [Paylabs](https://paylabs.io)

---

**Last Updated:** February 28, 2026  
**Version:** 2.0.0 (MVP Complete)  
**License:** MIT
