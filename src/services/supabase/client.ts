/**
 * Supabase Client Configuration
 *
 * This module exports a singleton Supabase client for use throughout the frontend.
 * Configure your project URL and anon key via environment variables.
 *
 * Environment variables (set in frontend/.env):
 *   VITE_SUPABASE_URL      — Your Supabase project URL
 *   VITE_SUPABASE_ANON_KEY — Your Supabase anon/public key
 *
 * Usage:
 *   import { supabase } from '@/services/supabase/client'
 *   const { data, error } = await supabase.from('profiles').select('*')
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] Missing environment variables.\n" +
      "Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n" +
      "See .env.example for reference."
  );
}

/**
 * Singleton Supabase client instance.
 * Import this wherever you need to interact with Supabase.
 */
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Helper: get the currently authenticated user.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("[Supabase] getUser error:", error.message);
    return null;
  }
  return user;
}

/**
 * Helper: get the current session.
 * Returns null if no active session.
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error("[Supabase] getSession error:", error.message);
    return null;
  }
  return session;
}

/**
 * Helper: sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[Supabase] signOut error:", error.message);
  }
}

export default supabase;
