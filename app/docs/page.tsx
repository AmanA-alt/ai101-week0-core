import type { Metadata } from "next";
import Link from "next/link";
import { BUILD_LOG, PROMPT_LIBRARY } from "@/lib/venture-data";

export const metadata: Metadata = {
  title: "Docs — Bastilla",
  description: "How Bastilla was built: the stack, the prompt library and the build log, module by module.",
};

const STACK = [
  ["Framework", "Next.js 16, App Router"],
  ["Language", "TypeScript"],
  ["Styling", "Tailwind CSS 4, light and dark appearances"],
  ["Validation", "zod, on both request bodies and model output"],
  ["Model", "Groq, openai/gpt-oss-120b, on /core only"],
  ["Database", "Supabase, Postgres"],
  ["Hosting", "Vercel"],
  ["Tests", "Vitest, plus a live-site regression script"],
];

const REPO = "https://github.com/AmanA-alt/ai101-week0-core";

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="border-b border-[var(--line)] pb-6">
        <p className="mono m-0 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Project reference</p>
        <h1 className="display m-0 mt-2 text-[clamp(2rem,5vw,3rem)] text-[var(--indigo)]">Documentation</h1>
        <nav aria-label="On this page" className="mt-5 flex flex-wrap gap-2">
          {[["#about", "What it is"], ["#stack", "Stack"], ["#prompts", "Prompt library"], ["#log", "Build log"], ["#run", "Running it"]].map(([h, l]) => (
            <a key={h} href={h} className="demo-chip">{l}</a>
          ))}
        </nav>
      </header>

      <div className="grid gap-x-12 md:grid-cols-[1fr_1.4fr]">
        <section id="about" className="py-8">
          <h2 className="m-0 text-sm font-medium text-[var(--muted)]">What this project is</h2>
          <p className="mt-3 text-sm leading-relaxed">
            An AI sales agent for small clothing resellers. Customers ask about items in a chat; the agent answers only from
            real catalog data and assembles a basket. Nothing becomes an order until a human confirms it. A reseller can
            keep her stock list on <Link href="/inventory" className="underline underline-offset-4">/inventory</Link>, saved
            only on her own device.
          </p>
        </section>

        <section id="stack" className="py-8">
          <h2 className="m-0 text-sm font-medium text-[var(--muted)]">Stack</h2>
          <ul className="mt-3 list-none divide-y divide-[var(--line)] p-0">
            {STACK.map(([k, v]) => (
              <li key={k} className="flex flex-wrap gap-x-4 py-2.5 text-sm">
                <span className="w-28 shrink-0 text-[var(--muted)]">{k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section id="prompts" className="border-t border-[var(--line)] py-10">
        <h2 className="display m-0 text-[clamp(1.5rem,3vw,2.1rem)] text-[var(--indigo)]">Prompt library</h2>
        <p className="m-0 mt-2 max-w-[60ch] text-sm text-[var(--muted)]">
          The prompt that shaped each module, condensed, and what it changed. The agent&apos;s own system prompt is on{" "}
          <Link href="/core/prompts" className="underline underline-offset-4">/core/prompts</Link>.
        </p>
        <ol className="m-0 mt-8 grid list-none gap-4 p-0 md:grid-cols-2">
          {PROMPT_LIBRARY.map((p) => (
            <li key={p.module} className="lift-card rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="mono m-0 text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">{p.module}</p>
              <h3 className="m-0 mt-2 text-[1rem] font-medium">{p.title}</h3>
              <blockquote className="mono m-0 mt-3 border-l-2 border-[var(--indigo)] pl-3 text-[12px] leading-relaxed">{p.prompt}</blockquote>
              <p className="m-0 mt-3 text-[13px] leading-relaxed text-[var(--muted)]"><span className="text-[var(--ink)]">What changed:</span> {p.outcome}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="log" className="border-t border-[var(--line)] py-10">
        <h2 className="display m-0 text-[clamp(1.5rem,3vw,2.1rem)] text-[var(--indigo)]">Build log</h2>
        <p className="m-0 mt-2 max-w-[60ch] text-sm text-[var(--muted)]">
          Key commits from each module, linked to the repository so every one can be checked.
        </p>
        <ol className="m-0 mt-8 list-none p-0">
          {BUILD_LOG.map((m) => (
            <li key={m.module} className="grid gap-3 border-t border-[var(--line)] py-6 md:grid-cols-[12rem_1fr]">
              <div>
                <p className="mono m-0 text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">{m.module}</p>
                <p className="m-0 mt-1 font-medium">{m.title}</p>
              </div>
              <div>
                <p className="m-0 text-sm text-[var(--muted)]">{m.note}</p>
                <ul className="m-0 mt-3 list-none space-y-1.5 p-0">
                  {m.commits.map(([sha, msg]) => (
                    <li key={sha} className="flex gap-3 text-[13px]">
                      <a href={`${REPO}/commit/${sha}`} className="mono shrink-0 text-[var(--indigo)] underline underline-offset-4" target="_blank" rel="noreferrer">
                        {sha}
                      </a>
                      <span>{msg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
          <li className="grid gap-3 border-t border-[var(--line)] py-6 md:grid-cols-[12rem_1fr]">
            <div>
              <p className="mono m-0 text-[11px] uppercase tracking-[0.1em] text-[var(--muted)]">Module 6</p>
              <p className="m-0 mt-1 font-medium">Integrated venture</p>
            </div>
            <p className="m-0 text-sm text-[var(--muted)]">
              Dashboard, inventory, guided demo, agent map, light and dark appearances, the mascot, and a privacy fix to the
              orders route. See the <a href={`${REPO}/commits/main`} className="underline underline-offset-4" target="_blank" rel="noreferrer">latest commits</a>.
            </p>
          </li>
        </ol>
      </section>

      <section id="run" className="border-t border-[var(--line)] py-10">
        <h2 className="m-0 text-sm font-medium text-[var(--muted)]">Running locally</h2>
        <p className="mt-3 text-sm leading-relaxed">
          See <span className="mono">README.md</span> in the repository. Environment variables are listed there by name;
          none are committed. To check the live site, run{" "}
          <span className="mono">node scripts/regression.mjs https://ai101-week0-core.vercel.app</span>.
        </p>
      </section>
    </main>
  );
}
