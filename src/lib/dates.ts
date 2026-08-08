import type { Deadline } from "../data/deadlines";

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Parse an ISO date/datetime string into a Date, or null if empty/invalid. */
export function parseISO(value?: string): Date | null {
  if (!value) return null;
  // Date-only strings ("2026-09-24") are parsed as UTC midnight by JS, which is
  // what we want for all-day deadlines.
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** True if the string carries a time component (has a "T"). */
export function hasTime(value?: string): boolean {
  return !!value && value.includes("T");
}

/**
 * Whole days from now until `value`. Positive = future, negative = past.
 * Rounds toward the deadline so "today" reads as 0.
 */
export function daysUntil(value?: string, now: Date = new Date()): number | null {
  const d = parseISO(value);
  if (!d) return null;
  return Math.ceil((d.getTime() - now.getTime()) / MS_PER_DAY);
}

/** The single most relevant upcoming date for a venue (paper > abstract). */
export function primaryDeadlineISO(dl: Deadline): string | undefined {
  return dl.paperDeadline ?? dl.abstractDeadline;
}

/**
 * The next not-yet-passed deadline for sorting/countdown purposes. Considers
 * both abstract and paper deadlines and returns the soonest that is still in
 * the future; falls back to the latest past deadline if all have passed.
 */
export function nextRelevantDate(dl: Deadline, now: Date = new Date()): Date | null {
  const candidates = [dl.abstractDeadline, dl.paperDeadline]
    .map((v) => parseISO(v))
    .filter((d): d is Date => d !== null);
  if (candidates.length === 0) {
    // fall back to event start so far-future events still sort sensibly
    return parseISO(dl.eventStart);
  }
  const future = candidates.filter((d) => d.getTime() >= now.getTime());
  if (future.length > 0) {
    return future.reduce((a, b) => (a.getTime() < b.getTime() ? a : b));
  }
  // all passed — return the latest past deadline
  return candidates.reduce((a, b) => (a.getTime() > b.getTime() ? a : b));
}

const DATE_FMT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
};

const DATETIME_FMT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
};

/** Human-readable date, respecting whether a time was provided. */
export function formatDate(value?: string): string {
  const d = parseISO(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-US", hasTime(value) ? DATETIME_FMT : DATE_FMT).format(d);
}

/** e.g. "Dec 6 – 12, 2026" or "Dec 6, 2026". */
export function formatEventRange(startISO?: string, endISO?: string): string {
  const start = parseISO(startISO);
  if (!start) return "—";
  const end = parseISO(endISO);
  if (!end) return formatDate(startISO);
  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();
  if (sameMonth) {
    const month = new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "UTC",
    }).format(start);
    return `${month} ${start.getUTCDate()} – ${end.getUTCDate()}, ${start.getUTCFullYear()}`;
  }
  return `${formatDate(startISO)} – ${formatDate(endISO)}`;
}

/** Short relative label, e.g. "in 12 days", "today", "3 days ago". */
export function relativeLabel(value?: string, now: Date = new Date()): string {
  const days = daysUntil(value, now);
  if (days === null) return "";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}
