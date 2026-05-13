/// <reference types="vite/client" />

/**
 * Vite exposes only variables prefixed with `VITE_`.
 * Values are read from `frontend/.env`, `frontend/.env.local`, and mode-specific files.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
