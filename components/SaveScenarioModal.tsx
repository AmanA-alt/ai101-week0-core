"use client";

import { useEffect, useRef, useState } from "react";
import { formatMxn, type Mix, type Revenue } from "@/lib/pricing";

/**
 * Stepped save flow, borrowed from the Endurance Warranty claim submission
 * pattern: a guided modal so the user enters the right details at the right
 * time rather than committing in one click.
 *
 * The middle step is the reason this exists. Saving a scenario in one click
 * stores a number with no record of what produced it; a month later two saved
 * figures are not comparable. Forcing the assumptions into view before the save
 * is deliberate friction.
 */

export type Snapshot = {
  name: string;
  customers: number;
  mix: Mix;
  churnPct: number;
  revenue: Revenue;
  preset: string;
};

const SUBTITLES = [
  "Name it so you can compare later",
  "Confirm what gets stored with it",
  "Ready to save",
];

export default function SaveScenarioModal({
  open,
  snapshot,
  onClose,
  onSaved,
}: {
  open: boolean;
  snapshot: Omit<Snapshot, "name">;
  onClose: () => void;
  onSaved: (name: string) => Promise<void>;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Reset on each open, and park focus in the first field.
  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    setStep(1);
    setName("");
    setNameError(false);
    setSaveError(null);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => nameRef.current?.focus(), 40);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      restoreRef.current?.focus();
    };
  }, [open]);

  // Escape to close, Tab trapped inside the sheet.
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) return;

      const focusable = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pct = (v: number) => `${Math.round(v * 100)}%`;

  async function advance() {
    if (step === 1) {
      if (!name.trim()) {
        setNameError(true);
        nameRef.current?.focus();
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await onSaved(name.trim());
    } catch {
      setSaveError("The scenario could not be saved. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="anim-scrim fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,22,26,0.42)] p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-title"
        className="anim-sheet max-h-[88vh] w-full max-w-[520px] overflow-auto rounded-[20px] border border-[var(--line)] bg-[var(--surface)]"
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 id="save-title" className="m-0 text-[1.25rem] font-medium tracking-[-0.02em]">
              Save this scenario
            </h2>
            <p className="m-0 mt-1 text-[13px] text-[var(--muted)]">{SUBTITLES[step - 1]}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-1.5 py-1 text-xl leading-none text-[var(--muted)] hover:text-[var(--ink)]"
          >
            ×
          </button>
        </div>

        <div className="flex gap-1.5 px-6 pt-5" aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-[3px] flex-1 rounded-sm transition-colors duration-500 ${
                i <= step ? "bg-[var(--indigo)]" : "bg-[var(--line)]"
              }`}
            />
          ))}
        </div>

        <div className="overflow-hidden px-6 pt-5">
          {step === 1 && (
            <div className="anim-pane">
              <label htmlFor="scenario-name" className="mb-2 block text-[13px] text-[var(--muted)]">
                Scenario name
              </label>
              <input
                id="scenario-name"
                ref={nameRef}
                type="text"
                value={name}
                autoComplete="off"
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") advance();
                }}
                placeholder="Base case, 140 customers"
                className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--bone)] px-3.5 py-2.5 text-[15px] outline-none focus:border-[var(--indigo)]"
              />
              {nameError && (
                <p className="m-0 mt-2 text-[13px] text-[var(--cochineal)]">
                  Give the scenario a name first.
                </p>
              )}
              <p className="m-0 mt-3.5 text-[13px] leading-relaxed text-[var(--muted)]">
                You will tell two saved scenarios apart in six weeks only if the name says what
                changed.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="anim-pane">
              <ul className="m-0 list-none overflow-hidden rounded-xl border border-[var(--line)] p-0">
                {[
                  ["Customers at month 12", snapshot.customers.toLocaleString("en-US")],
                  [
                    "Tier mix",
                    `${pct(snapshot.mix.solo)} / ${pct(snapshot.mix.negocio)} / ${pct(snapshot.mix.taller)}`,
                  ],
                  ["Monthly churn", `${snapshot.churnPct.toFixed(1)}%`],
                  ["Prices", "$299 / $699 / $1,499 MXN"],
                ].map(([k, v]) => (
                  <li
                    key={k}
                    className="flex justify-between gap-4 border-b border-[var(--line)] px-3.5 py-2.5 text-sm last:border-b-0"
                  >
                    <span className="text-[var(--muted)]">{k}</span>
                    <span className="num font-medium">{v}</span>
                  </li>
                ))}
              </ul>
              <p className="m-0 mt-3.5 text-[13px] leading-relaxed text-[var(--muted)]">
                These values are stored with the scenario. Change them later and this saved copy
                stays as it was, so two scenarios are always comparable.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="anim-pane">
              <div className="py-2.5 text-center">
                <p className="num m-0 text-[2.4rem] font-medium leading-none tracking-[-0.04em]">
                  {formatMxn(snapshot.revenue.mrr)}
                </p>
                <p className="m-0 mt-2 text-[13px] text-[var(--muted)]">
                  Monthly recurring revenue at month 12
                </p>
              </div>
              <p className="m-0 mt-3.5 text-[13px] leading-relaxed text-[var(--muted)]">
                Saved as “{name.trim()}” — {snapshot.customers.toLocaleString("en-US")} customers at{" "}
                {snapshot.churnPct.toFixed(1)}% churn, {formatMxn(snapshot.revenue.arr)} MXN annual
                run rate.
              </p>
              {saveError && (
                <p className="m-0 mt-3 text-[13px] text-[var(--cochineal)]">{saveError}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 px-6 pb-6 pt-6">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className={`rounded-full border border-[var(--line)] px-5 py-2.5 text-sm text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)] ${
              step === 1 ? "invisible" : ""
            }`}
          >
            Back
          </button>
          <button
            onClick={advance}
            disabled={saving}
            className="rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-medium text-[var(--bone)] disabled:opacity-50"
          >
            {step === 3 ? (saving ? "Saving…" : "Save scenario") : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
