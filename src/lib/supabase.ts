// ============================================================================
// Supabase client (optional)
// ============================================================================
//
// Deadline Radar works with ZERO configuration: if the two env vars below are
// not set, `supabase` is `null` and the whole app falls back to the static seed
// dataset (`src/data/deadlines.ts`) + localStorage for personalization.
//
// To "make it real", set these in `.env.local` (see `.env.example`) and in your
// hosting provider (e.g. Vercel project settings):
//
//   VITE_SUPABASE_URL       = https://<project-ref>.supabase.co
//   VITE_SUPABASE_ANON_KEY  = <the project's anon/public key>
//
// The anon key is safe to ship in a client bundle — row-level security (RLS)
// policies in the migrations decide what it may read/write.
// ============================================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when both env vars are present, i.e. cloud mode is available. */
export const isSupabaseConfigured: boolean = Boolean(url && anonKey);

/**
 * The shared Supabase client, or `null` when the app is running in
 * zero-config (static seed + localStorage) mode.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
