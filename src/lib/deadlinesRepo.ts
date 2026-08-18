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
  updated_at?: string | null;
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

export type DeadlineSource = "supabase" | "cache" | "seed";

export interface DeadlinesState {
  deadlines: Deadline[];
  loading: boolean;
  /** Where the currently-shown data came from. */
  source: DeadlineSource;
  /** Non-null if the Supabase fetch failed and we fell back to the seed. */
  error: string | null;
  /** When the live/cached cloud dataset was last successfully refreshed. */
  lastUpdated: string | null;
}

const CACHE_KEY = "deadline-radar:deadlines-cache:v1";

interface DeadlineCache {
  version: 1;
  savedAt: string;
  deadlines: Deadline[];
}

export function validateDeadlineData(list: Deadline[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const knownCategories = new Set([
    "ML", "NeuroAI", "CompBio", "CV", "NLP", "Neuroscience",
    "MedImaging", "Robotics", "Speech", "DataMining", "Workshop",
  ]);
  const validISO = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return false;
    return value.includes("T") || parsed.toISOString().slice(0, 10) === value;
  };
  for (const dl of list) {
    const id = typeof dl?.id === "string" ? dl.id : "";
    if (!id || ids.has(id)) errors.push(`Duplicate or missing id: ${id || "(empty)"}`);
    ids.add(id);
    if (typeof dl?.name !== "string" || !dl.name.trim() || typeof dl.fullName !== "string" || !dl.fullName.trim()) errors.push(`${id}: missing name`);
    if (!Array.isArray(dl?.categories) || dl.categories.some((category) => !knownCategories.has(category))) errors.push(`${id}: invalid categories`);
    if (!(["confirmed", "approximate", "tbd"] as unknown[]).includes(dl?.confidence)) errors.push(`${id}: invalid confidence`);
    try {
      const url = new URL(dl.website);
      if (url.protocol !== "https:") errors.push(`${id}: website must use HTTPS`);
    } catch {
      errors.push(`${id}: invalid website`);
    }
    const fields = [
      ["abstractDeadline", dl.abstractDeadline], ["paperDeadline", dl.paperDeadline],
      ["notificationDate", dl.notificationDate], ["eventStart", dl.eventStart],
      ["eventEnd", dl.eventEnd],
    ] as const;
    for (const [field, value] of fields) {
      if (value && !validISO(value)) errors.push(`${id}: invalid ${field}`);
    }
    if (dl.eventStart && dl.eventEnd && new Date(dl.eventEnd) < new Date(dl.eventStart)) {
      errors.push(`${id}: event ends before it starts`);
    }
    if (dl.abstractDeadline && dl.paperDeadline && new Date(dl.paperDeadline) < new Date(dl.abstractDeadline)) {
      errors.push(`${id}: paper deadline precedes abstract deadline`);
    }
  }
  return errors;
}

function readCache(): DeadlineCache | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "null") as DeadlineCache | null;
    if (parsed?.version !== 1 || !Array.isArray(parsed.deadlines) || validateDeadlineData(parsed.deadlines).length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(deadlines: Deadline[], savedAt: string): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version: 1, savedAt, deadlines } satisfies DeadlineCache));
  } catch {
    // Live data still works when storage is unavailable or full.
  }
}

/**
 * Load the deadline list. Uses the Supabase `deadlines` table when configured,
 * otherwise the static seed. On any Supabase error, falls back to the seed so
 * the board is never empty.
 */
export function useDeadlines(): DeadlinesState {
  const initialCache = supabase ? readCache() : null;
  const [state, setState] = useState<DeadlinesState>({
    deadlines: initialCache?.deadlines ?? (supabase ? [] : seedDeadlines),
    loading: Boolean(supabase),
    source: initialCache ? "cache" : "seed",
    error: null,
    lastUpdated: initialCache?.savedAt ?? null,
  });

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;

    const fallBack = (message: string) => {
      const cached = readCache();
      setState({
        deadlines: cached?.deadlines ?? seedDeadlines,
        loading: false,
        source: cached ? "cache" : "seed",
        error: message,
        lastUpdated: cached?.savedAt ?? null,
      });
    };

    void (async () => {
      try {
        const { data, error } = await client.from("deadlines").select("*");
        if (!active) return;
        const mapped = data ? (data as DeadlineRow[]).map(rowToDeadline) : [];
        const validationErrors = validateDeadlineData(mapped);
        if (error || mapped.length === 0 || validationErrors.length > 0) {
          fallBack(error?.message || validationErrors[0] || "The cloud dataset is empty");
          return;
        }
        const updateTimes = (data as DeadlineRow[])
          .map((row) => row.updated_at)
          .filter((value): value is string => Boolean(value))
          .sort();
        const refreshedAt = updateTimes[updateTimes.length - 1] || new Date().toISOString();
        writeCache(mapped, refreshedAt);
        setState({
          deadlines: mapped,
          loading: false,
          source: "supabase",
          error: null,
          lastUpdated: refreshedAt,
        });
      } catch (cause: unknown) {
        if (!active) return;
        fallBack(cause instanceof Error ? cause.message : "Could not refresh cloud data");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
