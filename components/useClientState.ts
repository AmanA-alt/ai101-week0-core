"use client";

import { useCallback, useEffect, useState } from "react";
import { newVisitorId, type ExperimentId } from "@/lib/ab";
import type { Lang } from "@/lib/marketing-data";

/**
 * Per-browser state: who this visitor is, which language they read in, and
 * which impressions have already been counted for them.
 *
 * All three are per-browser and none of them need to reach the server, so they
 * live in localStorage. Every read is wrapped: in a private window, with site
 * data blocked, or inside an embedded preview, the accessor can throw rather
 * than return null, and a marketing page is not worth crashing over.
 */

const VISITOR_KEY = "respondo:visitor";
const LANG_KEY = "respondo:lang";
const IMPRESSION_PREFIX = "respondo:imp:";

function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Blocked storage is survivable; losing the write is not worth an error. */
  }
}

/**
 * The visitor id, or null until the component has mounted.
 *
 * Null on the server and on the very first client render, which is why every
 * caller must handle it. Returning a fabricated id during SSR would mean the
 * server assigned one variant and the browser then assigned another.
 */
export function useVisitorId(): string | null {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    let existing = readLocal(VISITOR_KEY);
    if (!existing) {
      existing = newVisitorId();
      writeLocal(VISITOR_KEY, existing);
    }
    setId(existing);
  }, []);

  return id;
}

/** Reading language, persisted per browser. Spanish is the default. */
export function useLang(): [Lang, (next: Lang) => void, boolean] {
  const [lang, setLangState] = useState<Lang>("es");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readLocal(LANG_KEY);
    if (stored === "es" || stored === "en") setLangState(stored);
    setReady(true);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeLocal(LANG_KEY, next);
  }, []);

  return [lang, setLang, ready];
}

/** Posts an A/B event. Failures are swallowed: analytics must not break a page. */
export async function sendEvent(
  experimentId: ExperimentId,
  variant: string,
  event: "impression" | "click",
  visitorId: string
): Promise<void> {
  try {
    await fetch("/api/ab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experimentId, variant, event, visitorId }),
      keepalive: true,
    });
  } catch {
    /* Offline, blocked, or navigating away. Nothing to recover. */
  }
}

/**
 * Records one impression per visitor per experiment — never one per render.
 *
 * React re-renders on every language toggle and every piece of state. Counting
 * on render would inflate impressions, which deflates the click rate, which
 * makes both variants look equally bad and the experiment unreadable. The
 * guard is a localStorage key, so it also survives a reload.
 */
export function useImpression(
  experimentId: ExperimentId,
  variant: string | null,
  visitorId: string | null
): void {
  useEffect(() => {
    if (!variant || !visitorId) return;
    const key = `${IMPRESSION_PREFIX}${experimentId}`;
    if (readLocal(key)) return;
    writeLocal(key, variant);
    void sendEvent(experimentId, variant, "impression", visitorId);
  }, [experimentId, variant, visitorId]);
}
