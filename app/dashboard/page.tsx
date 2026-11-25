import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import {
  maskLabel,
  summarise,
  tallyAb,
  testingSummary,
  TABLES,
  type AbRow,
  type TableName,
} from "@/lib/dashboard";

export const metadata: Metadata = {
  title: "Dashboard — Bastilla",
  description: "Every record the product stores, read from the database at request time.",
};

/**
 * The operator's screen.
 *
 * A server component on purpose. The site has no login, so the data must never
 * travel through a route the browser could call. Each query selects only the
 * columns shown here; transcripts, visitor ids and free-text notes never leave
 * the server. A reseller's inventory never appears, because it is never stored
 * on the server at all.
 *
 * No approve button, also on purpose: with no login, anybody could press it.
 */

type Order = { id: string; created_at: string; status: string; item_count: number; subtotal_mxn: number; customer_label: string | null };
type Session = { id: string; created_at: string; lang: string; turns: number; guardrail_hits: number; total_mxn: number; status: string };
type Research = { id: string; created_at: string; source: string; category: string; note: string };
type Scenario = { id: string; created_at: string; name: string; preset: string; customers: number; mrr_mxn: number };
type Asset = { id: string; created_at: string; kind: string; label: string; channel: string | null; lang: string };
type UserTest = { id: string; tester_code: string; segment: string; completed_tasks: number; would_use: string | null; quote: string | null; issues: string | null };

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "America/Mexico_City" });
const mxn = (n: number) => `$${Math.round(Number(n)).toLocaleString("en-US")}`;

async function load() {
  let db: ReturnType<typeof supabaseServer> | null = null;
  try {
    db = supabaseServer();
  } catch {
    db = null;
  }

  const counts: Partial<Record<TableName, number | null>> = {};
  if (db) {
    await Promise.all(
      TABLES.map(async (t) => {
        const { count, error } = await db!.from(t).select("id", { count: "exact", head: true });
        counts[t] = error ? null : count ?? 0;
      })
    );
  }

  async function rows<T>(table: string, cols: string, limit = 8): Promise<T[]> {
    if (!db) return [];
    const { data, error } = await db.from(table).select(cols).order("created_at", { ascending: false }).limit(limit);
    return error ? [] : ((data ?? []) as T[]);
  }

  const [orders, sessions, research, scenarios, assets, tests, ab] = await Promise.all([
    rows<Order>("orders", "id, created_at, status, item_count, subtotal_mxn, customer_label"),
    rows<Session>("chat_sessions", "id, created_at, lang, turns, guardrail_hits, total_mxn, status"),
    rows<Research>("research_records", "id, created_at, source, category, note", 6),
    rows<Scenario>("pricing_scenarios", "id, created_at, name, preset, customers, mrr_mxn", 6),
    rows<Asset>("marketing_assets", "id, created_at, kind, label, channel, lang", 6),
    rows<UserTest>("user_tests", "id, tester_code, segment, completed_tasks, would_use, quote, issues", 10),
    rows<AbRow>("ab_events", "experiment, variant, event", 5000),
  ]);

  return { connected: Boolean(db), counts, orders, sessions, research, scenarios, assets, tests, ab: tallyAb(ab) };
}

export default async function DashboardPage() {
  await connection();
  const d = await load();
  const summary = summarise(d.counts);
  const ts = testingSummary(d.tests);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <p className="mono m-0 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Operator view</p>
          <h1 className="display m-0 mt-2 text-[clamp(2rem,5vw,3rem)] text-[var(--indigo)]">Dashboard</h1>
          <p className="m-0 mt-3 max-w-[60ch] text-sm leading-relaxed text-[var(--muted)]">
            Every record the product stores, read from the database when this page loads. Names are
            masked and conversations are never shown, because this page has no login.
          </p>
        </div>
        <p className="mono m-0 text-xs text-[var(--muted)]">
          {summary.some((c) => c.count !== null) ? "Live from Supabase" : "Database unreachable from here"}
        </p>
      </header>

      <section aria-labelledby="counts" className="py-8">
        <h2 id="counts" className="sr-only">Records per table</h2>
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4">
          {summary.map((c) => (
            <li key={c.table} className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="num m-0 text-[1.9rem] font-medium leading-none tracking-[-0.03em]">
                {c.count === null ? "—" : c.count.toLocaleString("en-US")}
              </p>
              <p className="m-0 mt-2 text-[13px] text-[var(--muted)]">{c.label}</p>
            </li>
          ))}
        </ul>
        {summary.some((c) => c.count === null) && d.connected && (
          <p className="mono m-0 mt-3 text-[11px] text-[var(--muted)]">
            A dash means that table could not be read, usually because it has not been created yet.
          </p>
        )}
      </section>

      <Block title="Waiting for review" note="Baskets the agents assembled. Nothing here is an order until a person confirms it.">
        {d.orders.length === 0 && d.sessions.length === 0 ? (
          <Empty>No baskets yet. Build one in the agent or the guided chat.</Empty>
        ) : (
          <Table head={["When", "Source", "Customer", "Items", "Total", "Status"]}>
            {d.orders.map((o) => (
              <tr key={o.id}>
                <Td>{fmtDate(o.created_at)}</Td>
                <Td>Agent</Td>
                <Td>{maskLabel(o.customer_label)}</Td>
                <Td num>{o.item_count}</Td>
                <Td num>{mxn(o.subtotal_mxn)}</Td>
                <Td><Status s={o.status} /></Td>
              </tr>
            ))}
            {d.sessions.map((s) => (
              <tr key={s.id}>
                <Td>{fmtDate(s.created_at)}</Td>
                <Td>Guided chat ({s.lang.toUpperCase()})</Td>
                <Td>Anonymous</Td>
                <Td num>{s.turns} turns</Td>
                <Td num>{mxn(s.total_mxn)}</Td>
                <Td><Status s={s.status} /></Td>
              </tr>
            ))}
          </Table>
        )}
      </Block>

      <Block title="External user tests" note="One row per tester, entered after each session. Tester codes only, consent required.">
        {d.tests.length === 0 ? (
          <Empty>No sessions recorded yet.</Empty>
        ) : (
          <>
            <p className="m-0 mb-3 text-sm">
              {ts.testers} testers · {ts.finishedAll} finished all four tasks · {ts.wouldUse} would use it ·{" "}
              {ts.maybe} maybe
            </p>
            <Table head={["Tester", "Segment", "Tasks", "Would use", "In their words"]}>
              {d.tests.map((t) => (
                <tr key={t.id}>
                  <Td>{t.tester_code}</Td>
                  <Td>{t.segment}</Td>
                  <Td num>{t.completed_tasks} / 4</Td>
                  <Td>{t.would_use ?? "—"}</Td>
                  <Td>{t.quote ? `“${t.quote}”` : "—"}</Td>
                </tr>
              ))}
            </Table>
          </>
        )}
      </Block>

      <Block title="A/B experiments" note="Raw counts. The sample is too small to call a winner.">
        {d.ab.length === 0 ? (
          <Empty>No events yet.</Empty>
        ) : (
          <Table head={["Experiment", "Variant", "Impressions", "Clicks", "Rate"]}>
            {d.ab.map((a) => (
              <tr key={`${a.experiment}-${a.variant}`}>
                <Td>{a.experiment}</Td>
                <Td>{a.variant}</Td>
                <Td num>{a.impressions}</Td>
                <Td num>{a.clicks}</Td>
                <Td num>{a.rate === null ? "—" : `${(a.rate * 100).toFixed(1)}%`}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Block>

      <div className="grid gap-x-8 md:grid-cols-2">
        <Block title="Pricing scenarios" note={<Link href="/pricing" className="underline underline-offset-4">From the simulator</Link>}>
          {d.scenarios.length === 0 ? (
            <Empty>None saved.</Empty>
          ) : (
            <List items={d.scenarios.map((s) => [s.name, `${s.customers} customers · ${mxn(s.mrr_mxn)}/mo`])} />
          )}
        </Block>
        <Block title="Saved marketing assets" note={<Link href="/marketing" className="underline underline-offset-4">From the content system</Link>}>
          {d.assets.length === 0 ? (
            <Empty>None saved.</Empty>
          ) : (
            <List items={d.assets.map((a) => [a.label, `${a.kind}${a.channel ? ` · ${a.channel}` : ""} · ${a.lang.toUpperCase()}`])} />
          )}
        </Block>
      </div>

      <Block title="Research notes" note={<Link href="/research" className="underline underline-offset-4">From the research page</Link>}>
        {d.research.length === 0 ? (
          <Empty>None logged.</Empty>
        ) : (
          <List items={d.research.map((r) => [r.note, `${r.category} · ${r.source} · ${fmtDate(r.created_at)}`])} />
        )}
      </Block>

      <p className="mono mt-10 text-[11px] leading-relaxed text-[var(--muted)]">
        Not shown on purpose: conversation transcripts, visitor ids, feedback notes, and any reseller&apos;s
        inventory, which never leaves her own device.
      </p>
    </main>
  );
}

function Block({ title, note, children }: { title: string; note: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--line)] py-8">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-[1.05rem] font-medium tracking-[-0.01em]">{title}</h2>
        <p className="m-0 text-[13px] text-[var(--muted)]">{note}</p>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 rounded-[12px] border border-dashed border-[var(--line)] px-4 py-6 text-center text-sm text-[var(--muted)]">
      {children}
    </p>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="relative overflow-x-auto rounded-[12px] border border-[var(--line)]">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--surface)]">
            {head.map((h) => (
              <th key={h} scope="col" className="mono px-3 py-2 text-left text-[11px] font-normal uppercase tracking-[0.08em] text-[var(--muted)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-t [&>tr]:border-[var(--line)]">{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, num = false }: { children: React.ReactNode; num?: boolean }) {
  return <td className={`px-3 py-2.5 align-top ${num ? "num whitespace-nowrap" : ""}`}>{children}</td>;
}

function Status({ s }: { s: string }) {
  const label = s === "pending_review" ? "awaiting review" : s.replace(/_/g, " ");
  return (
    <span className="mono whitespace-nowrap rounded-[4px] border border-[var(--caution)] px-2 py-0.5 text-[11px] text-[var(--caution)]">
      {label}
    </span>
  );
}

function List({ items }: { items: [string, string][] }) {
  return (
    <ul className="m-0 list-none divide-y divide-[var(--line)] p-0">
      {items.map(([a, b], i) => (
        <li key={i} className="py-2.5">
          <p className="m-0 text-sm">{a}</p>
          <p className="mono m-0 mt-0.5 text-[11px] text-[var(--muted)]">{b}</p>
        </li>
      ))}
    </ul>
  );
}
