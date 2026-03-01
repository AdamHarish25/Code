# Email Verification Flow Documentation

**Version:** 3.2.0  
**Last Updated:** March 1, 2026

---

## Overview

Duitly now includes a complete email verification flow for new user signups. When users create an account, they must verify their email address before gaining full access to the platform.

---

## User Flow

### Welcome Page Flow (New Entry Point)

```
1. User visits / (home page)
2. Automatically redirected to /auth/welcome
3. User chooses:
   - Login → /auth/signin → Dashboard
   - Signup → /onboarding → Steps 1-5 → Email verification → Dashboard
```

### Standard Signup Flow

```
1. User visits /auth/signup or /onboarding
2. Fills in email and password
3. Account created (unverified)
4. Redirected to /auth/verify-email
5. User receives confirmation email
6. User clicks confirmation link
7. Redirected to /auth/callback
8. Email verified, session created
9. Redirected to /onboarding/complete (if new) or /dashboard (if existing)
```

### Onboarding Signup Flow

```
1. User completes onboarding steps (path, dream, goals, income)
2. Reaches auth step (Step 5)
3. Creates account with email/password
4. Redirected to /auth/verify-email
5. User receives confirmation email
6. User clicks confirmation link
7. Redirected to /auth/callback
8. Email verified, session created
9. Redirected to /onboarding/complete
10. Onboarding data saved to database
11. Redirected to /dashboard
```

---

## File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts              # Handles email confirmation redirects
│   │   ├── verify-email/
│   │   │   └── page.tsx              # Email verification pending page
│   │   ├── verified/
│   │   │   └── page.tsx              # Success page after verification
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   └── onboarding/
│       └── complete/
│           └── page.tsx              # Finalizes onboarding after verification
│
├── components/
│   └── auth/
│       ├── SignUpPage.tsx            # Updated with verification redirect
│       ├── SignInPage.tsx
│       └── VerifyEmailPage.tsx       # Verification pending UI
│
└── lib/
    └── auth.ts                       # Auth utilities (signUp, signIn, etc.)
```

---

## Components

### 1. VerifyEmailPage (`/auth/verify-email`)

**Purpose:** Notifies user to check their email for confirmation

**Features:**
- Displays email address where confirmation was sent
- Auto-polling every 3 seconds to check verification status
- Resend verification email button (30s cooldown)
- Auto-redirect to dashboard/onboarding upon verification
- Beautiful animations with Framer Motion

**Props:**
- `email` (query param) - User's email address

**Redirects to:**
- `/onboarding/complete` - If user hasn't completed onboarding
- `/dashboard` - If user has completed onboarding

---

### 2. Auth Callback Route (`/auth/callback`)

**Purpose:** Handles the redirect from Supabase after email confirmation

**Query Parameters:**
- `token_hash` - Verification token
- `type` - Verification type (signup/recovery)
- `email` - User's email

**Logic:**
1. Verifies OTP token with Supabase
2. Creates session on success
3. Checks onboarding completion status
4. Redirects to appropriate page

**Redirects to:**
- `/onboarding/complete` - If `onboarding_completed` is false
- `/dashboard` - If `onboarding_completed` is true

---

### 3. Verified Page (`/auth/verified`)

**Purpose:** Success page shown after email verification

**Features:**
- Success animation
- Feature highlights
- 3-second countdown to dashboard
- Manual "Go to Dashboard Now" button

---

### 4. Onboarding Complete Page (`/onboarding/complete`)

**Purpose:** Finalizes onboarding flow after email verification

**Logic:**
1. Gets current user from session
2. Saves onboarding data to database:
   - Updates user metadata
   - Inserts financial goals
   - Inserts income sources
   - Inserts category allocations
3. Redirects to dashboard on success

**Status States:**
- `loading` - Getting user session
- `saving` - Saving data to database
- `success` - Completed, redirecting
- `error` - Failed, shows error message

---

## Supabase Configuration

### Required Settings

In Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/auth/callback
  - http://localhost:3000/auth/verified
```

### Email Templates

Customize email templates in:
**Authentication → Email Templates → Confirmation**

Example template:

```html
<h2>Welcome to Duitly!</h2>
<p>Thank you for signing up. Please confirm your email address by clicking the button below:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
<p>Or copy this link: {{ .ConfirmationURL }}</p>
<p>If you didn't create this account, ignore this email.</p>
```

---

## Code Examples

### Signing Up with Email Verification

```typescript
import { signUpWithEmail } from "@/lib/auth";

async function handleSignup(email: string, password: string) {
  const result = await signUpWithEmail(email, password);
  
  if (result.success) {
    // User created, email sent
    // Redirect to verification page
    router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
  } else {
    // Handle error
    console.error(result.error);
  }
}
```

### Checking Email Verification Status

```typescript
import { supabase } from "@/lib/supabase";

async function checkVerification() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user?.email_confirmed_at) {
    // Email is verified
    console.log("Verified at:", user.email_confirmed_at);
  } else {
    // Email not yet verified
    console.log("Email pending verification");
  }
}
```

### Resending Verification Email

```typescript
import { supabase } from "@/lib/supabase";

async function resendVerification(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    console.error("Failed to resend:", error.message);
  } else {
    console.log("Verification email resent");
  }
}
```

---

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## API Reference

### `signUpWithEmail(email, password)`

Creates a new user account and sends verification email.

**Returns:**
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}
```

---

### `signInWithEmail(email, password)`

Signs in an existing user.

**Returns:**
```typescript
{
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}
```

---

### `verifyOtp(email, token)`

Verifies OTP code (alternative to magic link).

**Returns:**
```typescript
{
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Signup creates unverified account
- [ ] Verification email is received
- [ ] Email link redirects to callback
- [ ] Callback verifies email successfully
- [ ] User redirected to correct page
- [ ] Session is created and persists
- [ ] Resend email works (after 30s)
- [ ] Verification page auto-detects verification

### Automated Testing

```typescript
// Example test
describe("Email Verification", () => {
  it("should send verification email on signup", async () => {
    const result = await signUpWithEmail("test@example.com", "password123");
    expect(result.success).toBe(true);
    expect(result.user.email_confirmed_at).toBeUndefined();
  });

  it("should verify email via callback", async () => {
    // Simulate callback with token
    const response = await fetch("/auth/callback?token_hash=xxx&type=signup");
    expect(response.status).toBe(307); // Redirect
  });
});
```

---

## Troubleshooting

### Email Not Received

**Causes:**
- Supabase not configured
- Email provider blocking
- Spam folder

**Solutions:**
1. Check Supabase dashboard for errors
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
3. Check spam/junk folder
4. Use resend button on verification page

### Callback Not Redirecting

**Causes:**
- Invalid token
- Expired token
- Missing environment variables

**Solutions:**
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_APP_URL` is set
3. Check Supabase logs in dashboard
4. Ensure callback route is in redirect URLs

### Session Not Created

**Causes:**
- Cookie issues
- CORS problems
- Service role key incorrect

**Solutions:**
1. Clear browser cookies
2. Check `SUPABASE_SERVICE_ROLE_KEY`
3. Verify callback route sets cookies correctly
4. Check network tab for failed requests

---

## Security Considerations

### Email Verification Benefits

- ✅ Prevents fake accounts
- ✅ Ensures valid email addresses
- ✅ Reduces spam and abuse
- ✅ Enables password recovery
- ✅ Complies with best practices

### Token Security

- Tokens are single-use
- Tokens expire after 24 hours (configurable)
- Tokens are hashed before storage
- HTTPS required in production

### Session Management

- Sessions stored in HTTP-only cookies
- Auto-refresh enabled
- Secure flag in production
- SameSite=Lax for CSRF protection

---

## Customization

### Changing Verification Page Design

Edit: `src/components/auth/VerifyEmailPage.tsx`

### Changing Redirect URLs

Update in:
- `src/lib/auth.ts` - `emailRedirectTo` option
- `src/app/auth/callback/route.ts` - redirect logic

### Changing Polling Interval

In `VerifyEmailPage.tsx`, modify:
```typescript
const interval = setInterval(checkVerification, 3000); // Change 3000ms
```

### Changing Cooldown Timer

In `VerifyEmailPage.tsx`, modify:
```typescript
const [countdown, setCountdown] = useState(30); // Change 30 seconds
```

---

## Resources

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **Email Templates:** https://supabase.com/docs/guides/auth/auth-email-templates
- **Next.js Auth:** https://nextjs.org/docs/authentication

---

**Support:** Check `DOCUMENTATION.md` or email support@duitly.app
