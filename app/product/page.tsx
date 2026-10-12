import Link from "next/link";
import Reveal from "@/components/Reveal";
import { SEGMENTS, CAPABILITY_GROUPS } from "@/lib/product-data";
import { TIERS, type TierId } from "@/lib/pricing";

export const metadata = {
  title: "Product architecture — Respondo",
  description:
    "Two customer segments, four capability groups and three tiers, built from the gaps competitors leave open.",
};

const TIER_IDS: TierId[] = ["solo", "negocio", "taller"];

export default function ProductPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <Reveal>
        <section className="border-b border-[var(--line)] py-20 md:py-32">
          <h1 className="m-0 max-w-[16ch] text-[clamp(2.4rem,6.5vw,4.5rem)] font-medium leading-[1.03] tracking-[-0.04em]">
            Everything the agent can do, and who it is for.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[clamp(1rem,1.6vw,1.15rem)] leading-relaxed text-[var(--muted)]">
            Two segments, four capability groups, three tiers. Built from the gaps left open by
            every tool already serving this market — the{" "}
            <Link href="/research" className="underline underline-offset-4 hover:text-[var(--indigo)]">
              competitor study
            </Link>{" "}
            has the detail.
          </p>
        </section>
      </Reveal>

      {SEGMENTS.map((seg) => (
        <section key={seg.name} className="border-b border-[var(--line)] py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-[5fr_7fr] md:gap-16">
            <Reveal className="md:sticky md:top-24 md:self-start">
              <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6">
                <h2 className="m-0 text-[1.35rem] font-medium tracking-[-0.02em]">{seg.name}</h2>
                <span className="mt-2 inline-block rounded-full bg-[var(--indigo-soft)] px-3 py-1 text-xs text-[var(--indigo)]">
                  {seg.rank}
                </span>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5">
                  {seg.facts.map((f) => (
                    <div key={f.k} className="contents">
                      <dt className="text-[13px] text-[var(--muted)]">{f.k}</dt>
                      <dd className="m-0 text-sm">{f.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <div>
              {seg.arguments.map((a, i) => (
                <Reveal key={a.heading} delay={i * 60}>
                  <div className="border-b border-[var(--line)] py-7 first:pt-0 last:border-b-0">
                    <h3 className="m-0 text-[1.05rem] font-medium tracking-[-0.01em]">{a.heading}</h3>
                    <p className="m-0 mt-2 max-w-[56ch] text-[15px] leading-relaxed text-[var(--muted)]">
                      {a.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="py-16 md:py-24">
        <Reveal>
          <p className="m-0 text-[13px] text-[var(--muted)]">Capabilities by tier</p>
          <h2 className="m-0 mt-4 max-w-[20ch] text-[clamp(1.6rem,3.2vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.03em]">
            What ships, and when.
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-8 overflow-hidden rounded-[18px] border border-[var(--line)] bg-[var(--surface)]">
            <div className="grid grid-cols-[minmax(0,1fr)_54px_54px_54px] border-b border-[var(--line)] px-5 py-3 md:grid-cols-[minmax(0,1fr)_84px_84px_84px] md:px-6">
              <span className="text-xs text-[var(--muted)]">Capability</span>
              {TIERS.map((t) => (
                <span key={t.id} className="text-center text-xs text-[var(--muted)]">
                  {t.name}
                </span>
              ))}
            </div>

            {CAPABILITY_GROUPS.map((g) => (
              <div key={g.name}>
                <div className="border-y border-[var(--line)] bg-[var(--bone)] px-5 py-3 md:px-6">
                  <span className="text-[15px] font-medium tracking-[-0.01em]">{g.name}</span>
                  <span className="ml-2.5 text-[13px] text-[var(--muted)]">{g.note}</span>
                </div>

                {g.items.map((item) => (
                  <div
                    key={item.name}
                    className="grid grid-cols-[minmax(0,1fr)_54px_54px_54px] items-center border-b border-[var(--line)] px-5 py-3 last:border-b-0 md:grid-cols-[minmax(0,1fr)_84px_84px_84px] md:px-6"
                  >
                    <span className="text-sm">
                      {item.name}
                      <StatusChip status={item.status} mexico={item.mexico} />
                      {item.detail && (
                        <em className="mt-0.5 block text-[12.5px] not-italic text-[var(--muted)]">
                          {item.detail}
                        </em>
                      )}
                    </span>
                    {TIER_IDS.map((id) => {
                      const on = item.tiers.includes(id);
                      return (
                        <span
                          key={id}
                          className={`text-center text-[15px] ${on ? "text-[var(--indigo)]" : "text-[#c9c7c1]"}`}
                        >
                          <span aria-hidden="true">{on ? "●" : "○"}</span>
                          <span className="sr-only">
                            {on ? "included" : "not included"}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-8 text-sm text-[var(--muted)]">
            What each tier costs, and what the business looks like at different adoption, is on{" "}
            <Link href="/pricing" className="underline underline-offset-4 hover:text-[var(--indigo)]">
              the pricing page
            </Link>
            .
          </p>
        </Reveal>
      </section>
    </main>
  );
}

function StatusChip({
  status,
  mexico,
}: {
  status: "live" | "planned";
  mexico?: boolean;
}) {
  const base =
    "ml-2 inline-block rounded-full border px-2 py-0.5 align-[1px] text-[11px] whitespace-nowrap";

  if (status === "live") {
    return <span className={`${base} border-[var(--indigo)] text-[var(--indigo)]`}>live</span>;
  }
  return (
    <span
      className={`${base} ${
        mexico
          ? "border-[var(--cochineal)] text-[var(--cochineal)]"
          : "border-[var(--line)] text-[var(--muted)]"
      }`}
    >
      planned
    </span>
  );
}
