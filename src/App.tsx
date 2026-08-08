import { useEffect, useMemo, useState } from "react";
import { deadlines, type Category } from "./data/deadlines";
import {
  daysUntil,
  nextRelevantDate,
  parseISO,
  primaryDeadlineISO,
} from "./lib/dates";
import { buildICSForDeadlines, downloadICS } from "./lib/ics";
import {
  DEFAULT_FILTERS,
  Filters,
  type FilterState,
} from "./components/Filters";
import { DeadlineCard } from "./components/DeadlineCard";
import { CalendarView } from "./components/CalendarView";
import { Countdown } from "./components/Countdown";

const ALL_CATEGORIES: Category[] = Array.from(
  new Set(deadlines.flatMap((d) => d.categories)),
).sort() as Category[];

type ViewMode = "board" | "calendar";

function matchesSearch(name: string, full: string, q: string): boolean {
  const hay = `${name} ${full}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => hay.includes(token));
}

export default function App() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [view, setView] = useState<ViewMode>("board");
  const [dark, setDark] = useState(true);

  // Apply dark class to <html>.
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  const filtered = useMemo(() => {
    const now = new Date();
    const windowDays =
      filters.window === "all" ? null : parseInt(filters.window, 10);

    const result = deadlines.filter((dl) => {
      // Search
      if (filters.search && !matchesSearch(dl.name, dl.fullName, filters.search)) {
        return false;
      }
      // Category (OR within selected categories)
      if (
        filters.categories.length > 0 &&
        !dl.categories.some((c) => filters.categories.includes(c))
      ) {
        return false;
      }

      const next = nextRelevantDate(dl, now);
      const nextDays = next ? daysUntil(next.toISOString(), now) : null;

      // Hide past: a venue is "past" if its next relevant deadline has passed
      // AND its event is over (or unknown).
      if (filters.hidePast) {
        const eventEnd = parseISO(dl.eventEnd) ?? parseISO(dl.eventStart);
        const eventOver = eventEnd ? eventEnd.getTime() < now.getTime() : true;
        const deadlinePassed = nextDays !== null && nextDays < 0;
        if (deadlinePassed && eventOver) return false;
      }

      // Window filter — based on next relevant deadline.
      if (windowDays !== null) {
        if (nextDays === null) return false;
        if (nextDays < 0 || nextDays > windowDays) return false;
      }

      return true;
    });

    // Sort
    const sorted = [...result];
    if (filters.sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "paper") {
      sorted.sort((a, b) => {
        const da = parseISO(a.paperDeadline)?.getTime() ?? Infinity;
        const db = parseISO(b.paperDeadline)?.getTime() ?? Infinity;
        return da - db;
      });
    } else {
      // next deadline — soonest future first, past last
      sorted.sort((a, b) => {
        const na = nextRelevantDate(a, now);
        const nb = nextRelevantDate(b, now);
        const da = na ? daysUntil(na.toISOString(), now) ?? Infinity : Infinity;
        const db = nb ? daysUntil(nb.toISOString(), now) ?? Infinity : Infinity;
        const aPast = da < 0;
        const bPast = db < 0;
        if (aPast && !bPast) return 1;
        if (!aPast && bPast) return -1;
        return da - db;
      });
    }
    return sorted;
  }, [filters]);

  // Upcoming deadlines for the hero countdown strip.
  const upcoming = useMemo(() => {
    const now = new Date();
    return deadlines
      .map((dl) => ({ dl, iso: nextRelevantDate(dl, now)?.toISOString() }))
      .filter(
        (x): x is { dl: (typeof deadlines)[number]; iso: string } =>
          !!x.iso && (daysUntil(x.iso, now) ?? -1) >= 0,
      )
      .sort(
        (a, b) =>
          (daysUntil(a.iso) ?? Infinity) - (daysUntil(b.iso) ?? Infinity),
      )
      .slice(0, 3);
  }, []);

  const handleBulkExport = () => {
    if (filtered.length === 0) return;
    downloadICS(
      `deadline-radar-${filtered.length}-venues.ics`,
      buildICSForDeadlines(filtered),
    );
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/radar.svg" alt="" className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Deadline Radar</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                ML · NeuroAI · Comp-Bio conference &amp; workshop deadlines,
                always in view.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkExport}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ⬇ Export {filtered.length} to .ics
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* Hero countdown strip */}
        {upcoming.length > 0 && (
          <section className="mb-6 grid gap-3 sm:grid-cols-3">
            {upcoming.map(({ dl, iso }, i) => (
              <div
                key={dl.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {i === 0 ? "Next up" : `#${i + 1}`}
                  </span>
                  <a
                    href={dl.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-sky-600 hover:underline dark:text-sky-400"
                  >
                    {dl.name}
                  </a>
                </div>
                <Countdown targetISO={iso} />
                <p className="mt-2 truncate text-xs text-slate-500 dark:text-slate-400">
                  {primaryDeadlineISO(dl) === dl.paperDeadline
                    ? "Paper deadline"
                    : "Abstract deadline"}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Data caveat */}
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <span className="mt-0.5">⚠️</span>
          <p>
            Dates are <strong>seed values</strong> for the 2026–2027 cycle. Many
            2027 CFPs weren&apos;t published yet — always verify against the
            official Call for Papers before relying on a date. Each venue is
            tagged{" "}
            <span className="font-semibold">confirmed / approx. / TBD</span> for
            trust level. Edit them in{" "}
            <code className="rounded bg-amber-500/20 px-1 py-0.5 text-xs">
              src/data/deadlines.ts
            </code>
            .
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <Filters
            filters={filters}
            allCategories={ALL_CATEGORIES}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            resultCount={filtered.length}
            totalCount={deadlines.length}
          />
        </div>

        {/* View toggle */}
        <div className="mb-4 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:w-fit">
          {(["board", "calendar"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium capitalize transition sm:flex-none ${
                view === v
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              {v === "board" ? "📋 Board" : "🗓 Calendar"}
            </button>
          ))}
        </div>

        {/* Content */}
        {view === "board" ? (
          filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((dl) => (
                <DeadlineCard key={dl.id} dl={dl} />
              ))}
            </div>
          )
        ) : (
          <CalendarView list={filtered} />
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400 dark:border-slate-800">
          <p>
            Deadline Radar · seed data in{" "}
            <code>src/data/deadlines.ts</code> · verify all dates against
            official CFPs.
          </p>
        </footer>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
        No venues match your filters
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Try widening the deadline window or clearing category filters.
      </p>
    </div>
  );
}
