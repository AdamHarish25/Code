# Duitly Onboarding Flow - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Design System](#design-system)
4. [File Structure](#file-structure)
5. [Onboarding Flow Steps](#onboarding-flow-steps)
6. [State Management](#state-management)
7. [Server Actions](#server-actions)
8. [Mobile-Only Detection](#mobile-only-detection)
9. [Interactive Features](#interactive-features)
10. [API Integration](#api-integration)
11. [Environment Setup](#environment-setup)
12. [Change Log](#change-log)

---

## Overview

Duitly is a smart budgeting application with a multi-step onboarding flow that collects user financial data to feed into the Alibaba Cloud Qwen AI model for personalized financial insights.

### Key Features

- ✅ 4-step onboarding flow with smooth animations
- ✅ Mobile-optimized with responsive detection
- ✅ Haptic feedback on touch interactions
- ✅ Drag gestures and swipe navigation
- ✅ AI-powered financial insights via Qwen API
- ✅ Dark mode UI with custom design tokens
- ✅ Framer Motion animations throughout

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16.1.6** | App Router, Server Actions |
| **React 19.2.3** | UI Framework |
| **TypeScript 5** | Type Safety |
| **Tailwind CSS 4** | Styling |
| **Framer Motion 12.34.3** | Animations & Gestures |
| **Lucide React 0.575.0** | Icon Library |

---

## Design System

### Color Tokens (Dark Mode)

```css
:root {
  --background: #0F0F0F;              /* Xtreme Black */
  --foreground: #EDEDED;
  --surface: #1A1A1A;                 /* Fake Black - Cards/Surfaces */
  --surface-hover: #252525;
  --primary: #A3FF47;                 /* Primary Lime - Actions */
  --primary-hover: #8CE63E;
  --secondary: #C3B3EF;               /* Creamy Taro - AI/Secondary */
  --secondary-hover: #A896D9;
  --border: #2A2A2A;
  --muted: #6B6B6B;
  --error: #FF4757;
  --success: #2ED573;
}
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-xl: 32px;
```

---

## File Structure

```
src/
├── actions/
│   └── onboarding.ts              # Server actions for Qwen API
├── app/
│   ├── globals.css                # Global styles & design tokens
│   ├── layout.tsx                 # Root layout with OnboardingProvider
│   └── page.tsx                   # Main entry point
├── components/
│   ├── MobileOnboardingWrapper.tsx # Mobile/desktop conditional rendering
│   └── onboarding/
│       ├── OnboardingFlow.tsx     # Main container component
│       ├── WelcomeStep.tsx        # Step 1: Welcome screen
│       ├── PathSelectionStep.tsx  # Step 2: Investment path selection
│       ├── GoalSettingStep.tsx    # Step 3: Financial goals
│       ├── FinancialSetupStep.tsx # Step 4: Income & expenses
│       └── index.ts               # Component exports
├── hooks/
│   └── use-mobile.ts              # Mobile detection hook
├── lib/
│   └── onboarding-store.tsx       # React Context state management
└── types/
    └── onboarding.ts              # TypeScript type definitions
```

---

## Onboarding Flow Steps

### Step 1: Welcome
- **Component:** `WelcomeStep.tsx`
- **Features:**
  - Draggable logo card with physics
  - Swipe-up gesture to continue
  - Floating particle background
  - Haptic feedback on interactions
  - Shimmer effect on CTA button
  - Particle burst animation on click

### Step 2: Path Selection
- **Component:** `PathSelectionStep.tsx`
- **Options:**
  - **Conservative:** Low-risk, steady growth (Shield icon)
  - **Active Compounder:** Growth-focused, higher risk (TrendingUp icon)
- **Features:**
  - Animated floating icons
  - Selection glow effect
  - Haptic feedback on card tap
  - Pulsing feature bullet points

### Step 3: Goal Setting
- **Component:** `GoalSettingStep.tsx`
- **Features:**
  - Dream description textarea
  - Add/remove financial goals
  - Priority levels (Low, Medium, High)
  - Target amount and date
  - Haptic feedback on interactions

### Step 4: Financial Setup
- **Component:** `FinancialSetupStep.tsx`
- **Features:**
  - Add income sources (Salary, Freelancing, Other)
  - Add expense categories
  - Monthly cash flow calculation
  - Essential vs non-essential expense tags
  - Real-time summary card

### Completion Screen
- **Features:**
  - Success checkmark animation
  - AI-generated insight display
  - Loading state during API call

---

## State Management

### OnboardingData Interface

```typescript
interface OnboardingData {
  welcomed: boolean;
  investmentPath: InvestmentPath | null;
  goals: FinancialGoal[];
  dreamDescription?: string;
  incomeSources: IncomeSource[];
  expenses: ExpenseCategory[];
  completedAt?: string;
}
```

### Context Provider

Located in `src/lib/onboarding-store.tsx`:

```typescript
<OnboardingProvider>
  {children}
</OnboardingProvider>
```

### Available Hooks

```typescript
const {
  currentStep,
  data,
  totalSteps,
  currentStepIndex,
  nextStep,
  previousStep,
  goToStep,
  setWelcomed,
  setInvestmentPath,
  addGoal,
  updateGoal,
  removeGoal,
  setDreamDescription,
  addIncomeSource,
  updateIncomeSource,
  removeIncomeSource,
  addExpense,
  updateExpense,
  removeExpense,
  completeOnboarding,
  canProceed,
  isComplete,
} = useOnboarding();
```

---

## Server Actions

### finishOnboarding

**File:** `src/actions/onboarding.ts`

```typescript
export async function finishOnboarding(
  data: OnboardingData
): Promise<OnboardingResult>
```

**Purpose:** Sends onboarding data to Qwen API and generates personalized financial insights.

**Returns:**
```typescript
{
  success: boolean;
  insight?: string;
  recommendations?: string[];
  error?: string;
}
```

### validateOnboardingData

```typescript
export async function validateOnboardingData(
  data: OnboardingData
): Promise<{ valid: boolean; errors: string[] }>
```

---

## Mobile-Only Detection

### useMobile Hook

**File:** `src/hooks/use-mobile.ts`

```typescript
const { isMobile, isClient } = useMobile();
```

**Detection Logic:**
- User Agent parsing (Android, iOS, etc.)
- Screen width < 768px
- Combines both for accurate detection

### MobileOnboardingWrapper

**File:** `src/components/MobileOnboardingWrapper.tsx`

- Shows onboarding flow on mobile devices
- Shows desktop placeholder on larger screens
- SSR-safe with `isClient` check

---

## Interactive Features

### Haptic Feedback

```typescript
function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
```

**Usage Examples:**
- `triggerHaptic(10)` - Light tap
- `triggerHaptic([30, 50, 30])` - Success pattern
- `triggerHaptic(20)` - Selection feedback

### Gesture Controls

**Drag Gestures (WelcomeStep):**
```typescript
const dragX = useMotionValue(0);
const dragY = useMotionValue(0);
const opacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);
const rotate = useTransform(dragX, [-200, 200], [-15, 15]);
```

**Swipe to Continue:**
```typescript
const handleDragEnd = (_, info) => {
  if (info.offset.y < -100) {
    triggerHaptic(30);
    onNext();
  }
};
```

### Animation Variants

```typescript
whileHover={{ scale: 1.05, y: -4 }}
whileTap={{ scale: 0.98 }}
animate={{ y: [0, -5, 0], rotate: [0, 1, -1, 0] }}
```

---

## API Integration

### Qwen API Configuration

**Endpoint:** `https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation`

**Request Format:**
```json
{
  "model": "qwen-turbo",
  "input": {
    "messages": [
      { "role": "system", "content": "..." },
      { "role": "user", "content": "..." }
    ]
  },
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 200
  }
}
```

**Response Handling:**
```typescript
// Multiple response format support
if (result.output?.text) {
  return result.output.text;
} else if (result.output?.choices?.[0]?.message?.content) {
  return result.output.choices[0].message.content;
}
```

### Prompt Building

The `buildQwenPrompt` function creates a personalized prompt including:
- Investment style
- Monthly income (normalized)
- Monthly expenses
- Monthly surplus
- Financial dreams
- Financial goals

---

## Environment Setup

### .env.local

```bash
# Alibaba Cloud Qwen API Configuration
QWEN_API_KEY=your_api_key_here
QWEN_API_ENDPOINT=https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

### Required Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^12.34.3",
    "lucide-react": "^0.575.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Change Log

### v1.0.0 - Initial Setup

**Files Created:**
- `src/types/onboarding.ts` - Type definitions
- `src/lib/onboarding-store.tsx` - State management
- `src/actions/onboarding.ts` - Server actions
- `src/components/onboarding/*.tsx` - All step components
- `src/app/globals.css` - Design tokens

### v1.1.0 - Mobile-Only Restriction

**Changes:**
- Created `src/hooks/use-mobile.ts` for device detection
- Created `src/components/MobileOnboardingWrapper.tsx`
- Updated `src/app/page.tsx` to use wrapper
- Added desktop placeholder screen with animations

**Features:**
- Screen width detection (< 768px)
- User agent parsing
- Animated desktop placeholder
- Feature highlight cards

### v1.2.0 - Enhanced Interactivity

**WelcomeStep.tsx:**
- Added draggable logo card with `useMotionValue`
- Implemented swipe-up gesture navigation
- Added floating particle background
- Added haptic feedback helper
- Added shimmer effect on CTA button
- Added particle burst on click
- Added security badge

**PathSelectionStep.tsx:**
- Added `triggerHaptic` function
- Added floating icon animations
- Added selection glow effect
- Added hover/tap animations
- Added pulsing feature bullet points

**GoalSettingStep.tsx:**
- Added haptic feedback on add/remove
- Added motion buttons for priorities
- Added hover/tap animations on all buttons
- Added `handleRemoveGoal` function

**FinancialSetupStep.tsx:**
- Added haptic feedback throughout
- Added `handleRemoveIncome` and `handleRemoveExpense`
- Added motion buttons for all interactions
- Added hover/tap animations

### v1.2.1 - Navigation Bug Fix

**Issue:** Start button not working

**File:** `src/components/onboarding/OnboardingFlow.tsx`

**Fix:**
```typescript
// Before (broken)
const handleNext = useCallback(() => {
  // Navigation is handled by the store
}, []);

// After (fixed)
const handleNext = useCallback(() => {
  nextStep();
}, [nextStep]);

const handleBack = useCallback(() => {
  previousStep();
}, [previousStep]);
```

**Also:**
- Added `nextStep` and `previousStep` to destructured context
- Removed `MobileOnboardingWrapper` restriction (optional)

### v1.2.2 - Qwen API Error Handling

**File:** `src/actions/onboarding.ts`

**Changes:**
- Removed unused `SmartInsight` import
- Added `X-DashScope-SSE: disable` header
- Added detailed error logging
- Added multiple response format support
- Added fallback for unexpected response formats

**Improved Error Handling:**
```typescript
if (!response.ok) {
  const errorText = await response.text();
  console.error(`Qwen API error (${response.status}):`, errorText);
  throw new Error(`Qwen API error: ${response.status} ${response.statusText}`);
}

// Handle different response formats
if (result.output?.text) {
  return result.output.text;
} else if (result.output?.choices?.[0]?.message?.content) {
  return result.output.choices[0].message.content;
}
```

### v1.3.0 - Layout Updates

**File:** `src/app/layout.tsx`

**Changes:**
- Added `OnboardingProvider` wrapper
- Updated metadata for Duitly branding

**File:** `src/components/onboarding/OnboardingFlow.tsx`

**Changes:**
- Added `Image` component import
- Integrated logo in header
- Removed nested `OnboardingProvider`

**Assets:**
- Copied `logohorizontal.png` to `/public`

---

## Running the Application

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## Troubleshooting

### Start Button Not Working

**Solution:** Ensure `nextStep` and `previousStep` are called in `OnboardingFlow.tsx`:

```typescript
const { nextStep, previousStep } = useOnboarding();

const handleNext = useCallback(() => {
  nextStep();
}, [nextStep]);
```

### Qwen API Errors

**Common Issues:**
1. **Invalid API Key:** Check `.env.local` configuration
2. **Network Error:** Verify internet connection
3. **Response Format:** Code handles multiple formats now

**Fallback:** The app shows a fallback insight if API fails.

### Mobile Detection Not Working

**Solution:** The hook uses both user agent and screen width. To force mobile view for testing:

```typescript
// In use-mobile.ts, temporarily return true
return { isMobile: true, isClient: true };
```

---

## Future Enhancements

- [ ] Add progress persistence (localStorage)
- [ ] Add skip onboarding option
- [ ] Add multi-language support
- [ ] Add accessibility (ARIA labels)
- [ ] Add loading skeletons
- [ ] Add unit tests
- [ ] Add E2E tests with Playwright

---

**Last Updated:** February 28, 2026
**Version:** 1.3.0
