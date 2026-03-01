/**
 * Supabase Client Configuration
 * Unified database connection for Duitly
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
 * Create a mock Supabase client for development without credentials
 */
function createMockClient() {
  return {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: () => Promise.resolve({ data: [], error: null }),
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
    }),
  };
}

/**
 * Client-side Supabase client
 * Uses anon key with RLS policies
 * Falls back to mock client if not configured
 */
export const supabase = isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createMockClient() as any;

/**
 * Server-side Supabase client
 * Uses service role key (bypasses RLS)
 * ONLY use in server components and server actions
 * Falls back to mock client if not configured
 */
export const supabaseAdmin = isSupabaseConfigured() && supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : createMockClient() as any;

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
