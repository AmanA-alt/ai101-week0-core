import type { Metadata } from "next";
import Link from "next/link";
import Ghost from "@/components/Ghost";
import Reveal from "@/components/Reveal";
import AgentMap from "@/components/AgentMap";
import { DEMO_STEPS, RECORDING, RISKS, ROADMAP_V2, VALUE } from "@/lib/venture-data";

export const metadata: Metadata = {
  title: "Guided demo — Bastilla",
  description: "Six steps from the reseller's problem to the version 2 roadmap, with the evidence for each.",
};

/**
 * The guided walkthrough. Static on purpose: it has to load and read correctly
 * even when the model provider is slow, and it costs nothing to serve. Each
 * step is a claim, the evidence for it, and a link to where it can be checked.
 */

const REGRESSION_ROUTES = [
  "/", "/chat", "/core", "/core/prompts", "/inventory", "/dashboard", "/demo",
  "/research", "/product", "/pricing", "/marketing", "/docs",
];

export default function DemoPage() {
  return (
    <>
      <section className="relative z-[1] bg-[var(--indigo)] text-[var(--bone)]">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-6 py-16 md:grid-cols-[1.6fr_1fr] md:py-24">
          <div>
            <p className="mono m-0 text-[11px] uppercase tracking-[0.14em] text-[var(--bone)]/60">Guided demo · 5 minutes</p>
            <h1 className="display anim-step m-0 mt-4 text-[clamp(2.2rem,6vw,4.2rem)]">
              From an unanswered message to a basket you confirm.
            </h1>
            <p className="m-0 mt-5 max-w-[50ch] text-[15px] leading-relaxed text-[var(--bone)]/75">
              Six steps. Each one makes a claim, shows the evidence, and links to the page where you can check it yourself.
            </p>
          </div>
          <div className="flex justify-center">
            <Ghost size={190} motion="loop" state="talking" label="Bastilla mascot" className="h-auto w-[130px] md:w-[190px]" />
          </div>
        </div>
      </section>

      <main className="relative z-[1] mx-auto max-w-5xl px-6">
        <nav aria-label="Demo steps" className="sticky top-16 z-10 -mx-6 overflow-x-auto border-b border-[var(--line)] bg-[var(--bone)]/90 px-6 py-3 backdrop-blur">
          <ol className="m-0 flex list-none gap-2 p-0">
            {DEMO_STEPS.map((s) => (
              <li key={s.n}>
                <a href={`#step-${s.n}`} className="demo-chip mono whitespace-nowrap">
                  {s.n}
                </a>
              </li>
            ))}
            <li><a href="#map" className="demo-chip whitespace-nowrap">Agent map</a></li>
            <li><a href="#roadmap" className="demo-chip whitespace-nowrap">Version 2</a></li>
          </ol>
        </nav>

        {DEMO_STEPS.map((s, i) => (
          <section key={s.n} id={`step-${s.n}`} className="grid gap-8 border-b border-[var(--line)] py-14 md:grid-cols-[1fr_1fr] md:py-20">
            <Reveal>
              <p className="mono m-0 text-sm text-[var(--muted)]">Step {s.n}</p>
              <h2 className="display m-0 mt-3 text-[clamp(1.6rem,3.6vw,2.4rem)] text-[var(--indigo)]">{s.claim}</h2>
              <p className="m-0 mt-4 max-w-[48ch] text-[15px] leading-relaxed text-[var(--muted)]">{s.body}</p>
              {s.href.startsWith("#") ? (
                <a href={s.href} className="nav-cta mt-6 inline-flex">{s.cta} <span aria-hidden="true" className="nav-cta-arrow">→</span></a>
              ) : (
                <Link href={s.href} className="nav-cta mt-6 inline-flex">{s.cta} <span aria-hidden="true" className="nav-cta-arrow">→</span></Link>
              )}
            </Reveal>
            <Reveal delay={100}>{STEP_VISUAL[i]?.()}</Reveal>
          </section>
        ))}

        <section id="map" className="border-b border-[var(--line)] py-14 md:py-20">
          <Reveal>
            <p className="mono m-0 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Agent map</p>
            <h2 className="display m-0 mt-3 max-w-[22ch] text-[clamp(1.6rem,3.6vw,2.4rem)] text-[var(--indigo)]">
              Eight stages, and the model only ever chooses the words.
            </h2>
          </Reveal>
          <div className="mt-10"><AgentMap /></div>
        </section>

        <section id="roadmap" className="py-14 md:py-20">
          <Reveal>
            <p className="mono m-0 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Version 2 roadmap</p>
            <h2 className="display m-0 mt-3 max-w-[22ch] text-[clamp(1.6rem,3.6vw,2.4rem)] text-[var(--indigo)]">
              Every item comes from something the impact check or a tester raised.
            </h2>
          </Reveal>
          <ol className="m-0 mt-10 list-none divide-y divide-[var(--line)] p-0">
            {ROADMAP_V2.map((r, i) => (
              <Reveal key={r.title} delay={Math.min(i, 4) * 60}>
                <li className="grid gap-2 py-5 md:grid-cols-[2rem_1fr_14rem] md:items-baseline">
                  <span className="mono text-sm text-[var(--muted)]">{i + 1}</span>
                  <div>
                    <p className="m-0 font-medium">{r.title}</p>
                    <p className="m-0 mt-1 text-sm text-[var(--muted)]">{r.why}</p>
                  </div>
                  <span className="mono text-[11px] text-[var(--muted)] md:text-right">{r.source}</span>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}

/* Visuals for each step, in order. */
const STEP_VISUAL: (() => React.ReactNode)[] = [
  () => (
    <figure className="m-0 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6">
      <p className="mono m-0 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">A reseller&apos;s evening</p>
      <ul className="m-0 mt-4 list-none space-y-3 p-0 text-sm">
        {["“¿La tienes en M?”", "“¿Cuánto cuesta con envío?”", "“¿De qué tela es?”", "“¿Me la apartas?”"].map((q, i) => (
          <li key={q} className="flex items-center justify-between gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--bone)] px-3 py-2">
            <span>{q}</span>
            <span className="mono text-[11px] text-[var(--muted)]">{["23:04", "23:11", "23:26", "23:40"][i]}</span>
          </li>
        ))}
      </ul>
    </figure>
  ),
  () => (
    <figure className="m-0 mx-auto w-full max-w-[360px] rounded-[30px] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[0_30px_60px_-40px_#000]">
      <div className="flex items-center gap-3 rounded-t-[22px] bg-[var(--indigo)] px-4 py-3 text-[var(--bone)]">
        <Ghost size={30} motion="none" label="Bastilla" />
        <p className="m-0 text-sm font-medium">Bastilla</p>
      </div>
      <div className="space-y-2.5 rounded-b-[22px] bg-[var(--bone)] px-3 py-4">
        {RECORDING.map((b, i) => (
          <p
            key={i}
            className={`m-0 max-w-[85%] rounded-[14px] px-3 py-2 text-[13px] leading-relaxed ${
              b.from === "customer"
                ? "ml-auto rounded-br-[4px] bg-[var(--indigo)] text-[var(--bone)]"
                : "rounded-bl-[4px] border border-[var(--line)] bg-[var(--surface)]"
            }`}
          >
            {b.text}
          </p>
        ))}
      </div>
      <figcaption className="mono px-2 pb-1 pt-3 text-center text-[11px] text-[var(--muted)]">
        Example conversation, not live. The live chat is at /chat.
      </figcaption>
    </figure>
  ),
  () => (
    <figure className="m-0 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6">
      <div className="flex items-center gap-4">
        <span className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full bg-[var(--indigo)]">
          <Ghost size={48} state="handoff" motion="once" label="Handed to you" />
        </span>
        <div>
          <p className="m-0 font-medium">1 blusa de lino, M</p>
          <p className="num m-0 text-sm text-[var(--muted)]">$690 MXN</p>
        </div>
      </div>
      <p className="mono m-0 mt-5 inline-block rounded-[4px] border border-[var(--caution)] px-2 py-0.5 text-[11px] text-[var(--caution)]">
        awaiting review
      </p>
      <p className="m-0 mt-3 text-sm text-[var(--muted)]">The status can never start as confirmed. Only a person changes it.</p>
    </figure>
  ),
  () => (
    <figure className="m-0 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6">
      <div className="flex gap-3">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" className="shrink-0 text-[var(--indigo)]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <p className="m-0 text-sm"><span className="font-medium">0 network requests</span> while importing, editing, saving, exporting or deleting the inventory.</p>
      </div>
      <ul className="m-0 mt-5 list-none space-y-2 p-0 text-[13px] text-[var(--muted)]">
        <li>CSV with commas or semicolons</li>
        <li>Spanish or English headings recognised</li>
        <li>Missing, negative and duplicated rows flagged before saving</li>
        <li>Backup export and one-step delete</li>
      </ul>
    </figure>
  ),
  () => (
    <figure id="testing" className="m-0 scroll-mt-32 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6">
      <p className="mono m-0 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Testing summary</p>
      <p className="m-0 mt-3 text-sm">
        <span className="font-medium">External users.</span> Five people ran the same four tasks: find an item, ask for a size that is not there,
        find the basket on the dashboard, and save stock on the inventory page. Their results are live on the{" "}
        <Link href="/dashboard" className="underline underline-offset-4">dashboard</Link>.
      </p>
      <p className="m-0 mt-4 text-sm">
        <span className="font-medium">Full-site regression.</span> A script requests every page and read route on the live site and checks each one
        answers and contains what it should.
      </p>
      <ul className="m-0 mt-3 flex list-none flex-wrap gap-1.5 p-0">
        {REGRESSION_ROUTES.map((r) => (
          <li key={r} className="mono rounded-[6px] border border-[var(--line)] bg-[var(--bone)] px-2 py-0.5 text-[11px]">{r}</li>
        ))}
      </ul>
    </figure>
  ),
  () => (
    <figure id="impact" className="m-0 scroll-mt-32 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6">
      <p className="mono m-0 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">Practical impact check</p>
      <p className="m-0 mt-3 text-sm"><span className="font-medium">{VALUE.title}.</span> {VALUE.body}</p>
      <ul className="m-0 mt-4 list-none divide-y divide-[var(--line)] p-0">
        {RISKS.map((r) => (
          <li key={r.title} className="py-3">
            <p className="m-0 text-sm font-medium">{r.title}</p>
            <p className="m-0 mt-0.5 text-[13px] text-[var(--muted)]">{r.body}</p>
            <p className="m-0 mt-1 text-[13px] text-[var(--indigo)]">Guard: {r.guard}</p>
          </li>
        ))}
      </ul>
    </figure>
  ),
];
