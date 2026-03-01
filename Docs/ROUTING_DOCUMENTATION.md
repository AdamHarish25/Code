# Duitly Routing Documentation

**Version:** 3.2.0  
**Last Updated:** March 1, 2026

---

## Overview

This document describes all routes and their purposes in the Duitly application.

---

## Route Map

```
/ (Home)
├─ Checks authentication & onboarding status
├─ Authenticated + Onboarding Complete → /dashboard
├─ Authenticated + Onboarding Incomplete → /onboarding
└─ Not Authenticated → /auth/welcome

/auth/welcome
├─ Welcome page with Login/Signup choice
├─ Login → /auth/signin
└─ Signup → /onboarding

/auth/signin
└─ Sign in page → /dashboard

/auth/signup
└─ Direct signup page → /auth/verify-email

/auth/verify-email
├─ Email verification pending page
├─ Auto-polls for verification
└─ Verified → /onboarding/complete OR /dashboard

/auth/callback
├─ Handles email confirmation from Supabase
└─ Redirects to /onboarding/complete or /dashboard

/auth/verified
└─ Success page after email verification

/onboarding
├─ Multi-step onboarding flow
├─ Steps: path → dream → goals → financial → auth
└─ Complete → /onboarding/complete

/onboarding/complete
├─ Finalizes onboarding after email verification
├─ Saves onboarding data to database
└─ Redirects to /dashboard

/dashboard
└─ Main dashboard for authenticated users
   ├─ Home view
   ├─ Budgeting view
   ├─ Analytics view
   ├─ Transactions view
   ├─ Budget view
   ├─ Goals view
   └─ Insights view
```

---

## Route Details

### Public Routes

#### `/` (Home)
**File:** `src/app/page.tsx`  
**Purpose:** Entry point - smart routing based on auth status  
**Logic:**
- Checks if user is authenticated via Supabase
- If authenticated + onboarding complete → `/dashboard`
- If authenticated + onboarding incomplete → `/onboarding`
- If not authenticated → `/auth/welcome`

---

#### `/auth/welcome`
**File:** `src/app/auth/welcome/page.tsx`  
**Component:** `WelcomePage.tsx`  
**Purpose:** Welcome page for new users to choose Login or Signup  

**Features:**
- Hero section with Duitly branding
- Feature highlights (Secure, AI-Powered, Smart Budgeting)
- Two choice cards:
  - **Login** - For existing users (redirects to `/auth/signin`)
  - **Signup** - For new users (redirects to `/onboarding`)

**Actions:**
- Login button → `/auth/signin`
- Signup button → `/onboarding`
- Back button → `/`

---

#### `/auth/signin`
**File:** `src/app/auth/signin/page.tsx`  
**Component:** `SignInPage.tsx`  
**Purpose:** User login page  

**Features:**
- Email/password form
- "Forgot password" link
- Link to signup page

**After Success:**
- Redirects to `/dashboard`

---

#### `/auth/signup`
**File:** `src/app/auth/signup/page.tsx`  
**Component:** `SignUpPage.tsx`  
**Purpose:** Direct signup page (alternative to onboarding signup)  

**Features:**
- Email/password form
- Password confirmation
- Link to signin page

**After Success:**
- Redirects to `/auth/verify-email?email=...`

---

#### `/auth/verify-email`
**File:** `src/app/auth/verify-email/page.tsx`  
**Component:** `VerifyEmailPage.tsx`  
**Purpose:** Notifies user to check email for confirmation  

**Query Parameters:**
- `email` - User's email address

**Features:**
- Displays email where confirmation was sent
- Auto-polling every 3 seconds
- Resend email button (30s cooldown)
- Auto-redirect on verification

**After Verification:**
- If onboarding incomplete → `/onboarding/complete`
- If onboarding complete → `/dashboard`

---

#### `/auth/callback`
**File:** `src/app/auth/callback/route.ts`  
**Type:** API Route (GET)  
**Purpose:** Handles email confirmation redirect from Supabase  

**Query Parameters:**
- `token_hash` - Verification token
- `type` - Verification type (signup/recovery)
- `email` - User's email

**Logic:**
1. Verifies OTP token with Supabase
2. Creates session on success
3. Checks onboarding completion status
4. Redirects appropriately

**Redirects:**
- `/onboarding/complete` - If onboarding not complete
- `/dashboard` - If onboarding complete

---

#### `/auth/verified`
**File:** `src/app/auth/verified/page.tsx`  
**Purpose:** Success page after email verification  

**Features:**
- Success animation
- Feature highlights
- 3-second countdown to dashboard
- Manual "Go to Dashboard Now" button

---

### Protected Routes

#### `/onboarding`
**File:** `src/app/onboarding/page.tsx`  
**Component:** `OnboardingFlow.tsx`  
**Purpose:** Multi-step onboarding flow for new users  

**Steps:**
1. **Path Selection** - Choose investment style (Conservative/Active Compounder)
2. **Dream Setting** - Describe financial dream
3. **Goal Setting** - Add financial goals
4. **Financial Setup** - Add income sources and expenses
5. **Auth** - Create account or sign in

**After Completion:**
- Saves data to database
- Redirects to `/onboarding/complete`

---

#### `/onboarding/complete`
**File:** `src/app/onboarding/complete/page.tsx`  
**Purpose:** Finalizes onboarding after email verification  

**Logic:**
1. Gets current user from session
2. Saves onboarding data to database:
   - Updates user metadata
   - Inserts financial goals
   - Inserts income sources
   - Inserts category allocations
3. Shows success/loading states
4. Redirects to `/dashboard`

**Status States:**
- `loading` - Getting user session
- `saving` - Saving data to database
- `success` - Completed, redirecting
- `error` - Failed, shows error message

---

#### `/dashboard`
**File:** `src/app/dashboard/page.tsx`  
**Component:** `DashboardLayout.tsx`  
**Purpose:** Main dashboard for authenticated users  

**Views:**
- **Home** - Overview and summary
- **Budgeting** - Smart budgeting with AI
- **Analytics** - Financial analytics
- **Transactions** - Transaction history
- **Budget** - Budget allocation
- **Goals** - Financial goals tracking
- **Insights** - AI-powered insights

**Features:**
- Navigation sidebar
- Transaction feed
- AI insights
- Budget tracking
- Goal progress

---

## Route Protection

### Authentication Guard

```typescript
// Check authentication status
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Redirect to /auth/welcome
  router.push("/auth/welcome");
}
```

### Onboarding Guard

```typescript
// Check onboarding completion
const onboardingCompleted = user.user_metadata?.onboarding_completed;

if (!onboardingCompleted) {
  // Redirect to /onboarding
  router.push("/onboarding");
}
```

---

## Navigation Examples

### Programmatic Navigation

```typescript
import { useRouter } from "next/navigation";

function MyComponent() {
  const router = useRouter();

  // Navigate to dashboard
  router.push("/dashboard");

  // Navigate to onboarding
  router.push("/onboarding");

  // Navigate to verification with email
  router.push("/auth/verify-email?email=user@example.com");

  // Go back
  router.back();
}
```

### Conditional Routing

```typescript
useEffect(() => {
  const checkAndRedirect = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const completed = user.user_metadata?.onboarding_completed;
      router.push(completed ? "/dashboard" : "/onboarding");
    } else {
      router.push("/auth/welcome");
    }
  };
  
  checkAndRedirect();
}, [router]);
```

---

## API Routes

### `/api/webhooks/paylabs`
**File:** `src/app/api/webhooks/paylabs/route.ts`  
**Methods:** POST, GET, DELETE  
**Purpose:** Handle Paylabs payment webhooks

### `/api/insights/stream`
**File:** `src/app/api/insights/stream/route.ts`  
**Method:** GET  
**Purpose:** Server-Sent Events for AI insights

---

## Route Configuration

### Supabase Auth Redirect URLs

Configure in Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/auth/callback
  - http://localhost:3000/auth/verified
  - http://localhost:3000/onboarding/complete
```

### Environment Variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Route Guards Summary

| Route | Auth Required | Onboarding Required |
|-------|---------------|---------------------|
| `/` | No | No (auto-redirects) |
| `/auth/*` | No | No |
| `/onboarding` | No | No |
| `/onboarding/complete` | Yes | No |
| `/dashboard` | Yes | Yes |

---

## Resources

- **Next.js Routing:** https://nextjs.org/docs/app/building-your-application/routing
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Email Verification:** See `EMAIL_VERIFICATION_FLOW.md`
