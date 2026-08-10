// ============================================================================
// Auth hook — email magic-link (OTP) sign-in via Supabase
// ============================================================================
//
// In zero-config mode (no Supabase env) this hook reports a signed-out,
// non-configured state and the sign-in helpers are no-ops. The UI hides the
// auth controls in that case.
// ============================================================================

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";

export interface AuthState {
  /** Whether Supabase is configured (cloud mode available). */
  configured: boolean;
  /** True until the initial session lookup resolves. */
  loading: boolean;
  session: Session | null;
  user: User | null;
  /** Send a magic-link / OTP email. Returns an error message, or null on success. */
  signIn: (email: string) => Promise<string | null>;
  /** Sign the current user out. */
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string): Promise<string | null> => {
    if (!supabase) return "Sign-in is unavailable: Supabase is not configured.";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return error ? error.message : null;
  };

  const signOut = async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return {
    configured: isSupabaseConfigured,
    loading,
    session,
    user: session?.user ?? null,
    signIn,
    signOut,
  };
}
