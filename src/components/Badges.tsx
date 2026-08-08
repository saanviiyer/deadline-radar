import type { Category, Confidence } from "../data/deadlines";

export const CATEGORY_STYLES: Record<Category, string> = {
  ML: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
  NeuroAI: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300",
  CompBio: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  CV: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300",
  NLP: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  Neuroscience: "bg-pink-500/15 text-pink-600 dark:text-pink-300",
  MedImaging: "bg-teal-500/15 text-teal-600 dark:text-teal-300",
  Robotics: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
  Speech: "bg-lime-500/15 text-lime-600 dark:text-lime-300",
  DataMining: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  Workshop: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}
    >
      {category}
    </span>
  );
}

const CONFIDENCE_STYLES: Record<Confidence, { cls: string; label: string; title: string }> = {
  confirmed: {
    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    label: "confirmed",
    title: "Matches an official CFP / announced schedule.",
  },
  approximate: {
    cls: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    label: "approx.",
    title: "Estimated from the venue's typical month — verify against the official CFP.",
  },
  tbd: {
    cls: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
    label: "TBD",
    title: "Cycle dates not yet announced — placeholder from a prior edition.",
  },
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const s = CONFIDENCE_STYLES[confidence];
  return (
    <span
      title={s.title}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}
    >
      <svg viewBox="0 0 8 8" className="h-1.5 w-1.5" fill="currentColor">
        <circle cx="4" cy="4" r="4" />
      </svg>
      {s.label}
    </span>
  );
}
