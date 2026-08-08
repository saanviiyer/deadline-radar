import { useMemo, useState } from "react";
import type { Deadline } from "../data/deadlines";
import { parseISO } from "../lib/dates";
import { urgencyFromDays, URGENCY_STYLES } from "../lib/urgency";
import { daysUntil } from "../lib/dates";

type MilestoneKind = "abstract" | "paper" | "notification" | "event";

interface Milestone {
  dl: Deadline;
  kind: MilestoneKind;
  iso: string;
  date: Date;
}

const KIND_LABEL: Record<MilestoneKind, string> = {
  abstract: "Abstract",
  paper: "Paper",
  notification: "Notif.",
  event: "Event",
};

function collectMilestones(list: Deadline[]): Milestone[] {
  const out: Milestone[] = [];
  for (const dl of list) {
    const add = (kind: MilestoneKind, iso?: string) => {
      const date = parseISO(iso);
      if (date && iso) out.push({ dl, kind, iso, date });
    };
    add("abstract", dl.abstractDeadline);
    add("paper", dl.paperDeadline);
    add("notification", dl.notificationDate);
    add("event", dl.eventStart);
  }
  return out;
}

function ymKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
}

export function CalendarView({ list }: { list: Deadline[] }) {
  const milestones = useMemo(() => collectMilestones(list), [list]);

  // Determine the range of months to show — from this month (or earliest
  // milestone) through the latest milestone.
  const [offset, setOffset] = useState(0);

  const now = new Date();
  const baseMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));

  const monthMilestones = milestones.filter(
    (m) => ymKey(m.date) === ymKey(baseMonth),
  );

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(baseMonth);

  // Build the day grid for the month.
  const firstDay = new Date(Date.UTC(baseMonth.getUTCFullYear(), baseMonth.getUTCMonth(), 1));
  const startWeekday = firstDay.getUTCDay(); // 0 = Sun
  const daysInMonth = new Date(
    Date.UTC(baseMonth.getUTCFullYear(), baseMonth.getUTCMonth() + 1, 0),
  ).getUTCDate();

  const byDay = new Map<number, Milestone[]>();
  for (const m of monthMilestones) {
    const day = m.date.getUTCDate();
    const arr = byDay.get(day) ?? [];
    arr.push(m);
    byDay.set(day, arr);
  }

  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  const todayIsThisMonth =
    now.getUTCFullYear() === baseMonth.getUTCFullYear() &&
    now.getUTCMonth() === baseMonth.getUTCMonth();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setOffset((o) => o - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ← Prev
        </button>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {monthLabel}
          </h3>
          {offset !== 0 && (
            <button
              onClick={() => setOffset(0)}
              className="text-xs text-sky-600 hover:underline dark:text-sky-400"
            >
              Back to this month
            </button>
          )}
        </div>
        <button
          onClick={() => setOffset((o) => o + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-slate-200 text-center dark:bg-slate-800">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="bg-slate-50 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400"
          >
            {d}
          </div>
        ))}
        {cells.map((cell, idx) => {
          const items = cell.day ? byDay.get(cell.day) ?? [] : [];
          const isToday = todayIsThisMonth && cell.day === now.getUTCDate();
          return (
            <div
              key={idx}
              className={`min-h-[5.5rem] bg-white p-1.5 text-left align-top dark:bg-slate-900 ${
                cell.day === null ? "opacity-40" : ""
              }`}
            >
              {cell.day !== null && (
                <>
                  <div
                    className={`mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-sky-600 font-semibold text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {cell.day}
                  </div>
                  <div className="space-y-1">
                    {items.map((m, i) => {
                      const urgency = urgencyFromDays(daysUntil(m.iso));
                      return (
                        <a
                          key={i}
                          href={m.dl.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${m.dl.name} — ${KIND_LABEL[m.kind]} (${m.dl.confidence})`}
                          className={`block truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight ${URGENCY_STYLES[urgency].badge}`}
                        >
                          <span className="opacity-70">{KIND_LABEL[m.kind]}:</span>{" "}
                          {m.dl.name}
                        </a>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {monthMilestones.length === 0 && (
        <p className="mt-4 text-center text-sm text-slate-400">
          No milestones in {monthLabel} for the current filters.
        </p>
      )}
    </div>
  );
}
