import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { saveOnboardingData } from "@/actions/onboarding-db";

/**
 * Auth Callback Handler
 * Handles email confirmation redirects from Supabase Auth
 * 
 * This route is called after users click the confirmation link in their email.
 * It verifies the token and redirects to the appropriate page.
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/dashboard";
  const email = searchParams.get("email");

  // Create Supabase client with service role for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // Redirect to error page if not configured
    return NextResponse.redirect(new URL("/auth/auth-error", request.url));
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Handle email confirmation
  if (type === "signup" || type === "recovery") {
    if (token_hash) {
      try {
        // Verify the OTP token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type === "signup" ? "signup" : "recovery",
        });

        if (error) {
          console.error("[Auth Callback] Verification error:", error.message);
          // Redirect to verification page with error
          const redirectUrl = new URL("/auth/verify-email", request.url);
          if (email) {
            redirectUrl.searchParams.set("email", email);
          }
          redirectUrl.searchParams.set("error", error.message);
          return NextResponse.redirect(redirectUrl);
        }

        // Successfully verified - create session and save onboarding data
        if (data.user && data.session) {
          const userId = data.user.id;

          // Check if user has pending onboarding data in session
          // For now, redirect to onboarding completion or dashboard
          const onboardingComplete = data.user.user_metadata?.onboarding_completed;

          // Set up the response with the session cookie
          const response = NextResponse.redirect(
            new URL(onboardingComplete ? "/dashboard" : "/onboarding/complete", request.url)
          );

          // Set session cookie
          response.cookies.set({
            name: `sb-${new URL(supabaseUrl).hostname}-auth-token`,
            value: data.session.access_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: data.session.expires_in,
          });

          return response;
        }
      } catch (err) {
        console.error("[Auth Callback] Unexpected error:", err);
      }
    }
  }

  // For other auth types or if no token, redirect to dashboard
  return NextResponse.redirect(new URL(next, request.url));
}
