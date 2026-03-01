/**
 * Centralized Authentication Configuration
 * Single source of truth for auth across the app
 * 
 * USAGE:
 * 1. Client components: use getCurrentUserClient()
 * 2. Server actions: Pass user ID from client or use cookies
 * 3. Check auth: use requireAuth() to ensure user is logged in
 */

import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

// =====================================================
// CLIENT-SIDE AUTH (for client components)
// =====================================================

/**
 * Get current user (client-side)
 * Use in: Client components, hooks, event handlers
 */
export async function getCurrentUserClient(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.warn("[Auth] No authenticated user:", error?.message);
      return null;
    }
    return user;
  } catch (error) {
    console.error("[Auth] Get user error:", error);
    return null;
  }
}

/**
 * Get current user ID (client-side)
 * Use when you only need the user ID
 */
export async function getCurrentUserIdClient(): Promise<string | null> {
  const user = await getCurrentUserClient();
  return user?.id || null;
}

/**
 * Require authentication (client-side)
 * Throws error if not authenticated - use before protected operations
 */
export async function requireAuthClient(): Promise<User> {
  const user = await getCurrentUserClient();
  if (!user) {
    throw new Error("Authentication required. Please sign in.");
  }
  return user;
}

/**
 * Check if user is authenticated (client-side)
 */
export async function isAuthenticatedClient(): Promise<boolean> {
  const user = await getCurrentUserClient();
  return !!user;
}

/**
 * Get auth token (for passing to server actions)
 * Use this to authenticate server-side requests
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error("[Auth] Get token error:", error);
    return null;
  }
}

// =====================================================
// SERVER-SIDE AUTH (for server actions)
// =====================================================

/**
 * Get current user from auth token (server-side)
 * Pass the token from client using getAuthToken()
 */
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    // Create admin client to verify token
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.warn("[Auth Server] Invalid token:", error?.message);
      return null;
    }
    
    console.log("[Auth Server] Got user from token:", user.email, user.id);
    return user;
  } catch (error) {
    console.error("[Auth Server] Get user from token error:", error);
    return null;
  }
}

/**
 * Require authentication with token (server-side)
 */
export async function requireAuthFromToken(token: string): Promise<User> {
  const user = await getUserFromToken(token);
  if (!user) {
    console.error("[Auth Server] Authentication required");
    throw new Error("Authentication required. Please sign in.");
  }
  return user;
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

/**
 * Get current user (client-side only)
 */
export async function getCurrentUser(): Promise<User | null> {
  return getCurrentUserClient();
}

/**
 * Get current user ID (client-side only)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

// =====================================================
// AUTH STATE HELPERS
// =====================================================

/**
 * Listen to auth state changes (client-side only)
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user || null);
    }
  );
  
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Sign out user
 */
export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Get session (client-side)
 */
export async function getSession() {
  return await supabase.auth.getSession();
}
