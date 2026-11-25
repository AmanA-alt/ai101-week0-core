/**
 * The two-language primitives, on their own.
 *
 * These used to live in marketing-data.ts, which is fine while /marketing is
 * the only bilingual page. /chat is bilingual too, and importing `t` from
 * marketing-data would have pulled four hundred lines of posts, scripts and
 * calendar entries into the chat bundle to get a one-line function.
 *
 * marketing-data re-exports all of this, so nothing that already imported from
 * there had to change.
 */

export type Lang = "es" | "en";

export type Localized = { es: string; en: string };

export const LANGS: Lang[] = ["es", "en"];

export function t(value: Localized, lang: Lang): string {
  return value[lang];
}
