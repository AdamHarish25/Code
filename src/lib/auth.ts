/**
 * Supabase Auth Utilities
 * Email-based authentication functions
 */

"use server";

import { supabaseAdmin } from "./supabase";
import { headers } from "next/headers";

/**
 * Sign Up with Email
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Please enter a valid email address",
      };
    }

    // Validate password
    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          onboarding_completed: false,
        },
      },
    });

    if (error) {
      console.error("[Auth] Sign up error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
      message: "Account created! Please check your email to verify.",
    };
  } catch (error) {
    console.error("[Auth] Sign up error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Sign In with Email
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Auth] Sign in error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error("[Auth] Sign in error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Sign Out
 */
export async function signOut() {
  try {
    const { error } = await supabaseAdmin.auth.signOut();
    
    if (error) {
      console.error("[Auth] Sign out error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("[Auth] Sign out error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get Current User (Server-side)
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name,
      avatarUrl: user.user_metadata?.avatar_url,
      onboardingCompleted: user.user_metadata?.onboarding_completed || false,
    };
  } catch (error) {
    console.error("[Auth] Get user error:", error);
    return null;
  }
}

/**
 * Update User Profile
 */
export async function updateUserProfile(updates: {
  full_name?: string;
  avatar_url?: string;
  onboarding_completed?: boolean;
}) {
  try {
    const { data, error } = await supabaseAdmin.auth.updateUser({
      data: updates,
    });

    if (error) {
      console.error("[Auth] Update profile error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error("[Auth] Update profile error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Reset Password
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      console.error("[Auth] Reset password error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: "Password reset email sent!",
    };
  } catch (error) {
    console.error("[Auth] Reset password error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Verify OTP (for email confirmation)
 */
export async function verifyOtp(email: string, token: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      console.error("[Auth] Verify OTP error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error("[Auth] Verify OTP error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
