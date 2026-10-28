"use client";

import Link from "next/link";
import { useMemo } from "react";
import { assignVariant } from "@/lib/ab";
import { HEADLINES, CTAS, LANDING, t, type Lang } from "@/lib/marketing-data";
import { useVisitorId, useImpression, sendEvent } from "./useClientState";

/**
 * The live half of the landing hero.
 *
 * Both experiments run here, because this is the only place on the site a
 * visitor is actually being asked to do something.
 *
 * Assignment is synchronous and local — a hash of the visitor id, no network
 * call and no database read — but the visitor id itself lives in localStorage,
 * which cannot be read during server rendering. So the headline is held back
 * for one frame rather than rendered in a default variant and swapped: half of
 * all visitors would otherwise watch the headline change under them, which
 * looks broken and corrupts the thing being measured. The block reserves its
 * height so nothing below it moves.
 */
export default function HeroExperiment({
  lang,
  setLang,
  langReady,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  langReady: boolean;
}) {
  const visitorId = useVisitorId();

  const headlineVariant = useMemo(
    () => (visitorId ? assignVariant(visitorId, "headline") : null),
    [visitorId]
  );
  const ctaVariant = useMemo(
    () => (visitorId ? assignVariant(visitorId, "cta") : null),
    [visitorId]
  );

  useImpression("headline", headlineVariant, visitorId);
  useImpression("cta", ctaVariant, visitorId);

  const ready = Boolean(visitorId && headlineVariant && ctaVariant && langReady);

  function onCta() {
    if (!visitorId || !headlineVariant || !ctaVariant) return;
    void sendEvent("headline", headlineVariant, "click", visitorId);
    void sendEvent("cta", ctaVariant, "click", visitorId);
  }

  return (
    <div className="relative">
      <LangSwitch lang={lang} setLang={setLang} />

      <div className="min-h-[13rem] md:min-h-[17rem]">
        {ready && (
          <h1 className="display anim-step m-0 max-w-[18ch] text-[clamp(2.4rem,7vw,5rem)]">
            {t(HEADLINES[headlineVariant!]!, lang)}
          </h1>
        )}
      </div>

      <p className="mt-6 max-w-[52ch] text-[clamp(1rem,1.7vw,1.15rem)] leading-relaxed text-[var(--bone)]/75">
        {t(LANDING.subhead, lang)}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Link
          href="/core"
          onClick={onCta}
          className="rounded-full bg-[var(--bone)] px-6 py-3 text-sm font-medium text-[var(--indigo)] transition-opacity hover:opacity-90"
        >
          {ready ? t(CTAS[ctaVariant!]!, lang) : " "}
        </Link>
        <Link
          href="/pricing"
          className="text-sm text-[var(--bone)]/70 underline underline-offset-4 hover:text-[var(--bone)]"
        >
          {lang === "es" ? "Ver precios" : "See pricing"}
        </Link>
      </div>
    </div>
  );
}

function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="mb-10 flex items-center gap-1 text-[13px] text-[var(--bone)]/60">
      <button
        type="button"
        onClick={() => setLang("es")}
        aria-pressed={lang === "es"}
        className={lang === "es" ? "text-[var(--bone)] underline underline-offset-4" : "hover:text-[var(--bone)]"}
      >
        Esp
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={lang === "en" ? "text-[var(--bone)] underline underline-offset-4" : "hover:text-[var(--bone)]"}
      >
        Eng
      </button>
    </div>
  );
}
