"use client";

import { PULLQUOTE, t, type Lang } from "@/lib/marketing-data";
import Reveal from "./Reveal";

/**
 * The full-bleed dark band.
 *
 * This is the one place --deep is used, and the reason it exists as a token.
 * The device is borrowed from the reference: a section that breaks the page
 * width, drops to near-black, and carries a single sentence. Its whole value is
 * the interruption, so it holds one line and no supporting copy. The moment it
 * carries a paragraph it stops being a pause in the page and becomes another
 * section with a dark background.
 *
 * The column rules deliberately do not run through it. The grid is a device for
 * the reading surface, and the break reads as a break only if the structure
 * stops too.
 */
export default function PullQuote({ lang }: { lang: Lang }) {
  return (
    <section
      className="relative z-[1] bg-[var(--deep)] text-[var(--bone)]"
      aria-label={t(PULLQUOTE.attribution, lang)}
    >
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <Reveal step>
          <blockquote className="m-0">
            <p className="display m-0 max-w-[20ch] text-[clamp(1.9rem,5vw,3.4rem)]">
              {t(PULLQUOTE.text, lang)}
            </p>
            <footer className="mono mt-8 text-[11px] uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--bone)_55%,transparent)]">
              {t(PULLQUOTE.attribution, lang)}
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
