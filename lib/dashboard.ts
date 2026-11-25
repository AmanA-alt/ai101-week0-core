/**
 * Dashboard logic, as pure functions.
 *
 * No React and no database here, for the same reason as the pricing and A/B
 * modules: the part worth trusting is testable without a browser. The page
 * reads rows on the server and hands them to these functions; nothing private
 * ever reaches the browser.
 */

/** The tables the product writes to, in the order the dashboard shows them. */
export const TABLES = [
  "orders",
  "chat_sessions",
  "chat_feedback",
  "research_records",
  "pricing_scenarios",
  "marketing_assets",
  "ab_events",
  "user_tests",
] as const;

export type TableName = (typeof TABLES)[number];

export const TABLE_LABEL: Record<TableName, string> = {
  orders: "Baskets from the agent",
  chat_sessions: "Guided chat sessions",
  chat_feedback: "Chat feedback",
  research_records: "Research notes",
  pricing_scenarios: "Pricing scenarios",
  marketing_assets: "Saved marketing assets",
  ab_events: "A/B events",
  user_tests: "External user tests",
};

/**
 * First letter, then asterisks. Never returns the original, even for a one
 * letter label, because the site has no login and anybody can open the page.
 */
export function maskLabel(label: string | null | undefined): string {
  const s = (label ?? "").trim();
  if (!s) return "Anonymous";
  const first = s[0].toUpperCase();
  return `${first}${"*".repeat(Math.max(3, Math.min(s.length - 1, 8)))}`;
}

export type AbRow = { experiment: string; variant: string; event: string };
export type AbTally = {
  experiment: string;
  variant: string;
  impressions: number;
  clicks: number;
  rate: number | null;
};

/** Group A/B events by experiment and variant. Rate is null when nobody saw it. */
export function tallyAb(rows: AbRow[]): AbTally[] {
  const map = new Map<string, AbTally>();
  for (const r of rows) {
    const key = `${r.experiment}\u0000${r.variant}`;
    const t = map.get(key) ?? { experiment: r.experiment, variant: r.variant, impressions: 0, clicks: 0, rate: null };
    if (r.event === "impression") t.impressions += 1;
    else if (r.event === "click") t.clicks += 1;
    map.set(key, t);
  }
  return [...map.values()]
    .map((t) => ({ ...t, rate: t.impressions > 0 ? t.clicks / t.impressions : null }))
    .sort((a, b) => a.experiment.localeCompare(b.experiment) || a.variant.localeCompare(b.variant));
}

export type Count = { table: TableName; label: string; count: number | null };

/**
 * One count per table, in display order. A table that could not be read
 * (for example, created in the schema file but not yet in the database)
 * shows null rather than a misleading zero.
 */
export function summarise(counts: Partial<Record<TableName, number | null>>): Count[] {
  return TABLES.map((table) => ({
    table,
    label: TABLE_LABEL[table],
    count: counts[table] ?? null,
  }));
}

export type UserTestRow = { completed_tasks: number; would_use: string | null };

/** What the five sessions add up to, stated as counts, never as percentages. */
export function testingSummary(rows: UserTestRow[]) {
  return {
    testers: rows.length,
    finishedAll: rows.filter((r) => r.completed_tasks >= 4).length,
    wouldUse: rows.filter((r) => r.would_use === "yes").length,
    maybe: rows.filter((r) => r.would_use === "maybe").length,
  };
}
