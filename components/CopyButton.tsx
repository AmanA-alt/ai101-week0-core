"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copies a block of text and says so.
 *
 * The confirmation matters more than it looks: a copy button with no feedback
 * is one the user presses three times, which is how you end up with the same
 * caption pasted three times into Instagram.
 *
 * navigator.clipboard needs a secure context and is refused outright in some
 * embedded browsers, so there is a textarea fallback. If both fail the button
 * says so rather than silently pretending it worked.
 */
export default function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  className = "",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const flash = useCallback((next: "done" | "failed") => {
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  }, []);

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        flash("done");
        return;
      }
    } catch {
      /* Fall through to the textarea path. */
    }

    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      flash(ok ? "done" : "failed");
    } catch {
      flash("failed");
    }
  }, [text, flash]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`mono rounded-[3px] border px-2.5 py-1 text-[11px] transition-colors ${
        state === "done"
          ? "border-[var(--indigo)] text-[var(--indigo)]"
          : state === "failed"
            ? "border-[var(--cochineal)] text-[var(--cochineal)]"
            : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
      } ${className}`}
    >
      {state === "done" ? copiedLabel : state === "failed" ? "Press Ctrl+C" : label}
    </button>
  );
}
