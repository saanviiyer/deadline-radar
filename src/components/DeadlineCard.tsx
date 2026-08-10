import type { Deadline } from "../data/deadlines";
import {
  daysUntil,
  formatDate,
  formatEventRange,
  nextRelevantDate,
  relativeLabel,
} from "../lib/dates";
import { urgencyFromDays, URGENCY_STYLES } from "../lib/urgency";
import {
  buildICSForDeadline,
  downloadICS,
  googleCalendarUrl,
} from "../lib/ics";
import { CategoryBadge, ConfidenceBadge } from "./Badges";
import { Countdown } from "./Countdown";

function Row({ label, value, extra }: { label: string; value: string; extra?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-800 dark:text-slate-100">
        {value}
        {extra && (
          <span className="ml-1 text-xs font-normal text-slate-400">({extra})</span>
        )}
      </span>
    </div>
  );
}

export function DeadlineCard({
  dl,
  saved,
  onToggleSave,
}: {
  dl: Deadline;
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  const next = nextRelevantDate(dl);
  const nextISO = next ? next.toISOString() : undefined;
  const days = daysUntil(nextISO);
  const urgency = urgencyFromDays(days);
  const style = URGENCY_STYLES[urgency];
  const gcalPaper = googleCalendarUrl(dl, dl.paperDeadline ? "paper" : "abstract");

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} />
      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                {dl.name}
              </h3>
              <ConfidenceBadge confidence={dl.confidence} />
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {dl.fullName}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onToggleSave && (
              <button
                onClick={onToggleSave}
                aria-pressed={saved}
                aria-label={saved ? "Remove from saved" : "Save venue"}
                title={saved ? "Remove from saved" : "Save venue"}
                className={`rounded-lg p-1.5 text-lg leading-none transition ${
                  saved
                    ? "text-amber-500 hover:text-amber-400"
                    : "text-slate-300 hover:text-amber-400 dark:text-slate-600"
                }`}
              >
                {saved ? "★" : "☆"}
              </button>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}
            >
              {days === null ? "no date" : relativeLabel(nextISO)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {dl.categories.map((c) => (
            <CategoryBadge key={c} category={c} />
          ))}
        </div>

        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          {dl.abstractDeadline && (
            <Row
              label="Abstract"
              value={formatDate(dl.abstractDeadline)}
              extra={relativeLabel(dl.abstractDeadline)}
            />
          )}
          {dl.paperDeadline && (
            <Row
              label="Paper"
              value={formatDate(dl.paperDeadline)}
              extra={relativeLabel(dl.paperDeadline)}
            />
          )}
          {dl.notificationDate && (
            <Row label="Notification" value={formatDate(dl.notificationDate)} />
          )}
          {dl.eventStart && (
            <Row label="Event" value={formatEventRange(dl.eventStart, dl.eventEnd)} />
          )}
          {dl.location && <Row label="Location" value={dl.location} />}
          {dl.timezone && <Row label="Timezone" value={dl.timezone} />}
        </div>

        {nextISO && (
          <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">
              Next deadline
            </p>
            <Countdown targetISO={nextISO} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() =>
              downloadICS(`${dl.id}.ics`, buildICSForDeadline(dl))
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <CalendarIcon /> Add to calendar (.ics)
          </button>
          {gcalPaper && (
            <a
              href={gcalPaper}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <GoogleIcon /> Google Calendar
            </a>
          )}
          <a
            href={dl.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-sky-600 transition hover:underline dark:text-sky-400"
          >
            Website ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
