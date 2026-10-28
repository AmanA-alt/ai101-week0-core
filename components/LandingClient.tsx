"use client";

import Link from "next/link";
import { LANDING, t } from "@/lib/marketing-data";
import { useLang } from "./useClientState";
import HeroExperiment from "./HeroExperiment";
import ColumnRules from "./ColumnRules";
import Reveal from "./Reveal";

/**
 * The landing page.
 *
 * One client component rather than a server page with two islands, because
 * reading language is shared state: two islands each calling useLang would
 * read the same stored value on load and then drift the moment one of them
 * toggled. One owner, passed down.
 */

type Status = "shipped" | "building" | "planned";

const ROADMAP: { title: { es: string; en: string }; status: Status }[] = [
  {
    title: {
      es: "El agente: responde desde el catálogo y arma el pedido",
      en: "The agent: answers from the catalog and builds the basket",
    },
    status: "shipped",
  },
  {
    title: {
      es: "Confirmación humana antes de cualquier pedido",
      en: "Human confirmation before any order",
    },
    status: "shipped",
  },
  {
    title: {
      es: "Precios y simulador de ingresos",
      en: "Pricing and revenue simulator",
    },
    status: "shipped",
  },
  {
    title: {
      es: "Subir tu inventario desde una hoja de cálculo",
      en: "Import your inventory from a spreadsheet",
    },
    status: "building",
  },
  {
    title: { es: "Apartados", en: "Layaway tracking" },
    status: "planned",
  },
  {
    title: {
      es: "WhatsApp oficial, en lugar del transporte simulado",
      en: "Official WhatsApp, replacing the simulated transport",
    },
    status: "planned",
  },
];

const PILL: Record<Status, { label: { es: string; en: string }; className: string }> = {
  shipped: {
    label: { es: "ya funciona", en: "shipped" },
    className: "border-[var(--indigo)] text-[var(--indigo)]",
  },
  building: {
    label: { es: "en construcción", en: "building" },
    className: "border-[var(--caution)] text-[var(--caution)]",
  },
  planned: {
    label: { es: "planeado", en: "planned" },
    className: "border-[var(--line)] text-[var(--muted)]",
  },
};

export default function LandingClient() {
  const [lang, setLang, langReady] = useLang();

  return (
    <>
      <ColumnRules />

      <section className="relative z-[1] bg-[var(--indigo)] text-[var(--bone)]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <HeroExperiment lang={lang} setLang={setLang} langReady={langReady} />
        </div>
      </section>

      <main className="relative z-[1] mx-auto max-w-5xl px-6">
        <section className="grid gap-8 border-b border-[var(--line)] py-16 md:grid-cols-3 md:py-20">
          {LANDING.props.map((p, i) => (
            <Reveal key={p.title.en} delay={i * 70}>
              <h2 className="m-0 text-[1.05rem] font-medium tracking-[-0.01em]">{t(p.title, lang)}</h2>
              <p className="m-0 mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
                {t(p.body, lang)}
              </p>
            </Reveal>
          ))}
        </section>

        <section className="py-16 md:py-20">
          <Reveal>
            <h2 className="display m-0 text-[clamp(1.5rem,3vw,2.1rem)] text-[var(--indigo)]">
              {lang === "es" ? "Qué funciona hoy" : "What works today"}
            </h2>
            <p className="m-0 mt-3 max-w-[52ch] text-sm text-[var(--muted)]">
              {t(LANDING.roadmapNote, lang)}
            </p>
          </Reveal>

          <ul className="mt-8 list-none divide-y divide-[var(--line)] p-0">
            {ROADMAP.map((r, i) => (
              <Reveal key={r.title.en} delay={Math.min(i, 4) * 50}>
                <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4">
                  <span className="flex-1 text-sm">{t(r.title, lang)}</span>
                  <span
                    className={`mono shrink-0 rounded-[3px] border px-2 py-0.5 text-[11px] ${PILL[r.status].className}`}
                  >
                    {t(PILL[r.status].label, lang)}
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={120}>
            <p className="mt-10 text-sm text-[var(--muted)]">
              {lang === "es" ? "El sistema de contenido y la prueba A/B viven en " : "The content system and the A/B test live on "}
              <Link href="/marketing" className="underline underline-offset-4 hover:text-[var(--indigo)]">
                /marketing
              </Link>
              .
            </p>
          </Reveal>
        </section>
      </main>
    </>
  );
}
