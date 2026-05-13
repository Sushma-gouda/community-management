/**
 * Supabase client — reads `VITE_SUPABASE_*` from `frontend/.env` (Vite `import.meta.env`).
 *
 * @see https://vite.dev/guide/env-and-mode.html
 */

import { createClient } from "@supabase/supabase-js";

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

function readViteEnv(key: keyof ImportMetaEnv): string {
  const raw = import.meta.env[key];
  return typeof raw === "string" ? raw.trim() : "";
}

const supabaseUrl = readViteEnv("VITE_SUPABASE_URL");
const supabaseAnonKey = readViteEnv("VITE_SUPABASE_ANON_KEY");

/** True when real URL and anon key are set in `frontend/.env` (not placeholders). */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("https://") &&
  supabaseUrl !== PLACEHOLDER_URL &&
  supabaseAnonKey !== PLACEHOLDER_KEY,
);

if (!isSupabaseConfigured) {
  console.warn(
    "[Supabase] Not configured. Add to frontend/.env:\n" +
      "  VITE_SUPABASE_URL=https://<project-ref>.supabase.co\n" +
      "  VITE_SUPABASE_ANON_KEY=<anon-key>\n" +
      "Copy frontend/.env.example → frontend/.env then restart the dev server.",
  );
}

/**
 * Singleton Supabase client. Uses your `.env` values when set; otherwise a no-op placeholder
 * so the app can still compile (auth/API calls will fail until configured).
 */
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : PLACEHOLDER_URL,
  isSupabaseConfigured ? supabaseAnonKey : PLACEHOLDER_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

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

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[Supabase] signOut error:", error.message);
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  }
}

export default supabase;
