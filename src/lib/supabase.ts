/**
 * Supabase Client Configuration
 * Unified database connection for Duitly
 * Requires Supabase credentials to be configured
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Configuration from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Validate Supabase configuration
 * Throws error if not configured properly
 */
function validateConfig() {
  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured. Please add it to your .env.local file."
    );
  }
  if (!supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. Please add it to your .env.local file."
    );
  }
}

/**
 * Client-side Supabase client
 * Uses anon key with RLS policies
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Server-side Supabase client
 * Uses service role key (bypasses RLS)
 * ONLY use in server components and server actions
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Get Supabase client based on context
 * @param useAdmin - Use admin client (server-side only)
 */
export function getSupabaseClient(useAdmin: boolean = false) {
  return useAdmin ? supabaseAdmin : supabase;
}

/**
 * Handle Supabase errors consistently
 */
export function handleSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("Invalid API key")) {
      return "Database authentication failed. Check your Supabase credentials.";
    }
    if (error.message.includes("relation does not exist")) {
      return "Database tables not found. Run the SQL migrations.";
    }
    return error.message;
  }
  return "An unexpected database error occurred.";
}
