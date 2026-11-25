/**
 * Which appearance to show.
 *
 * A saved choice wins; otherwise the system setting decides. The same rule
 * runs in two places: in THEME_SCRIPT, which sets the attribute in the head of
 * the document before anything is painted, and in the switch in the nav. The
 * pure function exists so the rule itself can be tested.
 */

export type Theme = "light" | "dark";
export const THEME_KEY = "bastilla.theme";

export function resolveTheme(saved: string | null, systemPrefersDark: boolean): Theme {
  if (saved === "light" || saved === "dark") return saved;
  return systemPrefersDark ? "dark" : "light";
}

/**
 * Inline script for <head>. Runs synchronously while the HTML is parsed, so a
 * visitor who prefers dark never sees a light flash. Kept tiny and wrapped in
 * try/catch because localStorage can throw in private modes.
 */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("${THEME_KEY}");var d=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var t=(s==="light"||s==="dark")?s:(d?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","light")}})()`;
