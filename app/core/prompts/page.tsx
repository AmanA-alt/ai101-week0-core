import Link from "next/link";
import { PROMPT_VERSIONS } from "@/lib/prompt";

export default function PromptsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-baseline justify-between border-b border-[var(--line)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Prompt library</h1>
        <Link
          href="/core"
          className="mono text-xs text-[var(--muted)] underline underline-offset-4"
        >
          Back
        </Link>
      </header>

      <div className="space-y-8">
        {PROMPT_VERSIONS.map((v) => (
          <article key={v.version}>
            <div className="mb-2 flex items-baseline gap-3">
              <span className="mono text-sm text-[var(--thread)]">v{v.version}</span>
              <span className="mono text-xs text-[var(--muted)]">{v.date}</span>
            </div>
            <p className="mb-3 text-sm">{v.change}</p>
            <pre className="mono overflow-x-auto whitespace-pre-wrap rounded-[3px] border border-[var(--line)] bg-[var(--card)] p-4 text-xs leading-relaxed">
              {v.text}
            </pre>
          </article>
        ))}
      </div>
    </main>
  );
}
