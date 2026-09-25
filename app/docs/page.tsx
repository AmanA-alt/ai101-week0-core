const STACK = [
  ["Framework", "Next.js 16, App Router"],
  ["Language", "TypeScript"],
  ["Styling", "Tailwind CSS 4"],
  ["Validation", "zod, on both request bodies and model output"],
  ["Model", "Groq, openai/gpt-oss-120b"],
  ["Database", "Supabase, Postgres"],
  ["Hosting", "Vercel"],
  ["Tests", "Vitest"],
];

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="m-0 text-2xl font-medium tracking-tight">Documentation</h1>
      <p className="mt-3 text-base leading-relaxed text-[var(--muted)]">
        Documentation is in progress. This page will hold setup instructions, the data
        model, and the prompt design notes once the agent is past its research phase.
      </p>

      <h2 className="mt-10 text-sm font-medium text-[var(--muted)]">What this project is</h2>
      <p className="mt-3 text-sm leading-relaxed">
        An AI sales agent for small clothing resellers. Customers ask about items in a chat;
        the agent answers only from real catalog data and assembles a basket. Nothing becomes
        an order until a human confirms it.
      </p>

      <h2 className="mt-10 text-sm font-medium text-[var(--muted)]">Stack</h2>
      <ul className="mt-3 list-none divide-y divide-[var(--line)] p-0">
        {STACK.map(([k, v]) => (
          <li key={k} className="flex flex-wrap gap-x-4 py-2.5 text-sm">
            <span className="w-28 shrink-0 text-[var(--muted)]">{k}</span>
            <span>{v}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-sm font-medium text-[var(--muted)]">Running locally</h2>
      <p className="mt-3 text-sm leading-relaxed">
        See <span className="mono">README.md</span> in the repository. All six environment
        variables are listed there by name in <span className="mono">.env.example</span>;
        none are committed.
      </p>
    </main>
  );
}
