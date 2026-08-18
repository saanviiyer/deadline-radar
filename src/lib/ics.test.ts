import { describe, expect, it } from "vitest";
import type { Deadline } from "../data/deadlines";
import { buildICSForDeadline, googleCalendarUrl } from "./ics";

const deadline: Deadline = {
  id: "test-2026", name: "TestConf", fullName: "Test Conference", categories: ["ML"],
  abstractDeadline: "2026-09-24", eventStart: "2026-12-06", eventEnd: "2026-12-12",
  website: "https://example.test", timezone: "AoE", confidence: "confirmed",
};

describe("calendar export", () => {
  it("exports AoE deadlines at the correct UTC instant and full event range", () => {
    const ics = buildICSForDeadline(deadline, 3);
    expect(ics).toContain("DTSTART:20260925T115959Z");
    expect(ics).toContain("TRIGGER:-P3D");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261206");
    expect(ics).toContain("DTEND;VALUE=DATE:20261213");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("can disable alarms and produces an exact Google Calendar instant", () => {
    expect(buildICSForDeadline(deadline, 0)).not.toContain("BEGIN:VALARM");
    const url = new URL(googleCalendarUrl(deadline, "abstract")!);
    expect(url.searchParams.get("dates")).toBe("20260925T115959Z/20260925T125959Z");
  });
});
