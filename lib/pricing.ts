/**
 * Week 3 — pricing model.
 *
 * Every function here is pure: same inputs, same outputs, no network, no clock.
 * That is deliberate. The revenue arithmetic is the one part of this feature a
 * reviewer cannot verify by looking at the screen, so it has to be unit-testable
 * on its own. `tests/pricing.test.ts` covers it.
 *
 * Prices are derived from the Week 2 competitor research, not invented.
 * See ASSUMPTIONS below for where each number comes from.
 */

export type TierId = "solo" | "negocio" | "taller";

export type Tier = {
  id: TierId;
  name: string;
  priceMxn: number;
  segment: string;
  lead?: boolean;
  includes: string[];
};

export const TIERS: Tier[] = [
  {
    id: "solo",
    name: "Solo",
    priceMxn: 299,
    segment: "One-person reseller",
    includes: [
      "One WhatsApp number",
      "300 conversations a month",
      "Up to 100 catalog items",
      "Human confirms every order",
    ],
  },
  {
    id: "negocio",
    name: "Negocio",
    priceMxn: 699,
    segment: "Small boutique",
    lead: true,
    includes: [
      "Two numbers, shared inbox",
      "2,000 conversations a month",
      "Unlimited catalog",
      "Apartado tracking",
    ],
  },
  {
    id: "taller",
    name: "Taller",
    priceMxn: 1499,
    segment: "Small boutique",
    includes: [
      "Five numbers",
      "Unlimited conversations",
      "Priority support",
      "Monthly sales report",
    ],
  },
];

export const PRICE: Record<TierId, number> = {
  solo: 299,
  negocio: 699,
  taller: 1499,
};

export type Mix = {
  solo: number;
  negocio: number;
  taller: number;
  /** True when the requested solo + negocio shares exceeded 100 and were clamped. */
  clamped: boolean;
};

/**
 * Turn two percentage inputs into a three-way split that always sums to 1.
 *
 * The UI only exposes sliders for Solo and Negocio; Taller takes the remainder.
 * If the two sliders are pushed past 100 between them, Negocio is cut back and
 * Taller goes to zero rather than letting the mix sum above 1 and inflating the
 * revenue figure. The `clamped` flag lets the page say so instead of silently
 * showing a different number than the sliders imply.
 */
export function splitMix(soloPct: number, negocioPct: number): Mix {
  const solo = clampPct(soloPct);
  const requested = clampPct(negocioPct);
  const clamped = solo + requested > 100;
  const negocio = clamped ? 100 - solo : requested;
  const taller = Math.max(0, 100 - solo - negocio);

  return {
    solo: solo / 100,
    negocio: negocio / 100,
    taller: taller / 100,
    clamped,
  };
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export type Revenue = {
  /** Monthly recurring revenue, MXN. */
  mrr: number;
  /** Annual run rate — MRR × 12, not a churn-adjusted forecast. */
  arr: number;
  /** Average revenue per customer per month, MXN. */
  arpu: number;
};

/**
 * Monthly recurring revenue for a customer count spread across the three tiers.
 *
 * Churn is deliberately NOT applied here. The customer count the page asks for
 * is already "customers at month 12" — a number that survives churn by
 * definition. Multiplying by (1 − churn) as well would subtract it twice, which
 * is the most common way a simple SaaS model goes wrong. Churn is recorded with
 * a saved scenario because it changes what the count means, not the arithmetic.
 */
export function calculateRevenue(customers: number, mix: Mix): Revenue {
  const n = Number.isFinite(customers) && customers > 0 ? customers : 0;

  const mrr =
    n * mix.solo * PRICE.solo +
    n * mix.negocio * PRICE.negocio +
    n * mix.taller * PRICE.taller;

  return {
    mrr,
    arr: mrr * 12,
    arpu: n > 0 ? mrr / n : 0,
  };
}

export type Preset = {
  id: string;
  label: string;
  customers: number;
  soloPct: number;
  negocioPct: number;
  churnPct: number;
};

export const PRESETS: Preset[] = [
  { id: "cons", label: "Conservative", customers: 60, soloPct: 75, negocioPct: 20, churnPct: 7 },
  { id: "base", label: "Base", customers: 140, soloPct: 60, negocioPct: 32, churnPct: 4 },
  { id: "opt", label: "Optimistic", customers: 300, soloPct: 50, negocioPct: 35, churnPct: 3 },
];

export const ASSUMPTIONS: { label: string; value: string; source: string }[] = [
  {
    label: "Solo price",
    value: "$299",
    source: "Under Kommo's ~MXN 260 per user once a second seat exists",
  },
  {
    label: "Negocio price",
    value: "$699",
    source: "Half of Leadsales at ~MXN 1,450 for three seats",
  },
  {
    label: "Taller price",
    value: "$1,499",
    source: "Parity with Leadsales, with apartado and reporting added",
  },
  {
    label: "Monthly churn",
    value: "4.0%",
    source: "A guess. No data until there are paying users",
  },
  {
    label: "Tier mix",
    value: "60 / 32 / 8",
    source: "Weighted to Solo, the segment competitors price out",
  },
];

const pesos = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Format a MXN amount for display: rounded, grouped, with a leading $. */
export function formatMxn(value: number): string {
  return "$" + pesos.format(Math.round(value));
}
