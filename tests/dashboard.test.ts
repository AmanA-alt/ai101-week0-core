import { describe, expect, it } from "vitest";
import { maskLabel, summarise, tallyAb, testingSummary, TABLES } from "@/lib/dashboard";

describe("maskLabel", () => {
  it("never returns the original label", () => {
    for (const s of ["Marisol Pérez", "Ana", "J", "Web demo customer"]) {
      expect(maskLabel(s)).not.toBe(s);
      if (s.length > 2) expect(maskLabel(s)).not.toContain(s.slice(1));
    }
  });
  it("keeps only the first letter", () => {
    expect(maskLabel("marisol")).toMatch(/^M\*+$/);
  });
  it("handles empty and missing labels", () => {
    expect(maskLabel("")).toBe("Anonymous");
    expect(maskLabel(null)).toBe("Anonymous");
    expect(maskLabel("   ")).toBe("Anonymous");
  });
});

describe("tallyAb", () => {
  it("groups by experiment and variant and computes the rate", () => {
    const rows = [
      { experiment: "headline", variant: "A", event: "impression" },
      { experiment: "headline", variant: "A", event: "impression" },
      { experiment: "headline", variant: "A", event: "click" },
      { experiment: "headline", variant: "B", event: "impression" },
      { experiment: "cta", variant: "A", event: "click" },
    ];
    const t = tallyAb(rows);
    expect(t).toHaveLength(3);
    const ha = t.find((x) => x.experiment === "headline" && x.variant === "A")!;
    expect(ha).toMatchObject({ impressions: 2, clicks: 1, rate: 0.5 });
    const ca = t.find((x) => x.experiment === "cta")!;
    expect(ca.rate).toBeNull();
  });
});

describe("summarise", () => {
  it("returns one entry per table, in order, with null for unreadable tables", () => {
    const s = summarise({ orders: 3, user_tests: null });
    expect(s.map((c) => c.table)).toEqual([...TABLES]);
    expect(s[0].count).toBe(3);
    expect(s.find((c) => c.table === "user_tests")!.count).toBeNull();
    expect(s.find((c) => c.table === "ab_events")!.count).toBeNull();
  });
});

describe("testingSummary", () => {
  it("counts, never percentages", () => {
    const s = testingSummary([
      { completed_tasks: 4, would_use: "yes" },
      { completed_tasks: 3, would_use: "maybe" },
      { completed_tasks: 4, would_use: "no" },
    ]);
    expect(s).toEqual({ testers: 3, finishedAll: 2, wouldUse: 1, maybe: 1 });
  });
});
