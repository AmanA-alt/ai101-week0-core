import { describe, it, expect } from "vitest";
import {
  splitMix,
  calculateRevenue,
  formatMxn,
  PRICE,
  TIERS,
  PRESETS,
} from "@/lib/pricing";

/**
 * Week 3 — the two required pricing logic tests, plus the edge cases that
 * actually break revenue models. These run with no network and no DOM.
 */

describe("splitMix", () => {
  it("gives Taller the remainder of Solo and Negocio", () => {
    const m = splitMix(60, 32);
    expect(m.solo).toBeCloseTo(0.6);
    expect(m.negocio).toBeCloseTo(0.32);
    expect(m.taller).toBeCloseTo(0.08);
    expect(m.clamped).toBe(false);
  });

  it("always sums to exactly 1", () => {
    for (const [s, n] of [
      [0, 0],
      [100, 0],
      [0, 100],
      [33, 33],
      [17, 59],
      [50, 50],
    ]) {
      const m = splitMix(s, n);
      expect(m.solo + m.negocio + m.taller).toBeCloseTo(1, 10);
    }
  });

  it("clamps Negocio rather than letting the mix exceed 100%", () => {
    const m = splitMix(80, 50);
    expect(m.solo).toBeCloseTo(0.8);
    expect(m.negocio).toBeCloseTo(0.2);
    expect(m.taller).toBe(0);
    expect(m.clamped).toBe(true);
  });

  it("clamps out-of-range and non-finite inputs to zero", () => {
    expect(splitMix(-40, 20).solo).toBe(0);
    expect(splitMix(180, 0).solo).toBe(1);
    expect(splitMix(Number.NaN, 20).solo).toBe(0);
  });
});

describe("calculateRevenue", () => {
  it("computes the documented base case", () => {
    // 140 customers at 60/32/8:
    //   84   x 299  = 25,116
    //   44.8 x 699  = 31,315.20
    //   11.2 x 1499 = 16,788.80
    //               = 73,220
    const r = calculateRevenue(140, splitMix(60, 32));
    expect(r.mrr).toBeCloseTo(73220, 2);
    expect(r.arr).toBeCloseTo(878640, 2);
    expect(r.arpu).toBeCloseTo(523, 0);
  });

  it("matches a hand-computed single-tier case", () => {
    const r = calculateRevenue(10, splitMix(100, 0));
    expect(r.mrr).toBe(10 * PRICE.solo);
    expect(r.arr).toBe(10 * PRICE.solo * 12);
    expect(r.arpu).toBe(PRICE.solo);
  });

  it("scales linearly with customer count", () => {
    const mix = splitMix(60, 32);
    const a = calculateRevenue(100, mix);
    const b = calculateRevenue(200, mix);
    expect(b.mrr).toBeCloseTo(a.mrr * 2, 6);
    expect(b.arpu).toBeCloseTo(a.arpu, 6);
  });

  it("does not apply churn twice — the count is already month 12", () => {
    // Guard against someone later multiplying by (1 - churn) in here.
    // The customer count is post-churn by definition, so a 60/32 mix of
    // 140 customers must equal the raw weighted sum, nothing less.
    const mix = splitMix(60, 32);
    const raw =
      140 * 0.6 * PRICE.solo + 140 * 0.32 * PRICE.negocio + 140 * 0.08 * PRICE.taller;
    expect(calculateRevenue(140, mix).mrr).toBeCloseTo(raw, 6);
  });

  it("returns zeros for zero or invalid customers without dividing by zero", () => {
    const mix = splitMix(60, 32);
    for (const n of [0, -5, Number.NaN]) {
      const r = calculateRevenue(n, mix);
      expect(r.mrr).toBe(0);
      expect(r.arr).toBe(0);
      expect(r.arpu).toBe(0);
      expect(Number.isNaN(r.arpu)).toBe(false);
    }
  });

  it("never reports more revenue than every customer on the top tier", () => {
    const ceiling = 140 * PRICE.taller;
    for (const [s, n] of [
      [60, 32],
      [0, 0],
      [80, 50],
      [100, 0],
    ]) {
      expect(calculateRevenue(140, splitMix(s, n)).mrr).toBeLessThanOrEqual(ceiling);
    }
  });
});

describe("presets and tiers", () => {
  it("every preset produces a sane, non-clamped mix", () => {
    for (const p of PRESETS) {
      const m = splitMix(p.soloPct, p.negocioPct);
      expect(m.clamped).toBe(false);
      expect(calculateRevenue(p.customers, m).mrr).toBeGreaterThan(0);
    }
  });

  it("tier prices in TIERS match the PRICE map used by the model", () => {
    for (const t of TIERS) {
      expect(t.priceMxn).toBe(PRICE[t.id]);
    }
  });
});

describe("formatMxn", () => {
  it("rounds and groups", () => {
    expect(formatMxn(73220)).toBe("$73,220");
    expect(formatMxn(31315.2)).toBe("$31,315");
    expect(formatMxn(0)).toBe("$0");
  });
});
