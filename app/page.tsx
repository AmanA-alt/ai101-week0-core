import Link from "next/link";

type Status = "shipped" | "building" | "planned";

const ROADMAP: { week: number; title: string; note: string; status: Status }[] = [
  { week: 0, title: "Builder infrastructure", note: "Repo, deploy pipeline, shell, docs placeholder", status: "shipped" },
  { week: 1, title: "Generative core agent", note: "Chat agent, catalog grounding, basket, human handoff", status: "shipped" },
  { week: 2, title: "Research and benchmarking", note: "Competitors, substitutes, risk map, validation", status: "building" },
  { week: 3, title: "Screenshot recognition", note: "Customer sends a photo instead of a product name", status: "planned" },
  { week: 4, title: "Catalog management", note: "Real inventory in, sizes at variant level", status: "planned" },
  { week: 5, title: "Operator queue", note: "Review, edit and confirm baskets at volume", status: "planned" },
  { week: 6, title: "WhatsApp integration", note: "Replace the simulated transport with the real API", status: "planned" },
  { week: 7, title: "Pricing and launch", note: "Tiers, onboarding, first paying reseller", status: "planned" },
];

const PILL: Record<Status, { label: string; className: string }> = {
  shipped: { label: "shipped", className: "border-[var(--thread)] text-[var(--thread)]" },
  building: { label: "in progress", className: "border-[var(--caution)] text-[var(--caution)]" },
  planned: { label: "planned", className: "border-[var(--line)] text-[var(--muted)]" },
};

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <section className="border-b border-[var(--line)] py-16">
        <h1 className="m-0 max-w-2xl text-3xl font-medium leading-tight tracking-tight">
          An AI agent that answers your customers without inventing what you have in stock.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]">
          Built for one-person clothing resellers in Mexico. The agent reads your catalog,
          answers questions, and builds a basket. You confirm every order before it exists.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Link
            href="/core"
            className="rounded-[3px] bg-[var(--thread)] px-5 py-2.5 text-sm font-medium text-white"
          >
            Try the agent
          </Link>
          <Link href="/research" className="text-sm text-[var(--muted)] underline underline-offset-4">
            See the market research
          </Link>
        </div>
      </section>

      <section className="py-12">
        <h2 className="m-0 text-sm font-medium text-[var(--muted)]">Roadmap</h2>
        <ul className="mt-5 list-none divide-y divide-[var(--line)] p-0">
          {ROADMAP.map((r) => (
            <li key={r.week} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4">
              <span className="mono w-14 shrink-0 text-xs text-[var(--muted)]">
                Week {r.week}
              </span>
              <span className="min-w-[180px] flex-1 text-sm font-medium">{r.title}</span>
              <span className="min-w-[200px] flex-1 text-sm text-[var(--muted)]">{r.note}</span>
              <span
                className={`mono shrink-0 rounded-[3px] border px-2 py-0.5 text-[11px] ${PILL[r.status].className}`}
              >
                {PILL[r.status].label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
