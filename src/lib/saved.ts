// ============================================================================
// Per-user "saved / tracking" deadlines
// ============================================================================
//
// - Signed in (Supabase configured + a session): stars persist to the
//   `saved_deadlines` table, scoped to the user by RLS (auth.uid() = user_id).
// - Otherwise: stars persist to localStorage (the zero-config behavior), so the
//   feature works with no account and no backend.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const STORAGE_KEY = "deadline-radar:saved";

function readLocal(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export interface SavedState {
  saved: Set<string>;
  isSaved: (deadlineId: string) => boolean;
  toggle: (deadlineId: string) => void;
  loading: boolean;
}

/**
 * @param user The signed-in user, or null. When null (or Supabase is not
 *             configured) saves go to localStorage.
 */
export function useSavedDeadlines(user: User | null): SavedState {
  const [saved, setSaved] = useState<Set<string>>(() => new Set(readLocal()));
  const [loading, setLoading] = useState<boolean>(false);

  const cloud = Boolean(supabase && user);

  // Load the initial set for the current mode.
  useEffect(() => {
    if (!cloud) {
      setSaved(new Set(readLocal()));
      return;
    }
    let active = true;
    setLoading(true);
    supabase!
      .from("saved_deadlines")
      .select("deadline_id")
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) {
          setSaved(new Set(data.map((r) => (r as { deadline_id: string }).deadline_id)));
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cloud, user?.id]);

  const toggle = useCallback(
    (deadlineId: string) => {
      const currentlySaved = saved.has(deadlineId);

      // Optimistic update.
      setSaved((prev) => {
        const next = new Set(prev);
        if (currentlySaved) next.delete(deadlineId);
        else next.add(deadlineId);
        if (!cloud) writeLocal([...next]);
        return next;
      });

      if (!cloud || !user) return;

      if (currentlySaved) {
        void supabase!
          .from("saved_deadlines")
          .delete()
          .eq("user_id", user.id)
          .eq("deadline_id", deadlineId);
      } else {
        void supabase!
          .from("saved_deadlines")
          .upsert(
            { user_id: user.id, deadline_id: deadlineId },
            { onConflict: "user_id,deadline_id" },
          );
      }
    },
    [saved, cloud, user],
  );

  const isSaved = useCallback((id: string) => saved.has(id), [saved]);

  return { saved, isSaved, toggle, loading };
}
