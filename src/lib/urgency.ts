export type Urgency = "past" | "critical" | "soon" | "upcoming" | "distant" | "none";

/** Bucket a day-count into an urgency level for color coding. */
export function urgencyFromDays(days: number | null): Urgency {
  if (days === null) return "none";
  if (days < 0) return "past";
  if (days <= 7) return "critical";
  if (days <= 30) return "soon";
  if (days <= 90) return "upcoming";
  return "distant";
}

interface UrgencyStyle {
  /** Tailwind classes for a badge/pill. */
  badge: string;
  /** Tailwind classes for a left accent bar / dot. */
  accent: string;
  /** Short label. */
  label: string;
}

export const URGENCY_STYLES: Record<Urgency, UrgencyStyle> = {
  critical: {
    badge:
      "bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-1 ring-inset ring-rose-500/40",
    accent: "bg-rose-500",
    label: "≤ 7 days",
  },
  soon: {
    badge:
      "bg-amber-500/15 text-amber-600 dark:text-amber-300 ring-1 ring-inset ring-amber-500/40",
    accent: "bg-amber-500",
    label: "≤ 30 days",
  },
  upcoming: {
    badge:
      "bg-sky-500/15 text-sky-600 dark:text-sky-300 ring-1 ring-inset ring-sky-500/40",
    accent: "bg-sky-500",
    label: "≤ 90 days",
  },
  distant: {
    badge:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-1 ring-inset ring-emerald-500/40",
    accent: "bg-emerald-500",
    label: "90+ days",
  },
  past: {
    badge:
      "bg-slate-500/10 text-slate-500 dark:text-slate-400 ring-1 ring-inset ring-slate-500/30",
    accent: "bg-slate-400",
    label: "passed",
  },
  none: {
    badge:
      "bg-slate-500/10 text-slate-500 dark:text-slate-400 ring-1 ring-inset ring-slate-500/30",
    accent: "bg-slate-300",
    label: "no date",
  },
};
