// ============================================================================
// Per-user reminder preferences
// ============================================================================
//
// A small per-user setting: how many days before a deadline the user wants to
// be reminded. Persisted to the `reminder_prefs` table when signed in
// (RLS: auth.uid() = user_id), otherwise to localStorage.
//
// The value is also used as the VALARM lead time when exporting .ics for a
// signed-in user, so the preference has a concrete, visible effect.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const STORAGE_KEY = "deadline-radar:reminder-days";
export const DEFAULT_REMINDER_DAYS = 7;

function readLocal(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n >= 0 && n <= 365 ? n : DEFAULT_REMINDER_DAYS;
}

export interface ReminderPrefsState {
  reminderDays: number;
  setReminderDays: (days: number) => void;
  loading: boolean;
}

export function useReminderPrefs(user: User | null): ReminderPrefsState {
  const [reminderDays, setDays] = useState<number>(() => {
    try {
      return readLocal();
    } catch {
      return DEFAULT_REMINDER_DAYS;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  const cloud = Boolean(supabase && user);

  useEffect(() => {
    if (!cloud || !user) {
      try {
        setDays(readLocal());
      } catch {
        setDays(DEFAULT_REMINDER_DAYS);
      }
      return;
    }
    let active = true;
    setLoading(true);
    supabase!
      .from("reminder_prefs")
      .select("reminder_days")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const row = data as { reminder_days: number } | null;
        if (row && Number.isFinite(row.reminder_days)) setDays(row.reminder_days);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cloud, user?.id]);

  const setReminderDays = useCallback(
    (days: number) => {
      const safeDays = Math.min(365, Math.max(0, Math.round(days)));
      setDays(safeDays);
      if (cloud && user) {
        void supabase!
          .from("reminder_prefs")
          .upsert(
            { user_id: user.id, reminder_days: safeDays, updated_at: new Date().toISOString() },
            { onConflict: "user_id" },
          );
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, String(safeDays));
        } catch {
          /* ignore */
        }
      }
    },
    [cloud, user],
  );

  return { reminderDays, setReminderDays, loading };
}
