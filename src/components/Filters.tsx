import type { Category } from "../data/deadlines";
import { CATEGORY_STYLES } from "./Badges";

export type SortKey = "next" | "name" | "paper";
export type WindowKey = "all" | "7" | "30" | "90" | "180" | "365";

export interface FilterState {
  search: string;
  categories: Category[];
  window: WindowKey;
  hidePast: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  categories: [],
  window: "all",
  hidePast: true,
  sort: "next",
};

const WINDOW_OPTIONS: Array<{ value: WindowKey; label: string }> = [
  { value: "all", label: "Any time" },
  { value: "7", label: "≤ 7 days" },
  { value: "30", label: "≤ 30 days" },
  { value: "90", label: "≤ 90 days" },
  { value: "180", label: "≤ 6 months" },
  { value: "365", label: "≤ 1 year" },
];

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "next", label: "Next deadline" },
  { value: "paper", label: "Paper deadline" },
  { value: "name", label: "Name (A–Z)" },
];

interface Props {
  filters: FilterState;
  allCategories: Category[];
  onChange: (next: FilterState) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}

export function Filters({
  filters,
  allCategories,
  onChange,
  onReset,
  resultCount,
  totalCount,
}: Props) {
  const toggleCategory = (c: Category) => {
    const has = filters.categories.includes(c);
    onChange({
      ...filters,
      categories: has
        ? filters.categories.filter((x) => x !== c)
        : [...filters.categories, c],
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            aria-label="Search conferences"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search venues (e.g. NeurIPS, MICCAI, CompBio)…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none ring-sky-500 placeholder:text-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <select
          aria-label="Deadline window"
          value={filters.window}
          onChange={(e) =>
            onChange({ ...filters, window: e.target.value as WindowKey })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          {WINDOW_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort deadlines"
          value={filters.sort}
          onChange={(e) =>
            onChange({ ...filters, sort: e.target.value as SortKey })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {allCategories.map((c) => {
          const active = filters.categories.includes(c);
          return (
            <button
              key={c}
              aria-pressed={active}
              aria-label={`${active ? "Remove" : "Add"} ${c} category filter`}
              onClick={() => toggleCategory(c)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                active
                  ? `${CATEGORY_STYLES[c]} ring-2 ring-inset ring-current`
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={filters.hidePast}
            onChange={(e) => onChange({ ...filters, hidePast: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          Hide passed deadlines
        </label>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>
            {resultCount} of {totalCount} venues
          </span>
          <button
            onClick={onReset}
            className="rounded-lg px-2 py-1 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-800"
          >
            Reset filters
          </button>
        </div>
      </div>
    </div>
  );
}
