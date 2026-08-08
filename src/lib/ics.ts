import type { Deadline } from "../data/deadlines";
import { hasTime, parseISO } from "./dates";

// ---------------------------------------------------------------------------
// Hand-rolled iCalendar (.ics) generation — RFC 5545.
// We emit one VEVENT per deadline/event field so the whole submission timeline
// lands on the calendar. Times are written in UTC; date-only fields use the
// all-day VALUE=DATE form.
// ---------------------------------------------------------------------------

const PRODID = "-//Deadline Radar//EN";

/** Escape text per RFC 5545 §3.3.11 (commas, semicolons, backslashes, newlines). */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** UTC timestamp form: 20260924T235900Z */
function toUTCStamp(d: Date): string {
  return (
    d.getUTCFullYear().toString().padStart(4, "0") +
    (d.getUTCMonth() + 1).toString().padStart(2, "0") +
    d.getUTCDate().toString().padStart(2, "0") +
    "T" +
    d.getUTCHours().toString().padStart(2, "0") +
    d.getUTCMinutes().toString().padStart(2, "0") +
    d.getUTCSeconds().toString().padStart(2, "0") +
    "Z"
  );
}

/** All-day date form: 20260924 */
function toDateStamp(d: Date): string {
  return (
    d.getUTCFullYear().toString().padStart(4, "0") +
    (d.getUTCMonth() + 1).toString().padStart(2, "0") +
    d.getUTCDate().toString().padStart(2, "0")
  );
}

/** Add one UTC day (for all-day DTEND, which is exclusive per RFC 5545). */
function addDays(d: Date, n: number): Date {
  const copy = new Date(d.getTime());
  copy.setUTCDate(copy.getUTCDate() + n);
  return copy;
}

/**
 * Fold lines longer than 75 octets per RFC 5545 §3.1. We fold on characters
 * (adequate for ASCII content) and prefix continuation lines with a space.
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let idx = 0;
  parts.push(line.slice(0, 75));
  idx = 75;
  while (idx < line.length) {
    parts.push(" " + line.slice(idx, idx + 74));
    idx += 74;
  }
  return parts.join("\r\n");
}

interface RawEvent {
  uid: string;
  summary: string;
  description: string;
  url: string;
  location?: string;
  /** ISO string for the date/datetime this event marks. */
  when: string;
}

/** Build the individual calendar events implied by a deadline record. */
function eventsForDeadline(dl: Deadline): RawEvent[] {
  const events: RawEvent[] = [];
  const url = dl.website;
  const location = dl.location;
  const caveat =
    dl.confidence === "confirmed"
      ? ""
      : `\n\n[${dl.confidence.toUpperCase()}] Verify this date against the official CFP before relying on it.`;

  const base = (kind: string, when: string, suffix: string): RawEvent => ({
    uid: `${dl.id}-${kind}@deadline-radar`,
    summary: `${dl.name} — ${suffix}`,
    description: `${dl.fullName}${dl.notes ? `\n\n${dl.notes}` : ""}${caveat}\n\n${url}`,
    url,
    location,
    when,
  });

  if (dl.abstractDeadline) {
    events.push(base("abstract", dl.abstractDeadline, "Abstract deadline"));
  }
  if (dl.paperDeadline) {
    events.push(base("paper", dl.paperDeadline, "Paper deadline"));
  }
  if (dl.notificationDate) {
    events.push(base("notification", dl.notificationDate, "Notifications"));
  }
  if (dl.eventStart) {
    events.push(base("event", dl.eventStart, "Conference"));
  }
  return events;
}

function renderEvent(ev: RawEvent, dtstamp: string): string[] {
  const lines: string[] = ["BEGIN:VEVENT", `UID:${ev.uid}`, `DTSTAMP:${dtstamp}`];
  const d = parseISO(ev.when);
  if (!d) return [];

  if (hasTime(ev.when)) {
    lines.push(`DTSTART:${toUTCStamp(d)}`);
    // 1-hour block for timed deadlines (zero-length events are invalid)
    const end = new Date(d.getTime() + 60 * 60 * 1000);
    lines.push(`DTEND:${toUTCStamp(end)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${toDateStamp(d)}`);
    lines.push(`DTEND;VALUE=DATE:${toDateStamp(addDays(d, 1))}`);
  }

  lines.push(`SUMMARY:${escapeText(ev.summary)}`);
  lines.push(`DESCRIPTION:${escapeText(ev.description)}`);
  if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`);
  lines.push(`URL:${escapeText(ev.url)}`);
  // Reminder 7 days before
  lines.push(
    "BEGIN:VALARM",
    "TRIGGER:-P7D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(ev.summary)}`,
    "END:VALARM",
  );
  lines.push("END:VEVENT");
  return lines;
}

/** Wrap a list of VEVENT line-groups into a full VCALENDAR string (CRLF). */
function wrapCalendar(eventLineGroups: string[][]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const group of eventLineGroups) {
    lines.push(...group);
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n");
}

/** Full .ics text for a single venue (all its dated milestones). */
export function buildICSForDeadline(dl: Deadline): string {
  const dtstamp = toUTCStamp(new Date());
  const groups = eventsForDeadline(dl).map((ev) => renderEvent(ev, dtstamp));
  return wrapCalendar(groups);
}

/** Full .ics text covering many venues (bulk export of a filtered list). */
export function buildICSForDeadlines(list: Deadline[]): string {
  const dtstamp = toUTCStamp(new Date());
  const groups = list.flatMap((dl) =>
    eventsForDeadline(dl).map((ev) => renderEvent(ev, dtstamp)),
  );
  return wrapCalendar(groups);
}

/** Trigger a browser download of an .ics file. */
export function downloadICS(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Build a "Add to Google Calendar" render URL for one milestone of a venue.
 * https://calendar.google.com/calendar/render?action=TEMPLATE&...
 */
export function googleCalendarUrl(
  dl: Deadline,
  which: "abstract" | "paper" | "event",
): string | null {
  let iso: string | undefined;
  let label: string;
  if (which === "abstract") {
    iso = dl.abstractDeadline;
    label = "Abstract deadline";
  } else if (which === "paper") {
    iso = dl.paperDeadline;
    label = "Paper deadline";
  } else {
    iso = dl.eventStart;
    label = "Conference";
  }
  const d = parseISO(iso);
  if (!d || !iso) return null;

  let dates: string;
  if (hasTime(iso)) {
    const end = new Date(d.getTime() + 60 * 60 * 1000);
    dates = `${toUTCStamp(d)}/${toUTCStamp(end)}`;
  } else {
    const endDate = which === "event" ? addDays(parseISO(dl.eventEnd) ?? d, 1) : addDays(d, 1);
    dates = `${toDateStamp(d)}/${toDateStamp(endDate)}`;
  }

  const caveat =
    dl.confidence === "confirmed"
      ? ""
      : ` [${dl.confidence.toUpperCase()} — verify against official CFP]`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${dl.name} — ${label}`,
    dates,
    details: `${dl.fullName}${caveat}\n\n${dl.website}`,
    location: dl.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
