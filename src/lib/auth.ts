/**
 * Supabase Auth Utilities
 * Email-based authentication functions
 * Uses client-side Supabase for session persistence
 */

"use client";

import { supabase } from "./supabase";

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
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
      session: data.session,
      message: "Account created!",
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

    const { data, error } = await supabase.auth.signInWithPassword({
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
    const { error } = await supabase.auth.signOut();

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
 * Get Current User (Client-side)
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

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
