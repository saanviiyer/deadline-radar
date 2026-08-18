import { describe, expect, it } from "vitest";
import { deadlineInstant, daysUntil, nextRelevantDeadline, relativeLabel } from "./dates";

describe("deadline timezones", () => {
  it("treats date-only UTC deadlines as end-of-day", () => {
    expect(deadlineInstant("2026-09-24", "UTC")?.toISOString()).toBe("2026-09-24T23:59:59.999Z");
    expect(daysUntil("2026-09-24", new Date("2026-09-24T12:00:00Z"), "UTC")).toBe(0);
    expect(relativeLabel("2026-09-24", new Date("2026-09-24T12:00:00Z"), "UTC")).toBe("today");
  });

  it("converts 23:59 Anywhere on Earth to the following UTC day", () => {
    expect(deadlineInstant("2026-09-24", "AoE")?.toISOString()).toBe("2026-09-25T11:59:59.999Z");
  });

  it("returns the actual next milestone kind", () => {
    const next = nextRelevantDeadline({
      id: "x", name: "X", fullName: "X", categories: ["ML"], website: "https://x.test",
      confidence: "confirmed", abstractDeadline: "2026-09-20", paperDeadline: "2026-09-25", timezone: "AoE",
    }, new Date("2026-09-01T00:00:00Z"));
    expect(next?.kind).toBe("abstract");
  });
});
