import { useEffect, useState } from "react";
import { parseISO } from "../lib/dates";

interface Props {
  targetISO?: string;
  /** Compact single-line form for cards. */
  compact?: boolean;
}

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

function computeParts(target: Date, now: Date): Parts {
  let diff = target.getTime() - now.getTime();
  const past = diff < 0;
  diff = Math.abs(diff);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, past };
}

export function Countdown({ targetISO, compact = false }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), compact ? 60_000 : 1_000);
    return () => clearInterval(id);
  }, [compact]);

  const target = parseISO(targetISO);
  if (!target) {
    return <span className="text-slate-400">—</span>;
  }

  const p = computeParts(target, now);

  if (compact) {
    return (
      <span
        className={
          p.past
            ? "tabular-nums text-slate-400"
            : "tabular-nums font-medium text-slate-700 dark:text-slate-200"
        }
      >
        {p.past ? "passed " : ""}
        {p.days}d {p.hours}h {p.minutes}m
      </span>
    );
  }

  const cells: Array<[number, string]> = [
    [p.days, "days"],
    [p.hours, "hrs"],
    [p.minutes, "min"],
    [p.seconds, "sec"],
  ];

  return (
    <div className="flex items-center gap-2">
      {p.past && (
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          passed
        </span>
      )}
      {cells.map(([value, label]) => (
        <div
          key={label}
          className="flex min-w-[3.25rem] flex-col items-center rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800"
        >
          <span className="tabular-nums text-lg font-semibold text-slate-900 dark:text-white">
            {value.toString().padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
