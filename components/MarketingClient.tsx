"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EXPERIMENTS, assignVariant, type ExperimentId, type VariantCount } from "@/lib/ab";
import {
  PERSONA,
  LANDING,
  HEADLINES,
  CTAS,
  POSTS,
  SCRIPTS,
  CALENDAR,
  STAGE_LABEL,
  t,
  type Lang,
} from "@/lib/marketing-data";
import { useLang, useVisitorId } from "./useClientState";
import CopyButton from "./CopyButton";
import ColumnRules from "./ColumnRules";
import Reveal from "./Reveal";

type AbResult = {
  id: ExperimentId;
  question: string;
  metric: string;
  counts: VariantCount[];
  callable: boolean;
  minToCall: number;
};

type SavedAsset = {
  id: string;
  created_at: string;
  kind: string;
  label: string;
  channel: string | null;
  lang: string;
  body: string;
};

const COPY = {
  brand: { es: "Sistema de marca", en: "Brand system" },
  persona: { es: "A quién le hablamos", en: "Who we are talking to" },
  landing: { es: "Texto de la página", en: "Landing page copy" },
  posts: { es: "Publicaciones", en: "Social posts" },
  scripts: { es: "Guiones de video", en: "Video scripts" },
  calendar: { es: "Campaña de 14 días", en: "14-day campaign" },
  ab: { es: "Prueba A/B en vivo", en: "Live A/B test" },
  saved: { es: "Guardados", en: "Saved" },
  copy: { es: "Copiar", en: "Copy" },
  copied: { es: "Copiado", en: "Copied" },
  save: { es: "Guardar", en: "Save" },
  day: { es: "Día", en: "Day" },
  nothingSaved: { es: "Nada guardado todavía.", en: "Nothing saved yet." },
  youSee: { es: "Tú ves esta variante", en: "You are seeing this variant" },
};

export default function MarketingClient() {
  const [lang, setLang] = useLang();
  const visitorId = useVisitorId();
  const [results, setResults] = useState<AbResult[]>([]);
  const [saved, setSaved] = useState<SavedAsset[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    try {
      const r = await fetch("/api/ab", { cache: "no-store" });
      if (!r.ok) return;
      const json = await r.json();
      setResults(json.results ?? []);
    } catch {
      /* The page is still useful without live counts. */
    }
  }, []);

  const loadSaved = useCallback(async () => {
    try {
      const r = await fetch("/api/assets", { cache: "no-store" });
      if (!r.ok) return;
      const json = await r.json();
      setSaved(json.rows ?? []);
    } catch {
      /* Same. */
    }
  }, []);

  useEffect(() => {
    void loadResults();
    void loadSaved();
  }, [loadResults, loadSaved]);

  const save = useCallback(
    async (kind: string, label: string, channel: string | null, body: string, id: string) => {
      setSavingId(id);
      try {
        await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, label, channel, lang, body }),
        });
        await loadSaved();
      } catch {
        /* Nothing to recover; the content is still on the page. */
      } finally {
        setSavingId(null);
      }
    },
    [lang, loadSaved]
  );

  const myVariants = useMemo(() => {
    if (!visitorId) return null;
    return {
      headline: assignVariant(visitorId, "headline"),
      cta: assignVariant(visitorId, "cta"),
    };
  }, [visitorId]);

  return (
    <>
      <ColumnRules />
      <main className="relative z-[1] mx-auto max-w-5xl px-6">
        <Hero lang={lang} setLang={setLang} />
        <BrandSystem lang={lang} />
        <Persona lang={lang} />
        <LandingCopy lang={lang} myVariants={myVariants} onSave={save} savingId={savingId} />
        <Posts lang={lang} onSave={save} savingId={savingId} />
        <Scripts lang={lang} onSave={save} savingId={savingId} />
        <Calendar lang={lang} />
        <AbPanel lang={lang} results={results} myVariants={myVariants} />
        <Saved lang={lang} saved={saved} />
      </main>
    </>
  );
}

/* ------------------------------------------------------------------ hero */

function Hero({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <section className="border-b border-[var(--line)] py-20 md:py-28">
      <div className="mb-10 flex items-center gap-1 text-[13px] text-[var(--muted)]">
        <button
          type="button"
          onClick={() => setLang("es")}
          aria-pressed={lang === "es"}
          className={lang === "es" ? "text-[var(--indigo)] underline underline-offset-4" : "hover:text-[var(--indigo)]"}
        >
          Esp
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => setLang("en")}
          aria-pressed={lang === "en"}
          className={lang === "en" ? "text-[var(--indigo)] underline underline-offset-4" : "hover:text-[var(--indigo)]"}
        >
          Eng
        </button>
      </div>
      <h1 className="display m-0 max-w-[17ch] text-[clamp(2.2rem,6.5vw,4.4rem)] text-[var(--indigo)]">
        {lang === "es" ? "Una sola historia, dicha en todos lados." : "One story, told everywhere."}
      </h1>
      <p className="mt-6 max-w-[54ch] text-[clamp(1rem,1.6vw,1.1rem)] leading-relaxed text-[var(--muted)]">
        {lang === "es"
          ? "El sistema de contenido completo: marca, persona, texto, publicaciones, guiones, calendario y la prueba A/B que corre en la portada ahora mismo."
          : "The whole content system: brand, persona, copy, posts, scripts, calendar, and the A/B test running on the landing page right now."}
      </p>
    </section>
  );
}

/* ---------------------------------------------------------- brand system */

const SWATCHES = [
  {
    name: "Añil",
    hex: "#243A68",
    css: "var(--indigo)",
    use: { es: "Estructura, texto e interacción", en: "Structure, text and interaction" },
  },
  {
    name: "Hueso",
    hex: "#E4E2DF",
    css: "var(--bone)",
    use: { es: "Fondo, y texto sobre oscuro", en: "Background, and text on dark" },
  },
  {
    name: "Tinta",
    hex: "#2A281F",
    css: "var(--deep)",
    use: { es: "Secciones a sangre completa", en: "Full-bleed sections" },
  },
  {
    name: "Cochinilla",
    hex: "#9B2340",
    css: "var(--cochineal)",
    use: { es: "Solo alertas y la variante activa", en: "Alerts and the live variant only" },
  },
];

function BrandSystem({ lang }: { lang: Lang }) {
  return (
    <Section id="brand" title={COPY.brand[lang]} lang={lang}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SWATCHES.map((s) => (
          <div key={s.hex} className="rounded-[14px] border border-[var(--line)] overflow-hidden">
            <div className="h-20" style={{ background: s.css }} />
            <div className="p-4">
              <p className="m-0 text-sm font-medium">{s.name}</p>
              <p className="mono m-0 mt-1 text-[11px] text-[var(--muted)]">{s.hex}</p>
              <p className="m-0 mt-2 text-[12.5px] leading-snug text-[var(--muted)]">{t(s.use, lang)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 border-t border-[var(--line)] pt-8 md:grid-cols-2">
        <div>
          <p className="m-0 text-[13px] text-[var(--muted)]">
            {lang === "es" ? "Tipografía" : "Typeface"}
          </p>
          <p className="display m-0 mt-2 text-[2.6rem] text-[var(--indigo)]">Inter 300</p>
          <p className="m-0 mt-1 text-sm">
            {lang === "es"
              ? "Inter 400 para texto corrido. Dos pesos, no cinco."
              : "Inter 400 for body text. Two weights, not five."}
          </p>
        </div>
        <div>
          <p className="m-0 text-[13px] text-[var(--muted)]">
            {lang === "es" ? "Regla" : "Rule"}
          </p>
          <p className="m-0 mt-2 text-sm leading-relaxed">
            {lang === "es"
              ? "Tres colores y ninguno más. La cochinilla no decora: si aparece, algo necesita atención. En /pricing se usa la paleta pero no el movimiento."
              : "Three colours and no fourth. Cochineal never decorates: if it appears, something needs attention. On /pricing the palette applies but the motion does not."}
          </p>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- persona */

function Persona({ lang }: { lang: Lang }) {
  return (
    <Section id="persona" title={COPY.persona[lang]} lang={lang}>
      <div className="grid gap-8 md:grid-cols-[5fr_7fr]">
        <Reveal>
          <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6">
            <h3 className="m-0 text-[1.4rem] font-medium tracking-[-0.02em]">{PERSONA.name}</h3>
            <p className="m-0 mt-1 text-[13px] text-[var(--muted)]">{t(PERSONA.tag, lang)}</p>
            <p className="m-0 mt-4 text-sm leading-relaxed">{t(PERSONA.summary, lang)}</p>
          </div>
        </Reveal>
        <div>
          {PERSONA.facts.map((f, i) => (
            <Reveal key={f.k.en} delay={i * 50}>
              <div className="border-b border-[var(--line)] py-4 last:border-b-0">
                <div className="flex flex-wrap items-baseline gap-x-4">
                  <span className="min-w-[150px] text-[13px] text-[var(--muted)]">{t(f.k, lang)}</span>
                  <span className="text-sm font-medium">{t(f.v, lang)}</span>
                </div>
                <p className="m-0 mt-1 text-[12.5px] italic text-[var(--muted)]">{t(f.source, lang)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------- landing copy */

type SaveFn = (
  kind: string,
  label: string,
  channel: string | null,
  body: string,
  id: string
) => void | Promise<void>;

function LandingCopy({
  lang,
  myVariants,
  onSave,
  savingId,
}: {
  lang: Lang;
  myVariants: { headline: string; cta: string } | null;
  onSave: SaveFn;
  savingId: string | null;
}) {
  return (
    <Section id="copy" title={COPY.landing[lang]} lang={lang}>
      <p className="m-0 mb-5 text-[13px] text-[var(--muted)]">
        {lang === "es"
          ? "Los dos titulares están vivos en la portada. Cada visitante ve uno y se queda con ese."
          : "Both headlines are live on the landing page. Each visitor gets one and stays on it."}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(HEADLINES).map(([variant, value]) => {
          const mine = myVariants?.headline === variant;
          return (
            <div
              key={variant}
              className={`rounded-[14px] border p-5 ${
                mine ? "border-[var(--cochineal)]" : "border-[var(--line)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="mono text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  {variant}
                </span>
                {mine && (
                  <span className="mono text-[10px] text-[var(--cochineal)]">
                    {COPY.youSee[lang]}
                  </span>
                )}
              </div>
              <p className="m-0 mt-3 text-[1.1rem] leading-snug">{t(value, lang)}</p>
              <div className="mt-4 flex gap-2">
                <CopyButton text={t(value, lang)} label={COPY.copy[lang]} copiedLabel={COPY.copied[lang]} />
                <SaveButton
                  lang={lang}
                  busy={savingId === `h-${variant}`}
                  onClick={() => onSave("copy", `Headline — ${variant}`, null, t(value, lang), `h-${variant}`)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {Object.entries(CTAS).map(([variant, value]) => {
          const mine = myVariants?.cta === variant;
          return (
            <div
              key={variant}
              className={`flex items-center justify-between gap-3 rounded-[14px] border p-4 ${
                mine ? "border-[var(--cochineal)]" : "border-[var(--line)]"
              }`}
            >
              <div>
                <span className="mono text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  CTA · {variant}
                </span>
                <p className="m-0 mt-1.5 text-sm font-medium">{t(value, lang)}</p>
              </div>
              <CopyButton text={t(value, lang)} label={COPY.copy[lang]} copiedLabel={COPY.copied[lang]} />
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-[var(--line)] pt-6">
        <p className="m-0 max-w-[60ch] text-[1.05rem] leading-relaxed">{t(LANDING.subhead, lang)}</p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {LANDING.props.map((p) => (
            <div key={p.title.en}>
              <p className="m-0 text-sm font-medium">{t(p.title, lang)}</p>
              <p className="m-0 mt-1.5 text-[13.5px] leading-relaxed text-[var(--muted)]">{t(p.body, lang)}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------- posts */

function Posts({ lang, onSave, savingId }: { lang: Lang; onSave: SaveFn; savingId: string | null }) {
  return (
    <Section id="posts" title={`${COPY.posts[lang]} (${POSTS.length})`} lang={lang}>
      <div className="grid gap-4 md:grid-cols-2">
        {POSTS.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i, 5) * 40}>
            <article className="flex h-full flex-col rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mono rounded-[3px] border border-[var(--line)] px-2 py-0.5 text-[10.5px] text-[var(--muted)]">
                  {p.channel}
                </span>
                <span className="mono rounded-[3px] bg-[var(--indigo-soft)] px-2 py-0.5 text-[10.5px] text-[var(--indigo)]">
                  {t(STAGE_LABEL[p.stage], lang)}
                </span>
              </div>
              <p className="m-0 mt-3 flex-1 whitespace-pre-line text-[13.5px] leading-relaxed">
                {t(p.body, lang)}
              </p>
              <div className="mt-4 flex gap-2">
                <CopyButton text={t(p.body, lang)} label={COPY.copy[lang]} copiedLabel={COPY.copied[lang]} />
                <SaveButton
                  lang={lang}
                  busy={savingId === p.id}
                  onClick={() => onSave("post", `${p.channel} — ${p.id}`, p.channel, t(p.body, lang), p.id)}
                />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- scripts */

function Scripts({ lang, onSave, savingId }: { lang: Lang; onSave: SaveFn; savingId: string | null }) {
  return (
    <Section id="scripts" title={`${COPY.scripts[lang]} (${SCRIPTS.length})`} lang={lang}>
      <div className="grid gap-5">
        {SCRIPTS.map((s) => {
          const full = s.beats.map((b) => `${b.t}  ${t(b.line, lang)}`).join("\n");
          return (
            <Reveal key={s.id}>
              <article className="rounded-[18px] border border-[var(--line)] p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="m-0 text-[1.15rem] font-medium tracking-[-0.01em]">{t(s.title, lang)}</h3>
                  <span className="mono text-[11px] text-[var(--muted)]">
                    {s.channel} · {s.length}
                  </span>
                </div>
                <ol className="mt-4 list-none space-y-2.5 p-0">
                  {s.beats.map((b) => (
                    <li key={b.t} className="flex gap-4">
                      <span className="mono min-w-[42px] shrink-0 text-[11.5px] text-[var(--muted)]">{b.t}</span>
                      <span className="text-[13.5px] leading-relaxed">{t(b.line, lang)}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 flex gap-2">
                  <CopyButton text={full} label={COPY.copy[lang]} copiedLabel={COPY.copied[lang]} />
                  <SaveButton
                    lang={lang}
                    busy={savingId === s.id}
                    onClick={() => onSave("script", t(s.title, lang), s.channel, full, s.id)}
                  />
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------- calendar */

function Calendar({ lang }: { lang: Lang }) {
  return (
    <Section id="calendar" title={COPY.calendar[lang]} lang={lang}>
      <div className="overflow-hidden rounded-[14px] border border-[var(--line)]">
        {CALENDAR.map((d) => (
          <div
            key={d.day}
            className="grid grid-cols-[52px_96px_1fr] items-baseline gap-3 border-b border-[var(--line)] px-4 py-3 last:border-b-0 md:grid-cols-[64px_120px_1fr] md:px-5"
          >
            <span className="mono text-[11.5px] text-[var(--muted)]">
              {COPY.day[lang]} {d.day}
            </span>
            <span className="text-[13px] font-medium">{d.channel}</span>
            <span className="text-[13px] text-[var(--muted)]">
              {t(d.note, lang)}{" "}
              <span className="mono text-[11px] opacity-70">({d.asset})</span>
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ A/B panel */

function AbPanel({
  lang,
  results,
  myVariants,
}: {
  lang: Lang;
  results: AbResult[];
  myVariants: { headline: string; cta: string } | null;
}) {
  return (
    <Section id="ab" title={COPY.ab[lang]} lang={lang}>
      {results.length === 0 && (
        <p className="m-0 text-sm text-[var(--muted)]">
          {lang === "es" ? "Cargando resultados…" : "Loading results…"}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {results.map((r) => {
          const mine = myVariants?.[r.id];
          return (
            <div key={r.id} className="rounded-[18px] border border-[var(--line)] p-6">
              <span className="mono text-[11px] uppercase tracking-wide text-[var(--muted)]">
                {EXPERIMENTS[r.id]?.id ?? r.id}
              </span>
              <h3 className="m-0 mt-2 text-[1.05rem] font-medium leading-snug">{r.question}</h3>
              <p className="m-0 mt-1 text-[12.5px] text-[var(--muted)]">{r.metric}</p>

              <table className="mt-5 w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-[11.5px] text-[var(--muted)]">
                    <th className="pb-2 font-normal">{lang === "es" ? "Variante" : "Variant"}</th>
                    <th className="pb-2 text-right font-normal">{lang === "es" ? "Vistas" : "Views"}</th>
                    <th className="pb-2 text-right font-normal">Clicks</th>
                    <th className="pb-2 text-right font-normal">{lang === "es" ? "Tasa" : "Rate"}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.counts.map((c) => (
                    <tr key={c.variant} className="border-t border-[var(--line)]">
                      <td className="py-2">
                        {c.variant}
                        {mine === c.variant && (
                          <span className="mono ml-2 text-[10px] text-[var(--cochineal)]">
                            {lang === "es" ? "tuya" : "yours"}
                          </span>
                        )}
                      </td>
                      <td className="num py-2 text-right">{c.impressions}</td>
                      <td className="num py-2 text-right">{c.clicks}</td>
                      <td className="num py-2 text-right">{(c.rate * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p
                className={`m-0 mt-5 rounded-[8px] border p-3 text-[12.5px] leading-relaxed ${
                  r.callable
                    ? "border-[var(--line)] text-[var(--muted)]"
                    : "border-[var(--cochineal)] text-[var(--cochineal)]"
                }`}
              >
                {r.callable
                  ? lang === "es"
                    ? `Ambas variantes pasaron ${r.minToCall} vistas. La diferencia empieza a ser legible, pero sigue sin ser una prueba estadística.`
                    : `Both variants cleared ${r.minToCall} views. The difference is starting to be readable, but this is still not a significance test.`
                  : lang === "es"
                    ? `Muestra demasiado pequeña para declarar ganador. Hacen falta ${r.minToCall} vistas por variante, y aun así esto mide que el mecanismo funciona, no cuál titular gana.`
                    : `Sample too small to declare a winner. It needs ${r.minToCall} views per variant, and even then this shows the mechanism works, not which headline wins.`}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------- saved */

function Saved({ lang, saved }: { lang: Lang; saved: SavedAsset[] }) {
  return (
    <Section id="saved" title={COPY.saved[lang]} lang={lang} last>
      {saved.length === 0 ? (
        <p className="m-0 text-sm text-[var(--muted)]">{COPY.nothingSaved[lang]}</p>
      ) : (
        <ul className="list-none divide-y divide-[var(--line)] p-0">
          {saved.map((a) => (
            <li key={a.id} className="anim-slip py-3">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-sm font-medium">{a.label}</span>
                <span className="mono text-[10.5px] uppercase text-[var(--muted)]">
                  {a.kind} · {a.lang}
                </span>
              </div>
              <p className="m-0 mt-1 line-clamp-2 whitespace-pre-line text-[13px] text-[var(--muted)]">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/* ----------------------------------------------------------------- bits */

function Section({
  id,
  title,
  children,
  last = false,
}: {
  id: string;
  title: string;
  lang: Lang;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section
      id={id}
      className={`py-14 md:py-20 ${last ? "" : "border-b border-[var(--line)]"}`}
    >
      <Reveal>
        <h2 className="display m-0 mb-8 text-[clamp(1.5rem,3vw,2.1rem)] text-[var(--indigo)]">
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}

function SaveButton({
  lang,
  busy,
  onClick,
}: {
  lang: Lang;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="mono rounded-[3px] border border-[var(--line)] px-2.5 py-1 text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--indigo)] hover:text-[var(--indigo)] disabled:opacity-50"
    >
      {busy ? "…" : COPY.save[lang]}
    </button>
  );
}
