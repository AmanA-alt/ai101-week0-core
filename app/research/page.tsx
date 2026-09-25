"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BENCHMARKS,
  COMPETITORS,
  RISKS,
  LOCALIZATION,
  type Risk,
} from "@/lib/research-data";

type Record = {
  id: string;
  created_at: string;
  source: string;
  category: string;
  note: string;
};

const CATEGORIES = ["All", "CRM", "Inbox", "Platform", "AI agent", "Substitute"];
const LEVELS: Risk["likelihood"][] = ["Low", "Medium", "High"];

export default function ResearchPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [form, setForm] = useState({ source: "", category: "Competitor", note: "" });
  const [records, setRecords] = useState<Record[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRecords() {
    try {
      const res = await fetch("/api/research");
      if (!res.ok) return;
      const data = await res.json();
      setRecords(data.rows ?? []);
    } catch {
      /* non-critical */
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COMPETITORS.filter((c) => {
      const matchesCategory = category === "All" || c.category === category;
      const matchesSearch =
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        c.strength.toLowerCase().includes(q) ||
        c.gap.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  async function saveRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!form.source.trim() || !form.note.trim()) {
      setError("Source and note are both required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setError("The record could not be saved.");
        return;
      }
      setForm({ source: "", category: form.category, note: "" });
      loadRecords();
    } finally {
      setSaving(false);
    }
  }

  const tiles = [
    ["Competitors tracked", COMPETITORS.length],
    ["Global benchmarks", BENCHMARKS.length],
    ["Risks logged", RISKS.length],
    ["Validation talks", 1],
  ] as const;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="border-b border-[var(--line)] pb-4">
        <h1 className="m-0 text-2xl font-medium tracking-tight">Research and benchmarking</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Testing two assumptions before building further: that resellers lose sales to
          unanswered messages, and that nothing serves them at their price point.
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-[3px] bg-[var(--card)] px-4 py-3">
            <p className="m-0 text-xs text-[var(--muted)]">{label}</p>
            <p className="mono m-0 mt-1 text-2xl font-medium">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="m-0 text-sm font-medium text-[var(--muted)]">Global benchmarks</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {BENCHMARKS.map((b) => (
            <article
              key={b.name}
              className="rounded-[3px] border border-[var(--line)] bg-[var(--card)] p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="m-0 text-sm font-medium">{b.name}</h3>
                <span className="mono text-[11px] text-[var(--muted)]">{b.region}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{b.what}</p>
              <p className="mono m-0 mt-3 text-xs text-[var(--thread)]">{b.pricing}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="m-0 text-sm font-medium text-[var(--muted)]">
            Competitors and substitutes
          </h2>
          <span className="mono text-xs text-[var(--muted)]">
            {filtered.length} of {COMPETITORS.length}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, strength or gap…"
            className="flex-1 rounded-[3px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-[3px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Nothing matches. Clear the search or change the category.
          </p>
        ) : (
          <ul className="mt-4 list-none divide-y divide-[var(--line)] p-0">
            {filtered.map((c) => (
              <li key={c.name} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="m-0 text-sm font-medium">{c.name}</h3>
                  <span className="mono text-[11px] text-[var(--muted)]">
                    {c.category} · {c.pricing}
                  </span>
                </div>
                <p className="m-0 mt-2 text-sm leading-relaxed">
                  <span className="text-[var(--muted)]">Strength: </span>
                  {c.strength}
                </p>
                <p className="m-0 mt-1 text-sm leading-relaxed">
                  <span className="text-[var(--thread)]">Gap: </span>
                  {c.gap}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="m-0 text-sm font-medium text-[var(--muted)]">Risk map</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Likelihood across, impact down. The top-right cell is what would end this project.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-20 border-b border-[var(--line)] p-2 text-left text-xs font-medium text-[var(--muted)]">
                  Impact ↓
                </th>
                {LEVELS.map((l) => (
                  <th
                    key={l}
                    className="border-b border-[var(--line)] p-2 text-left text-xs font-medium text-[var(--muted)]"
                  >
                    {l} likelihood
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...LEVELS].reverse().map((impact) => (
                <tr key={impact}>
                  <td className="mono border-b border-[var(--line)] p-2 align-top text-xs text-[var(--muted)]">
                    {impact}
                  </td>
                  {LEVELS.map((likelihood) => {
                    const cell = RISKS.filter(
                      (r) => r.impact === impact && r.likelihood === likelihood
                    );
                    const hot = impact === "High" && likelihood === "High";
                    return (
                      <td
                        key={likelihood}
                        className={`border-b border-[var(--line)] p-2 align-top ${
                          hot ? "bg-[var(--card)]" : ""
                        }`}
                      >
                        {cell.map((r) => (
                          <span
                            key={r.label}
                            className={`mb-1 mr-1 inline-block rounded-[3px] border px-2 py-1 text-[11px] leading-snug ${
                              hot
                                ? "border-[var(--over)] text-[var(--over)]"
                                : "border-[var(--line)] text-[var(--muted)]"
                            }`}
                          >
                            {r.label}
                          </span>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="m-0 text-sm font-medium text-[var(--muted)]">Mexico localization</h2>
        <ul className="mt-4 list-none divide-y divide-[var(--line)] p-0">
          {LOCALIZATION.map((l) => (
            <li key={l.title} className="py-3">
              <h3 className="m-0 text-sm font-medium">{l.title}</h3>
              <p className="m-0 mt-1 text-sm leading-relaxed text-[var(--muted)]">{l.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t border-[var(--line)] pt-6">
        <h2 className="m-0 text-sm font-medium text-[var(--muted)]">Log a research finding</h2>

        <form onSubmit={saveRecord} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_2fr_auto]">
          <input
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            placeholder="Source"
            className="rounded-[3px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-[3px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
          >
            {["Competitor", "Benchmark", "Risk", "Validation", "Market data"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="What did you find?"
            className="rounded-[3px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-[3px] bg-[var(--thread)] px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded-[3px] border-l-2 border-[var(--caution)] bg-white px-4 py-3 text-sm">
            {error}
          </p>
        )}

        {records.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Saved findings appear here, newest first.
          </p>
        ) : (
          <ul className="mt-4 list-none divide-y divide-[var(--line)] p-0">
            {records.map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{r.source}</span>
                  <span className="mono text-[11px] text-[var(--muted)]">
                    {r.category} · {new Date(r.created_at).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <p className="m-0 mt-1 text-sm leading-relaxed text-[var(--muted)]">{r.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
