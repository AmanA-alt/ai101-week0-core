"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Msg = { role: "customer" | "agent"; text: string };
type Line = { itemId: string; name: string; size: string; qty: number; priceMxn: number };

type Order = {
  id: string;
  created_at: string;
  customer_label: string | null;
  item_count: number;
  subtotal_mxn: number;
  status: string;
};

const OPENING: Msg = {
  role: "agent",
  text: "Hi! Ask me about anything in the catalog — sizes, prices, measurements — and I'll put together your basket.",
};

const SUGGESTIONS = [
  "do you have the linen blouse in M?",
  "do you have it in L?",
  "what fabric is it and how do I wash it?",
];

export default function CorePage() {
  const [messages, setMessages] = useState<Msg[]>([OPENING]);
  const [basket, setBasket] = useState<Line[]>([]);
  const [gaps, setGaps] = useState("none");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data.rows ?? []);
    } catch {
      /* pending list is non-critical */
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || cooldown > 0) return;

    const next: Msg[] = [...messages, { role: "customer", text: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    setSentId(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setCooldown(data.retryAfterSeconds ?? 60);
        setError("The model rate limit was reached. Your conversation is saved — wait and try again.");
        return;
      }
      if (!res.ok) {
        setError(data.message ?? "The agent could not reply.");
        return;
      }

      setMessages([...next, { role: "agent", text: data.reply }]);
      setBasket(data.basket ?? []);
      setGaps(data.gaps ?? "none");
    } catch {
      setError("No response from the server.");
    } finally {
      setLoading(false);
    }
  }

  async function sendForReview() {
    if (basket.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basket, transcript: messages }),
      });
      if (!res.ok) {
        setError("The basket could not be saved.");
        return;
      }
      const data = await res.json();
      setSentId(data.id);
      loadOrders();
    } finally {
      setSaving(false);
    }
  }

  const subtotal = basket.reduce((s, l) => s + l.priceMxn * l.qty, 0);
  const busy = loading || cooldown > 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--line)] pb-4">
        <h1 className="m-0 text-2xl font-medium tracking-tight">Sales agent</h1>
        <Link
          href="/core/prompts"
          className="mono text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--thread)]"
        >
          Prompt library
        </Link>
      </header>

      <p className="mono mb-6 rounded-[3px] border border-[var(--line)] bg-[var(--card)] px-4 py-2.5 text-xs text-[var(--muted)]">
        Simulated WhatsApp conversation. Not connected to the real WhatsApp API — the
        conversation and basket logic are real, only the transport is simulated.
      </p>

      <div className="grid gap-8 md:grid-cols-[3fr_2fr]">
        <section>
          <div className="min-h-[320px] rounded-[3px] border border-[var(--line)] bg-[var(--card)] p-4">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "customer" ? "flex justify-end" : "flex justify-start"}
                >
                  <p
                    className={
                      m.role === "customer"
                        ? "m-0 max-w-[80%] rounded-[10px] bg-[var(--thread)] px-3 py-2 text-sm leading-relaxed text-white"
                        : "m-0 max-w-[85%] rounded-[10px] border border-[var(--line)] bg-white px-3 py-2 text-sm leading-relaxed"
                    }
                  >
                    {m.text}
                  </p>
                </div>
              ))}
              {loading && (
                <p className="mono m-0 text-xs text-[var(--muted)]">The agent is typing…</p>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-[3px] border-l-2 border-[var(--caution)] bg-white px-4 py-3 text-sm">
              {error}
              {cooldown > 0 && <span className="mono"> Retry in {cooldown}s.</span>}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-3 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type as the customer…"
              className="flex-1 rounded-[3px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-[3px] bg-[var(--thread)] px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {cooldown > 0 ? `Wait ${cooldown}s` : "Send"}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={busy}
                className="mono rounded-[3px] border border-[var(--line)] px-2.5 py-1 text-[11px] text-[var(--muted)] disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="m-0 text-sm font-medium text-[var(--muted)]">Basket</h2>

          {basket.length === 0 ? (
            <p className="mt-3 rounded-[3px] border border-dashed border-[var(--line)] px-4 py-8 text-center text-sm text-[var(--muted)]">
              The basket fills as the customer adds items.
            </p>
          ) : (
            <div className="mt-3 rounded-[3px] border border-[var(--line)] bg-[var(--card)] p-4">
              <ul className="m-0 list-none divide-y divide-[var(--line)] p-0">
                {basket.map((l, i) => (
                  <li key={`${l.itemId}-${l.size}-${i}`} className="flex justify-between gap-3 py-2">
                    <span className="text-sm">
                      {l.name}
                      <span className="mono text-xs text-[var(--muted)]">
                        {" "}
                        · {l.size} · ×{l.qty}
                      </span>
                    </span>
                    <span className="mono shrink-0 text-sm">${l.priceMxn * l.qty}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-[var(--line)] pt-3">
                <span className="text-sm font-medium">Subtotal</span>
                <span className="mono text-sm font-medium">${subtotal} MXN</span>
              </div>
              <button
                onClick={sendForReview}
                disabled={saving || !!sentId}
                className="mono mt-4 w-full rounded-[3px] border border-[var(--thread)] px-3 py-2 text-xs text-[var(--thread)] disabled:opacity-40"
              >
                {sentId ? "Sent for review" : saving ? "Sending…" : "Send to human review"}
              </button>
            </div>
          )}

          {gaps && gaps.toLowerCase() !== "none" && (
            <div className="mt-4 rounded-[3px] border border-[var(--caution)] bg-white p-3">
              <p className="mono m-0 mb-1 text-[11px] text-[var(--caution)]">
                Not in the catalog — needs a human
              </p>
              <p className="m-0 text-sm leading-relaxed">{gaps}</p>
            </div>
          )}
        </section>
      </div>

      <section className="mt-14 border-t border-[var(--line)] pt-6">
        <h2 className="m-0 text-sm font-medium text-[var(--muted)]">Pending review</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Baskets sent for review appear here. Nothing becomes an order until a human confirms it.
          </p>
        ) : (
          <ul className="mt-3 list-none divide-y divide-[var(--line)] p-0">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <span className="text-sm">{o.customer_label ?? "Customer"}</span>
                <span className="mono text-xs text-[var(--muted)]">
                  {o.item_count} items · ${o.subtotal_mxn} MXN ·{" "}
                  {new Date(o.created_at).toLocaleDateString("en-GB")}
                </span>
                <span className="mono shrink-0 rounded-[3px] border border-[var(--caution)] px-2 py-0.5 text-[11px] text-[var(--caution)]">
                  awaiting confirmation
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
