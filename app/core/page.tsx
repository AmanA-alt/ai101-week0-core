"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Channel = "instagram" | "facebook" | "whatsapp";
type Drafts = Record<Channel, string>;

type Row = {
  id: string;
  created_at: string;
  item_name: string;
  output_instagram: string;
  output_facebook: string;
  output_whatsapp: string;
  used_channel: Channel | null;
};

const LIMITS: Record<Channel, number> = {
  instagram: 400,
  facebook: 900,
  whatsapp: 300,
};

const LABELS: Record<Channel, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
};

const EMPTY = {
  itemName: "",
  category: "",
  fabric: "",
  details: "",
  colors: "",
  sizes: "",
  priceMxn: "",
  occasion: "",
};

const EXAMPLE = {
  itemName: "Short-sleeve linen blouse",
  category: "Blouse",
  fabric: "linen",
  details: "round neckline, shell buttons",
  colors: "bone, sage green",
  sizes: "S to XL",
  priceMxn: "690",
  occasion: "Everyday",
};

export default function CorePage() {
  const [form, setForm] = useState(EMPTY);
  const [drafts, setDrafts] = useState<Drafts | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [used, setUsed] = useState<Channel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function loadRows() {
    try {
      const res = await fetch("/api/outputs");
      if (!res.ok) return;
      const data = await res.json();
      setRows(data.rows ?? []);
    } catch {
      /* dashboard is non-critical */
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  function set(key: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setDrafts(null);
    setSavedId(null);
    setUsed(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceMxn: form.priceMxn ? Number(form.priceMxn) : undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setCooldown(data.retryAfterSeconds ?? 60);
        setError("Model rate limit reached. Wait and try again.");
        return;
      }
      if (!res.ok) {
        setError(data.message ?? "Could not generate the drafts.");
        return;
      }
      setDrafts(data.drafts);
    } catch {
      setError("No response from the server.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!drafts) return;
    setSaving(true);
    try {
      const res = await fetch("/api/outputs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attrs: {
            ...form,
            priceMxn: form.priceMxn ? Number(form.priceMxn) : undefined,
          },
          drafts,
        }),
      });
      if (!res.ok) {
        setError("Could not save to the database.");
        return;
      }
      const data = await res.json();
      setSavedId(data.id);
      loadRows();
    } finally {
      setSaving(false);
    }
  }

  async function markUsed(channel: Channel) {
    if (!savedId) return;
    const next = used === channel ? null : channel;
    setUsed(next);
    await fetch(`/api/outputs/${savedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usedChannel: next }),
    });
    loadRows();
  }

  const busy = loading || cooldown > 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-10 flex items-baseline justify-between border-b border-[var(--line)] pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Boutique Copy</h1>
        <Link
          href="/core/prompts"
          className="mono text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--thread)]"
        >
          Prompt library
        </Link>
      </header>

      <div className="grid gap-10 md:grid-cols-[2fr_3fr]">
        <section>
          <h2 className="mb-4 text-sm font-medium text-[var(--muted)]">Garment</h2>

          <div className="space-y-3">
            <Field label="Name" value={form.itemName} onChange={(v) => set("itemName", v)} required />
            <Select
              label="Category"
              value={form.category}
              onChange={(v) => set("category", v)}
              options={["", "Blouse", "Dress", "Trousers", "Skirt", "Coat", "Other"]}
            />
            <Field label="Fabric" value={form.fabric} onChange={(v) => set("fabric", v)} />
            <Field label="Details" value={form.details} onChange={(v) => set("details", v)} />
            <Field label="Colors" value={form.colors} onChange={(v) => set("colors", v)} />
            <Field label="Sizes" value={form.sizes} onChange={(v) => set("sizes", v)} />
            <Field
              label="Price (MXN)"
              value={form.priceMxn}
              onChange={(v) => set("priceMxn", v)}
              type="number"
            />
            <Select
              label="Occasion"
              value={form.occasion}
              onChange={(v) => set("occasion", v)}
              options={["", "Everyday", "Party", "Office"]}
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={generate}
              disabled={busy || !form.itemName.trim()}
              className="rounded-[3px] bg-[var(--thread)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
            >
              {loading ? "Generating…" : cooldown > 0 ? `Wait ${cooldown}s` : "Generate drafts"}
            </button>
            <button
              onClick={() => setForm(EXAMPLE)}
              className="text-sm text-[var(--muted)] underline underline-offset-4"
            >
              Load example garment
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-[var(--muted)]">Drafts</h2>
            {drafts && (
              <button
                onClick={save}
                disabled={saving || !!savedId}
                className="mono rounded-[3px] border border-[var(--thread)] px-3 py-1.5 text-xs text-[var(--thread)] disabled:opacity-40"
              >
                {savedId ? "Saved" : saving ? "Saving…" : "Save"}
              </button>
            )}
          </div>

          {error && (
            <p className="mb-4 rounded-[3px] border-l-2 border-[var(--caution)] bg-white px-4 py-3 text-sm">
              {error}
            </p>
          )}

          <div className="space-y-4">
            {(Object.keys(LIMITS) as Channel[]).map((channel) =>
              drafts ? (
                <DraftCard
                  key={channel}
                  channel={channel}
                  text={drafts[channel]}
                  saved={!!savedId}
                  used={used === channel}
                  onUse={() => markUsed(channel)}
                />
              ) : (
                <div
                  key={channel}
                  className="rounded-[3px] border border-dashed border-[var(--line)] px-4 py-8 text-center text-sm text-[var(--muted)]"
                >
                  {LABELS[channel]}
                </div>
              )
            )}
          </div>
        </section>
      </div>

      <section className="mt-14 border-t border-[var(--line)] pt-6">
        <h2 className="mb-4 text-sm font-medium text-[var(--muted)]">Dashboard</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Generate a draft and save it to start your copy library.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--line)]">
            {rows.map((row) => (
              <li key={row.id} className="py-3">
                <button
                  onClick={() => setOpen(open === row.id ? null : row.id)}
                  className="flex w-full items-baseline justify-between text-left"
                >
                  <span className="text-sm">{row.item_name}</span>
                  <span className="mono text-xs text-[var(--muted)]">
                    {new Date(row.created_at).toLocaleDateString("en-GB")}
                    {row.used_channel ? ` · ${LABELS[row.used_channel]}` : ""}
                  </span>
                </button>
                {open === row.id && (
                  <div className="mt-3 space-y-3 text-sm">
                    <p>{row.output_instagram}</p>
                    <p>{row.output_facebook}</p>
                    <p>{row.output_whatsapp}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function DraftCard({
  channel,
  text,
  saved,
  used,
  onUse,
}: {
  channel: Channel;
  text: string;
  saved: boolean;
  used: boolean;
  onUse: () => void;
}) {
  const limit = LIMITS[channel];
  const over = text.length > limit;
  const pct = Math.min(100, (text.length / limit) * 100);

  return (
    <article className="rounded-[3px] border border-[var(--line)] bg-[var(--card)]">
      <div className="flex items-baseline justify-between px-4 pt-3">
        <span className="text-sm font-medium">{LABELS[channel]}</span>
        <span className="mono text-xs" style={{ color: over ? "var(--over)" : "var(--muted)" }}>
          {text.length}/{limit}
        </span>
      </div>

      <div className="mt-2 h-px w-full bg-[var(--line)]">
        <div
          className="h-px"
          style={{ width: `${pct}%`, background: over ? "var(--over)" : "var(--thread)" }}
        />
      </div>

      <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed">{text}</p>

      <div className="flex gap-4 px-4 pb-3">
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          className="mono text-xs text-[var(--muted)] underline underline-offset-4"
        >
          Copy
        </button>
        {saved && (
          <button
            onClick={onUse}
            className="mono text-xs underline underline-offset-4"
            style={{ color: used ? "var(--thread)" : "var(--muted)" }}
          >
            {used ? "Used this ✓" : "Used this"}
          </button>
        )}
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--muted)]">
        {label}
        {required && " *"}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[3px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--muted)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[3px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "" ? "Not specified" : o}
          </option>
        ))}
      </select>
    </label>
  );
}
