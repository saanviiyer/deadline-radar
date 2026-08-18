import { describe, expect, it } from "vitest";
import { deadlines } from "../data/deadlines";
import { validateDeadlineData } from "./deadlinesRepo";

describe("deadline dataset", () => {
  it("has unique ids, valid ordering, dates, and HTTPS sources", () => {
    expect(validateDeadlineData(deadlines)).toEqual([]);
  });

  it("reports malformed records", () => {
    const bad = { ...deadlines[0], website: "javascript:alert(1)", eventStart: "2027-02-02", eventEnd: "2027-01-01" };
    expect(validateDeadlineData([bad]).join(" ")).toMatch(/HTTPS|ends before/);
  });
});
