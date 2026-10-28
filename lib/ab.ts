/**
 * A/B assignment.
 *
 * Pure functions — no React, no network, no database read. That is the whole
 * design decision of this week, and it buys three things:
 *
 *   1. The variant is known before first paint, so nobody sees the wrong
 *      headline flash and get replaced.
 *   2. A visitor stays on their variant forever without anything being stored
 *      server-side. Assignment is derived, not recorded.
 *   3. The layer is unit-testable with no DOM, no browser driver and no API
 *      key — the same reason lib/pricing.ts was written this way in Week 3.
 *
 * There is deliberately no Math.random() anywhere in this file. A random
 * assignment would reshuffle on every render and every reload, which would
 * make the experiment measure nothing at all.
 */

export type ExperimentId = "headline" | "cta";

export type Experiment = {
  id: ExperimentId;
  /** What the experiment is trying to learn. Shown on the results panel. */
  question: string;
  /** Which event counts as success. */
  metric: string;
  variants: readonly string[];
};

export const EXPERIMENTS: Record<ExperimentId, Experiment> = {
  headline: {
    id: "headline",
    question: "Does naming the problem beat naming the outcome?",
    metric: "CTA click rate",
    variants: ["problem", "outcome"],
  },
  cta: {
    id: "cta",
    question: "Does a low-commitment button beat a direct one?",
    metric: "CTA click rate",
    variants: ["soft", "direct"],
  },
};

export const EXPERIMENT_IDS = Object.keys(EXPERIMENTS) as ExperimentId[];

export type AbEvent = "impression" | "click";

/**
 * FNV-1a, 32-bit.
 *
 * Twelve lines and no dependency. Math.imul is what keeps the multiply inside
 * 32 bits — a plain `*` would silently lose precision past 2^53 and ruin the
 * distribution. Not a cryptographic hash and does not need to be: it decides
 * which headline someone sees.
 */
export function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Maps a 32-bit hash onto `count` buckets using the HIGH-order bits.
 *
 * Not `hash % count`, and the difference is not cosmetic. FNV-1a's final step
 * multiplies by an odd prime, which preserves the low bit, so the lowest bit
 * of the digest reduces to the XOR of the low bits of every input character —
 * independent of their order or position. Taking `% 2` therefore reads one
 * near-degenerate bit.
 *
 * This surfaced as a failing test: "headline" and "cta" happen to share that
 * parity, so every visitor was handed the same bucket index in both
 * experiments and the two tests were silently measuring one split. Scaling off
 * the top of the range avalanches properly and the buckets are independent.
 */
export function bucket(hash: number, count: number): number {
  if (count < 1) throw new Error("bucket needs at least one bucket.");
  return Math.floor((hash / 0x100000000) * count);
}

/**
 * Which variant this visitor gets for this experiment.
 *
 * The experiment id is folded into the hash input so the two experiments draw
 * on different digests, and `bucket()` then reads bits that actually vary.
 *
 * Throws on an unknown experiment rather than falling back to the first
 * variant: a typo should fail loudly at the call site, not quietly skew a
 * result nobody later questions.
 */
export function assignVariant(visitorId: string, experimentId: ExperimentId): string {
  const experiment = EXPERIMENTS[experimentId];
  if (!experiment) {
    throw new Error(`Unknown experiment: ${String(experimentId)}`);
  }
  if (!visitorId) {
    throw new Error("assignVariant needs a visitor id.");
  }
  const index = bucket(fnv1a(`${experimentId}:${visitorId}`), experiment.variants.length);
  return experiment.variants[index]!;
}

/** True when the variant string is one this experiment actually defines. */
export function isKnownVariant(experimentId: ExperimentId, variant: string): boolean {
  const experiment = EXPERIMENTS[experimentId];
  return Boolean(experiment) && experiment.variants.includes(variant);
}

/** A new random browser id. Not deterministic, so nothing asserts its value. */
export function newVisitorId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `v-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}

export type VariantCount = {
  variant: string;
  impressions: number;
  clicks: number;
  /** Clicks over impressions, 0 when there are no impressions yet. */
  rate: number;
};

/**
 * Rolls raw event rows into per-variant counts.
 *
 * Separate from the route handler and from the component so it can be tested
 * directly, and so the page and the API cannot disagree about what a rate is.
 */
export function tallyEvents(
  rows: { experiment: string; variant: string; event: string }[],
  experimentId: ExperimentId
): VariantCount[] {
  const experiment = EXPERIMENTS[experimentId];
  if (!experiment) throw new Error(`Unknown experiment: ${String(experimentId)}`);

  return experiment.variants.map((variant) => {
    let impressions = 0;
    let clicks = 0;
    for (const row of rows) {
      if (row.experiment !== experimentId || row.variant !== variant) continue;
      if (row.event === "impression") impressions++;
      else if (row.event === "click") clicks++;
    }
    return {
      variant,
      impressions,
      clicks,
      rate: impressions > 0 ? clicks / impressions : 0,
    };
  });
}

/**
 * How many impressions each variant would need for a difference this size to
 * be worth believing — a rough rule of thumb, not a significance test.
 *
 * The page deliberately does not compute a p-value. At this traffic the sample
 * is dozens, and a significance figure on dozens looks rigorous while meaning
 * nothing. This returns a floor so the reader can see how far off it is.
 */
export const MIN_IMPRESSIONS_TO_CALL = 100;

export function canCallWinner(counts: VariantCount[]): boolean {
  return counts.every((c) => c.impressions >= MIN_IMPRESSIONS_TO_CALL);
}
