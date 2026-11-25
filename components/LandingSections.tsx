"use client";

import Link from "next/link";
import type { Lang } from "@/lib/marketing-data";
import { t, type Localized } from "@/lib/marketing-data";
import { TIERS, formatMxn } from "@/lib/pricing";
import Ghost, { type GhostState } from "./Ghost";
import Reveal from "./Reveal";

/**
 * The homepage pieces below the hero.
 *
 * Every claim here is something the product does today, or is labelled as an
 * example. No testimonials, no logos, no user counts: trust has to come from
 * what can be checked on the site itself.
 */

const STEPS: { state: GhostState; n: string; title: Localized; body: Localized }[] = [
  {
    state: "checking",
    n: "01",
    title: { es: "Revisa el inventario", en: "It checks the stock" },
    body: {
      es: "Cada respuesta sale del catálogo. Si una talla no está, lo dice en lugar de inventarla.",
      en: "Every answer comes from the catalog. If a size isn't there, it says so instead of inventing it.",
    },
  },
  {
    state: "talking",
    n: "02",
    title: { es: "Responde y arma el pedido", en: "It replies and builds the basket" },
    body: {
      es: "Contesta en español, suma el total y repite el pedido completo para que nadie se pierda.",
      en: "It answers in Spanish, totals the basket and restates it in full so nobody loses track.",
    },
  },
  {
    state: "handoff",
    n: "03",
    title: { es: "Te lo pasa a ti", en: "It hands it to you" },
    body: {
      es: "El pedido queda pendiente de revisión. Nada se confirma hasta que tú lo decides.",
      en: "The basket waits as pending review. Nothing is confirmed until you decide.",
    },
  },
];

type Bubble = { from: "customer" | "agent"; text: Localized };

const EXAMPLE: Bubble[] = [
  {
    from: "customer",
    text: { es: "¿Tienes la blusa de lino en M?", en: "Do you have the linen blouse in M?" },
  },
  {
    from: "agent",
    text: {
      es: "Sí, la blusa de lino de manga corta está en M, a $690. ¿La agrego a tu pedido?",
      en: "Yes, the short-sleeve linen blouse is in stock in M, at $690. Shall I add it to your basket?",
    },
  },
  {
    from: "customer",
    text: { es: "¿Y en L?", en: "And in L?" },
  },
  {
    from: "agent",
    text: {
      es: "En L no la tengo, solo S y M. Le paso tu pregunta a la dueña por si llega más.",
      en: "Not in L, only S and M. I'll pass your question to the owner in case more arrives.",
    },
  },
];

const PROMISES: { title: Localized; body: Localized }[] = [
  {
    title: { es: "Nunca inventa inventario", en: "Never invents stock" },
    body: {
      es: "Si no puede confirmarlo en el catálogo, no lo afirma.",
      en: "If it cannot confirm it in the catalog, it does not claim it.",
    },
  },
  {
    title: { es: "Nunca confirma por ti", en: "Never confirms for you" },
    body: {
      es: "Cada pedido espera tu revisión antes de existir.",
      en: "Every basket waits for your review before it becomes an order.",
    },
  },
  {
    title: { es: "Dice lo que es simulado", en: "Labels what is simulated" },
    body: {
      es: "La conversación de WhatsApp aún es una simulación, y la página lo dice.",
      en: "The WhatsApp conversation is still simulated, and the page says so.",
    },
  },
];

export function HowItWorks({ lang }: { lang: Lang }) {
  return (
    <section className="border-b border-[var(--line)] py-16 md:py-24">
      <Reveal>
        <p className="mono m-0 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          {lang === "es" ? "El agente" : "The agent"}
        </p>
        <h2 className="display m-0 mt-3 max-w-[20ch] text-[clamp(1.8rem,4vw,2.8rem)] text-[var(--indigo)]">
          {lang === "es" ? "Tres pasos, y el último siempre es tuyo." : "Three steps, and the last one is always yours."}
        </h2>
      </Reveal>

      <ol className="mt-12 grid list-none gap-5 p-0 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 110}>
            <li className="lift-card flex h-full flex-col rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6">
              <div className="flex items-start justify-between">
                <span className="mono text-xs text-[var(--muted)]">{s.n}</span>
                <span className="grid h-[92px] w-[92px] place-items-center rounded-full bg-[var(--indigo)]">
                  <Ghost size={58} state={s.state} motion="once" label={t(s.title, lang)} />
                </span>
              </div>
              <h3 className="m-0 mt-6 text-[1.05rem] font-medium tracking-[-0.01em]">{t(s.title, lang)}</h3>
              <p className="m-0 mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{t(s.body, lang)}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function ExampleChat({ lang }: { lang: Lang }) {
  return (
    <section className="grid items-center gap-12 border-b border-[var(--line)] py-16 md:grid-cols-2 md:py-24">
      <Reveal>
        <p className="mono m-0 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          {lang === "es" ? "En una conversación" : "In a conversation"}
        </p>
        <h2 className="display m-0 mt-3 text-[clamp(1.8rem,4vw,2.8rem)] text-[var(--indigo)]">
          {lang === "es" ? "Dice que no cuando no hay." : "It says no when there is none."}
        </h2>
        <p className="m-0 mt-4 max-w-[46ch] text-[15px] leading-relaxed text-[var(--muted)]">
          {lang === "es"
            ? "La segunda respuesta es la que importa. Un agente que promete una talla que no existe le cuesta una clienta a tu negocio."
            : "The second answer is the one that matters. An agent that promises a size that doesn't exist costs your business a customer."}
        </p>
        <Link href="/core" className="nav-cta mt-8 inline-flex">
          {lang === "es" ? "Pruébalo tú" : "Try it yourself"}
          <span aria-hidden="true" className="nav-cta-arrow">→</span>
        </Link>
      </Reveal>

      <Reveal delay={120}>
        <figure className="m-0 mx-auto w-full max-w-[360px] rounded-[30px] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[0_30px_60px_-40px_var(--ink)]">
          <div className="flex items-center gap-3 rounded-t-[22px] bg-[var(--indigo)] px-4 py-3 text-[var(--bone)]">
            <Ghost size={30} motion="none" label="Bastilla" />
            <div>
              <p className="m-0 text-sm font-medium">Bastilla</p>
              <p className="m-0 text-[11px] text-[var(--bone)]/65">{lang === "es" ? "agente de ventas" : "sales agent"}</p>
            </div>
          </div>
          <div className="space-y-2.5 rounded-b-[22px] bg-[var(--bone)] px-3 py-4">
            {EXAMPLE.map((b, i) => (
              <Reveal key={i} delay={250 + i * 260}>
                <p
                  className={`m-0 max-w-[82%] rounded-[14px] px-3 py-2 text-[13px] leading-relaxed ${
                    b.from === "customer"
                      ? "ml-auto rounded-br-[4px] bg-[var(--indigo)] text-[var(--bone)]"
                      : "rounded-bl-[4px] border border-[var(--line)] bg-[var(--surface)]"
                  }`}
                >
                  {t(b.text, lang)}
                </p>
              </Reveal>
            ))}
          </div>
          <figcaption className="mono px-2 pb-1 pt-3 text-center text-[11px] text-[var(--muted)]">
            {lang === "es" ? "Ejemplo ilustrativo. El agente real está en /core." : "Illustrative example. The live agent is on /core."}
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}

export function Promises({ lang }: { lang: Lang }) {
  return (
    <section className="border-b border-[var(--line)] py-16 md:py-24">
      <Reveal>
        <p className="mono m-0 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          {lang === "es" ? "Lo que prometemos" : "What we promise"}
        </p>
        <h2 className="display m-0 mt-3 max-w-[22ch] text-[clamp(1.8rem,4vw,2.8rem)] text-[var(--indigo)]">
          {lang === "es" ? "Reglas que el agente no puede romper." : "Rules the agent cannot break."}
        </h2>
      </Reveal>
      <ul className="mt-10 grid list-none gap-px overflow-hidden rounded-[18px] border border-[var(--line)] bg-[var(--line)] p-0 md:grid-cols-3">
        {PROMISES.map((p, i) => (
          <Reveal key={p.title.en} delay={i * 90} className="h-full">
            <li className="h-full bg-[var(--bone)] p-6">
              <span aria-hidden="true" className="mono text-[var(--indigo)]">✕</span>
              <h3 className="m-0 mt-3 text-[1rem] font-medium">{t(p.title, lang)}</h3>
              <p className="m-0 mt-1.5 text-[14px] leading-relaxed text-[var(--muted)]">{t(p.body, lang)}</p>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export function PricingTeaser({ lang }: { lang: Lang }) {
  return (
    <section className="border-b border-[var(--line)] py-16 md:py-24">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mono m-0 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              {lang === "es" ? "Precios" : "Pricing"}
            </p>
            <h2 className="display m-0 mt-3 text-[clamp(1.8rem,4vw,2.8rem)] text-[var(--indigo)]">
              {lang === "es" ? "Un plan por tamaño de negocio." : "One plan per size of business."}
            </h2>
          </div>
          <Link href="/pricing" className="text-sm text-[var(--indigo)] underline underline-offset-4">
            {lang === "es" ? "Ver el detalle" : "See the details"}
          </Link>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3 md:items-center">
        {TIERS.map((tier, i) => (
          <Reveal key={tier.id} delay={i * 90}>
            <div
              className={`lift-card rounded-[18px] p-6 ${
                tier.lead
                  ? "bg-[var(--indigo)] text-[var(--bone)] md:py-9 shadow-[0_24px_50px_-30px_var(--indigo)]"
                  : "border border-[var(--line)] bg-[var(--surface)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`m-0 text-sm ${tier.lead ? "text-[var(--bone)]/75" : "text-[var(--muted)]"}`}>{tier.name}</p>
                {tier.lead && (
                  <span className="rounded-full bg-[var(--bone)] px-3 py-1 text-xs font-medium text-[var(--indigo)]">
                    {lang === "es" ? "Recomendado" : "Recommended"}
                  </span>
                )}
              </div>
              <p className="num m-0 mt-2 text-[2.2rem] font-medium leading-none tracking-[-0.035em]">
                {formatMxn(tier.priceMxn)}
                <small className={`ml-1 text-[0.85rem] font-normal ${tier.lead ? "text-[var(--bone)]/70" : "text-[var(--muted)]"}`}>
                  MXN/mo
                </small>
              </p>
              <p className={`m-0 mt-2 text-[13px] ${tier.lead ? "text-[var(--bone)]/80" : "text-[var(--indigo)]"}`}>{tier.segment}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function ClosingBand({ lang }: { lang: Lang }) {
  return (
    <section className="relative z-[1] bg-[var(--deep)] text-[var(--bone)]">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 py-20 md:flex-row md:items-center md:justify-between">
        <Reveal>
          <h2 className="display m-0 max-w-[18ch] text-[clamp(1.8rem,4vw,2.8rem)]">
            {lang === "es" ? "Deja que conteste. Tú decides." : "Let it answer. You decide."}
          </h2>
          <p className="m-0 mt-3 max-w-[44ch] text-[15px] text-[var(--bone)]/70">
            {lang === "es"
              ? "Prueba el agente con el catálogo de ejemplo. No necesitas cuenta."
              : "Try the agent on the sample catalog. No account needed."}
          </p>
        </Reveal>
        <Reveal delay={120} className="flex items-center gap-6">
          <Ghost size={84} state="idle" motion="loop" />
          <Link
            href="/core"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[var(--bone)] px-6 text-sm font-medium text-[var(--deep)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            {lang === "es" ? "Abrir el agente" : "Open the agent"} <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
