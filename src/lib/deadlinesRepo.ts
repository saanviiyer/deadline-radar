// ============================================================================
// Deadlines data layer
// ============================================================================
//
// This is the core of the "make it real" upgrade. The venue/deadline list is
// CENTRAL, UPDATABLE DATA:
//
//   - When Supabase is configured, the list is loaded from the public
//     `deadlines` table (anyone can read it — see the RLS policy in
//     supabase/migrations/0001_init.sql). Keeping deadlines fresh then means
//     updating rows in that table, not editing the bundle.
//   - When Supabase is NOT configured, we fall back to the static seed in
//     `src/data/deadlines.ts`, so the app still builds and runs with zero setup.
//
// The `deadlines` table mirrors the `Deadline` interface, using snake_case
// columns; `rowToDeadline` maps a DB row back to the app's camelCase shape.
// ============================================================================

import { useEffect, useState } from "react";
import {
  deadlines as seedDeadlines,
  type Category,
  type Confidence,
  type Deadline,
} from "../data/deadlines";
import { supabase } from "./supabase";

/** A row of the `deadlines` table as returned by Supabase (snake_case). */
interface DeadlineRow {
  id: string;
  name: string;
  full_name: string;
  categories: Category[] | null;
  abstract_deadline: string | null;
  paper_deadline: string | null;
  notification_date: string | null;
  event_start: string | null;
  event_end: string | null;
  location: string | null;
  website: string;
  timezone: string | null;
  confidence: Confidence;
  notes: string | null;
}

function rowToDeadline(r: DeadlineRow): Deadline {
  return {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    categories: r.categories ?? [],
    abstractDeadline: r.abstract_deadline ?? undefined,
    paperDeadline: r.paper_deadline ?? undefined,
    notificationDate: r.notification_date ?? undefined,
    eventStart: r.event_start ?? undefined,
    eventEnd: r.event_end ?? undefined,
    location: r.location ?? undefined,
    website: r.website,
    timezone: r.timezone ?? undefined,
    confidence: r.confidence,
    notes: r.notes ?? undefined,
  };
}

export type DeadlineSource = "supabase" | "seed";

export interface DeadlinesState {
  deadlines: Deadline[];
  loading: boolean;
  /** Where the currently-shown data came from. */
  source: DeadlineSource;
  /** Non-null if the Supabase fetch failed and we fell back to the seed. */
  error: string | null;
}

/**
 * Load the deadline list. Uses the Supabase `deadlines` table when configured,
 * otherwise the static seed. On any Supabase error, falls back to the seed so
 * the board is never empty.
 */
export function useDeadlines(): DeadlinesState {
  const [state, setState] = useState<DeadlinesState>({
    deadlines: supabase ? [] : seedDeadlines,
    loading: Boolean(supabase),
    source: "seed",
    error: null,
  });

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase
      .from("deadlines")
      .select("*")
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data || data.length === 0) {
          setState({
            deadlines: seedDeadlines,
            loading: false,
            source: "seed",
            error: error ? error.message : null,
          });
          return;
        }
        setState({
          deadlines: (data as DeadlineRow[]).map(rowToDeadline),
          loading: false,
          source: "supabase",
          error: null,
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
