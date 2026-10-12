import Link from "next/link";

type Status = "shipped" | "building" | "planned";

const ROADMAP: { title: string; note: string; status: Status }[] = [
  { title: "The agent", note: "Catalog-grounded replies, basket, human confirmation gate", status: "shipped" },
  { title: "Market research", note: "Competitors, substitutes, risk map, validation", status: "shipped" },
  { title: "Product architecture and pricing", note: "Feature map, three tiers, revenue simulator", status: "shipped" },
  { title: "Catalog management", note: "Real inventory in, sizes at variant level", status: "building" },
  { title: "Apartado tracking", note: "Layaway, which no competitor offers", status: "planned" },
  { title: "Operator queue", note: "Review, edit and confirm baskets at volume", status: "planned" },
  { title: "WhatsApp integration", note: "Replace the simulated transport with the real API", status: "planned" },
  { title: "Launch", note: "Onboarding, billing, first paying reseller", status: "planned" },
];

const PILL: Record<Status, { label: string; className: string }> = {
  shipped: { label: "shipped", className: "border-[var(--indigo)] text-[var(--indigo)]" },
  building: { label: "building", className: "border-[var(--caution)] text-[var(--caution)]" },
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
            <li key={r.title} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4">
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
