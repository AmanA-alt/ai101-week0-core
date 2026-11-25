"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  INTAKE,
  answer,
  basketTotal,
  classify,
  isComplete,
  nearMisses,
  needsHuman,
  recommend,
  type BasketLine,
  type Budget,
  type Intake,
  type Kind,
  type Size,
} from "@/lib/guided";
import { t, type Lang } from "@/lib/i18n";
import { useLang, useVisitorId } from "./useClientState";
import ColumnRules from "./ColumnRules";

/**
 * The public assistant at /chat.
 *
 * Deliberately not the same surface as /core. /core is the operator's view,
 * where I watch the agent work on my own catalog. This is the customer's view:
 * guided first, free text second, and it never shows anything it cannot
 * source. The two share the catalog and nothing else.
 *
 * Every answer is produced by lib/guided, which is pure and deterministic. No
 * model call happens on this page. That is a product decision rather than a
 * shortcut: the one thing a customer must be able to trust is whether a size
 * exists, and that answer should be identical every time it is asked.
 */

type Msg = {
  id: number;
  from: "bot" | "user";
  text: string;
  /** Set on bot turns the guardrail produced, so the UI can mark them. */
  flagged?: boolean;
  handoff?: boolean;
};

const COPY = {
  title: { es: "Pregúntale al catálogo", en: "Ask the catalog" },
  lede: {
    es: "Tres preguntas rápidas y te digo qué hay en tu talla. Nada se convierte en pedido hasta que una persona lo confirme.",
    en: "Three quick questions and I will tell you what is in your size. Nothing becomes an order until a person confirms it.",
  },
  simulated: {
    es: "Demostración. El transporte de WhatsApp está simulado; el catálogo y las respuestas son reales.",
    en: "Demo. The WhatsApp transport is simulated; the catalog and the answers are real.",
  },
  placeholder: { es: "Escribe tu pregunta", en: "Type your question" },
  send: { es: "Enviar", en: "Send" },
  restart: { es: "Empezar de nuevo", en: "Start over" },
  basket: { es: "Tu pedido", en: "Your basket" },
  empty: { es: "Todavía no has agregado nada.", en: "Nothing added yet." },
  total: { es: "Total", en: "Total" },
  add: { es: "Agregar", en: "Add" },
  review: { es: "Enviar a revisión", en: "Send for review" },
  reviewNote: {
    es: "Esto no es un pedido. Le llega a la vendedora para que ella lo confirme.",
    en: "This is not an order. It goes to the seller so she can confirm it.",
  },
  sent: {
    es: "Enviado a revisión. La vendedora lo confirma contigo.",
    en: "Sent for review. The seller will confirm it with you.",
  },
  handoff: { es: "Te paso con una persona", en: "Handing you to a person" },
  rate: { es: "¿Te sirvió?", en: "Was this useful?" },
  thanks: { es: "Gracias.", en: "Thanks." },
  matches: { es: "Esto tengo en tu talla", en: "This is what I have in your size" },
  noMatches: {
    es: "En tu talla y presupuesto no tengo nada ahora mismo. Esto es lo más cercano.",
    en: "Nothing in your size and budget right now. This is the closest I have.",
  },
  nothingAtAll: {
    es: "No tengo nada de eso ahora mismo. Te paso con la vendedora.",
    en: "I have nothing like that right now. Let me hand you to the seller.",
  },
} as const;

const money = (n: number) => `$${n.toLocaleString("es-MX")}`;

export default function ChatClient() {
  const [lang, setLang, langReady] = useLang();
  const visitorId = useVisitorId();

  const [step, setStep] = useState(0);
  const [intake, setIntake] = useState<Partial<Intake>>({});
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [basket, setBasket] = useState<BasketLine[]>([]);
  const [offered, setOffered] = useState<BasketLine[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [rated, setRated] = useState(false);

  const nextId = useRef(0);
  const log = useRef<HTMLDivElement>(null);

  const push = useCallback((m: Omit<Msg, "id">) => {
    setMsgs((prev) => [...prev, { ...m, id: nextId.current++ }]);
  }, []);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  /* --------------------------------------------------------- the intake */

  function choose(value: string) {
    const current = INTAKE[step]!;
    const label = current.options.find((o) => o.value === value)!;
    const merged = { ...intake, [current.id]: value } as Partial<Intake>;

    push({ from: "user", text: t(label.label, lang) });
    setIntake(merged);

    if (step + 1 < INTAKE.length) {
      setStep(step + 1);
      return;
    }

    if (!isComplete(merged)) return;

    const matches = recommend(merged);
    const closest = matches.length ? matches : nearMisses(merged);

    if (!closest.length) {
      push({ from: "bot", text: t(COPY.nothingAtAll, lang), flagged: true, handoff: true });
      setStep(step + 1);
      return;
    }

    push({
      from: "bot",
      text: matches.length ? t(COPY.matches, lang) : t(COPY.noMatches, lang),
      flagged: matches.length === 0,
    });

    setOffered(
      closest.map((i) => ({
        id: i.id,
        name: i.name,
        priceMxn: i.priceMxn,
        // Offer the size she asked for when it exists, otherwise the first
        // one that does. Never offer a size the catalog does not hold.
        size: (i.sizesInStock.includes(merged.size!) ? merged.size! : i.sizesInStock[0]) as Size,
      }))
    );
    setStep(step + 1);
  }

  /* ------------------------------------------------------- the free text */

  function ask(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    push({ from: "user", text });
    setQuestions((q) => [...q, text]);
    setDraft("");

    const verdict = classify(text);
    push({
      from: "bot",
      text: answer(verdict, lang),
      flagged: verdict.kind !== "in_catalog" && verdict.kind !== "shipping",
      handoff: needsHuman(verdict),
    });
  }

  function add(line: BasketLine) {
    setBasket((b) => (b.some((x) => x.id === line.id && x.size === line.size) ? b : [...b, line]));
  }

  async function sendForReview() {
    if (!visitorId || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "save",
          visitorId,
          lang,
          intake: isComplete(intake) ? intake : null,
          questions,
          basket: basket.map(({ id, size }) => ({ id, size })),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setSessionId(json.sessionId ?? null);
        push({ from: "bot", text: t(COPY.sent, lang) });
      }
    } finally {
      setSending(false);
    }
  }

  async function rate(rating: "up" | "down") {
    if (!visitorId || rated) return;
    setRated(true);
    await fetch("/api/chat-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "feedback", visitorId, sessionId, rating }),
    }).catch(() => undefined);
  }

  function restart() {
    setStep(0);
    setIntake({});
    setMsgs([]);
    setBasket([]);
    setOffered([]);
    setQuestions([]);
    setSessionId(null);
    setRated(false);
  }

  const intakeDone = step >= INTAKE.length;
  const current = INTAKE[step];

  return (
    <>
      <ColumnRules />

      <main className="relative z-[1] mx-auto max-w-3xl px-6 py-14 md:py-20">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="display m-0 text-[clamp(1.9rem,5vw,3rem)] text-[var(--indigo)]">
              {t(COPY.title, lang)}
            </h1>
            <p className="m-0 mt-3 max-w-[48ch] text-sm leading-relaxed text-[var(--muted)]">
              {t(COPY.lede, lang)}
            </p>
          </div>
          {langReady && (
            <button
              type="button"
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="mono shrink-0 rounded-[3px] border border-[var(--line)] px-2.5 py-1 text-[11px] text-[var(--muted)] hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
          )}
        </header>

        <p className="mono mt-6 rounded-[3px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[11px] text-[var(--muted)]">
          {t(COPY.simulated, lang)}
        </p>

        <div
          ref={log}
          className="mt-6 max-h-[22rem] overflow-y-auto rounded-[3px] border border-[var(--line)] bg-[var(--surface)] p-4"
        >
          {msgs.length === 0 && (
            <p className="m-0 text-sm text-[var(--muted)]">{t(INTAKE[0]!.question, lang)}</p>
          )}
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {msgs.map((m) => (
              <li
                key={m.id}
                className={`max-w-[85%] rounded-[3px] px-3 py-2 text-sm leading-relaxed ${
                  m.from === "user"
                    ? "self-end bg-[var(--indigo)] text-[var(--bone)]"
                    : m.flagged
                      ? "self-start border border-[var(--cochineal)] bg-[var(--cochineal-soft)] text-[var(--ink)]"
                      : "self-start border border-[var(--line)] bg-[var(--bone)]"
                }`}
              >
                {m.text}
                {m.handoff && (
                  <span className="mono mt-2 block text-[10px] uppercase tracking-[0.12em] text-[var(--cochineal)]">
                    {t(COPY.handoff, lang)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {!intakeDone && current && (
          <section className="mt-5">
            <p className="m-0 text-sm font-medium">{t(current.question, lang)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {current.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => choose(o.value)}
                  className="rounded-[3px] border border-[var(--line)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
                >
                  {t(o.label, lang)}
                </button>
              ))}
            </div>
            <p className="mono mt-3 text-[11px] text-[var(--muted)]">
              {step + 1} / {INTAKE.length}
            </p>
          </section>
        )}

        {intakeDone && offered.length > 0 && (
          <section className="mt-6 grid gap-3">
            {offered.map((o) => (
              <div
                key={`${o.id}-${o.size}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-[var(--line)] px-3 py-2.5"
              >
                <span className="text-sm">
                  {o.name}{" "}
                  <span className="mono text-[11px] text-[var(--muted)]">
                    {o.size} · {money(o.priceMxn)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => add(o)}
                  className="mono rounded-[3px] border border-[var(--line)] px-2.5 py-1 text-[11px] hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
                >
                  {t(COPY.add, lang)}
                </button>
              </div>
            ))}
          </section>
        )}

        {intakeDone && (
          <form onSubmit={ask} className="mt-6 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t(COPY.placeholder, lang)}
              aria-label={t(COPY.placeholder, lang)}
              className="min-w-0 flex-1 rounded-[3px] border border-[var(--line)] bg-[var(--bone)] px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="mono rounded-[3px] border border-[var(--indigo)] px-3 py-2 text-[11px] text-[var(--indigo)]"
            >
              {t(COPY.send, lang)}
            </button>
          </form>
        )}

        <section className="mt-10 border-t border-[var(--line)] pt-6">
          <h2 className="m-0 text-[1.05rem] font-medium">{t(COPY.basket, lang)}</h2>
          {basket.length === 0 ? (
            <p className="m-0 mt-2 text-sm text-[var(--muted)]">{t(COPY.empty, lang)}</p>
          ) : (
            <>
              <ul className="m-0 mt-3 list-none divide-y divide-[var(--line)] p-0">
                {basket.map((l) => (
                  <li key={`${l.id}-${l.size}`} className="flex justify-between py-2 text-sm">
                    <span>
                      {l.name} <span className="mono text-[11px] text-[var(--muted)]">{l.size}</span>
                    </span>
                    <span className="num">{money(l.priceMxn)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex justify-between text-sm font-medium">
                <span>{t(COPY.total, lang)}</span>
                <span className="num">{money(basketTotal(basket))}</span>
              </p>
            </>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={sendForReview}
              disabled={basket.length === 0 || sending || Boolean(sessionId)}
              className="rounded-[3px] border border-[var(--indigo)] bg-[var(--indigo)] px-4 py-2 text-sm text-[var(--bone)] disabled:opacity-40"
            >
              {t(COPY.review, lang)}
            </button>
            <button
              type="button"
              onClick={restart}
              className="mono text-[11px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--indigo)]"
            >
              {t(COPY.restart, lang)}
            </button>
          </div>
          <p className="mono mt-3 text-[11px] text-[var(--muted)]">{t(COPY.reviewNote, lang)}</p>
        </section>

        <section className="mt-8 border-t border-[var(--line)] pt-6">
          <h2 className="m-0 text-[1.05rem] font-medium">{t(COPY.rate, lang)}</h2>
          {rated ? (
            <p className="m-0 mt-2 text-sm text-[var(--muted)]">{t(COPY.thanks, lang)}</p>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => rate("up")}
                aria-label={lang === "es" ? "Sí, me sirvió" : "Yes, useful"}
                className="rounded-[3px] border border-[var(--line)] px-4 py-1.5 text-sm hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => rate("down")}
                aria-label={lang === "es" ? "No me sirvió" : "Not useful"}
                className="rounded-[3px] border border-[var(--line)] px-4 py-1.5 text-sm hover:border-[var(--cochineal)] hover:text-[var(--cochineal)]"
              >
                ✕
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
