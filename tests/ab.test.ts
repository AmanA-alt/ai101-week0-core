import { describe, it, expect } from "vitest";
import {
  assignVariant,
  bucket,
  fnv1a,
  isKnownVariant,
  tallyEvents,
  canCallWinner,
  EXPERIMENTS,
  EXPERIMENT_IDS,
  type ExperimentId,
} from "@/lib/ab";

/**
 * A/B assignment logic. No network, no DOM — the point of keeping assignment
 * in pure functions is that this file can run anywhere.
 */

const ids = (n: number) => Array.from({ length: n }, (_, i) => `visitor-${i}`);

describe("fnv1a", () => {
  it("is deterministic", () => {
    expect(fnv1a("respondo")).toBe(fnv1a("respondo"));
  });

  it("stays inside 32 unsigned bits", () => {
    for (const s of ["", "a", "respondo", "x".repeat(500)]) {
      const h = fnv1a(s);
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(0xffffffff);
    }
  });

  it("separates inputs that differ by one character", () => {
    expect(fnv1a("visitor-1")).not.toBe(fnv1a("visitor-2"));
  });
});

describe("bucket", () => {
  it("stays in range at both ends of the hash space", () => {
    expect(bucket(0, 2)).toBe(0);
    expect(bucket(0xffffffff, 2)).toBe(1);
    expect(bucket(0xffffffff, 3)).toBe(2);
  });

  it("does not read the low bit, which FNV-1a barely varies", () => {
    // Regression guard. `hash % 2` reduces to the XOR of the low bits of the
    // input characters, which collides across unrelated strings; "headline"
    // and "cta" share it. If anyone swaps bucket() back to a modulo, the
    // independence test below starts failing and this says why.
    const lowBit = (s: string) => fnv1a(s) & 1;
    expect(lowBit("headline:visitor-1")).toBe(lowBit("cta:visitor-1"));
  });
});

describe("assignVariant", () => {
  it("gives the same visitor the same variant every time", () => {
    const first = assignVariant("visitor-42", "headline");
    for (let i = 0; i < 50; i++) {
      expect(assignVariant("visitor-42", "headline")).toBe(first);
    }
  });

  it("only ever returns a variant the experiment defines", () => {
    for (const experimentId of EXPERIMENT_IDS) {
      for (const id of ids(300)) {
        const v = assignVariant(id, experimentId);
        expect(EXPERIMENTS[experimentId].variants).toContain(v);
      }
    }
  });

  it("splits roughly evenly across ten thousand visitors", () => {
    for (const experimentId of EXPERIMENT_IDS) {
      const seen: Record<string, number> = {};
      for (const id of ids(10000)) {
        const v = assignVariant(id, experimentId);
        seen[v] = (seen[v] ?? 0) + 1;
      }
      // Two variants, so each should land near 5000. A 10% band is generous
      // enough not to flake and tight enough to catch a broken hash.
      for (const variant of EXPERIMENTS[experimentId].variants) {
        expect(seen[variant]).toBeGreaterThan(4500);
        expect(seen[variant]).toBeLessThan(5500);
      }
    }
  });

  it("buckets the two experiments independently", () => {
    // Without the experiment id folded into the hash, a visitor in variant A
    // of one test would always be in variant A of the other, and the two
    // experiments would secretly be one experiment.
    let agree = 0;
    const sample = ids(2000);
    for (const id of sample) {
      const h = assignVariant(id, "headline");
      const c = assignVariant(id, "cta");
      const hIndex = EXPERIMENTS.headline.variants.indexOf(h);
      const cIndex = EXPERIMENTS.cta.variants.indexOf(c);
      if (hIndex === cIndex) agree++;
    }
    const ratio = agree / sample.length;
    expect(ratio).toBeGreaterThan(0.4);
    expect(ratio).toBeLessThan(0.6);
  });

  it("throws on an unknown experiment instead of defaulting to the first variant", () => {
    expect(() => assignVariant("visitor-1", "nope" as ExperimentId)).toThrow();
  });

  it("throws on an empty visitor id", () => {
    expect(() => assignVariant("", "headline")).toThrow();
  });
});

describe("isKnownVariant", () => {
  it("accepts defined variants and rejects anything else", () => {
    expect(isKnownVariant("headline", "problem")).toBe(true);
    expect(isKnownVariant("headline", "outcome")).toBe(true);
    expect(isKnownVariant("headline", "made-up")).toBe(false);
    expect(isKnownVariant("nope" as ExperimentId, "problem")).toBe(false);
  });
});

describe("tallyEvents", () => {
  const rows = [
    { experiment: "headline", variant: "problem", event: "impression" },
    { experiment: "headline", variant: "problem", event: "impression" },
    { experiment: "headline", variant: "problem", event: "click" },
    { experiment: "headline", variant: "outcome", event: "impression" },
    { experiment: "cta", variant: "soft", event: "impression" },
    { experiment: "cta", variant: "soft", event: "click" },
  ];

  it("counts impressions and clicks per variant", () => {
    const counts = tallyEvents(rows, "headline");
    const problem = counts.find((c) => c.variant === "problem")!;
    expect(problem.impressions).toBe(2);
    expect(problem.clicks).toBe(1);
    expect(problem.rate).toBeCloseTo(0.5);
  });

  it("ignores rows belonging to another experiment", () => {
    const counts = tallyEvents(rows, "headline");
    const total = counts.reduce((n, c) => n + c.impressions + c.clicks, 0);
    expect(total).toBe(4);
  });

  it("returns a row for a variant with no events, not a missing entry", () => {
    const counts = tallyEvents([], "headline");
    expect(counts).toHaveLength(2);
    for (const c of counts) {
      expect(c.impressions).toBe(0);
      expect(c.rate).toBe(0);
    }
  });

  it("never divides by zero", () => {
    const counts = tallyEvents(
      [{ experiment: "headline", variant: "problem", event: "click" }],
      "headline"
    );
    const problem = counts.find((c) => c.variant === "problem")!;
    expect(Number.isNaN(problem.rate)).toBe(false);
    expect(problem.rate).toBe(0);
  });
});

describe("canCallWinner", () => {
  it("refuses to call a winner on a small sample", () => {
    expect(
      canCallWinner([
        { variant: "a", impressions: 12, clicks: 6, rate: 0.5 },
        { variant: "b", impressions: 11, clicks: 1, rate: 0.09 },
      ])
    ).toBe(false);
  });

  it("allows it once every variant clears the floor", () => {
    expect(
      canCallWinner([
        { variant: "a", impressions: 140, clicks: 20, rate: 0.14 },
        { variant: "b", impressions: 160, clicks: 10, rate: 0.06 },
      ])
    ).toBe(true);
  });
});
