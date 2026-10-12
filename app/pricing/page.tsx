"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import SaveScenarioModal from "@/components/SaveScenarioModal";
import {
  TIERS,
  PRESETS,
  ASSUMPTIONS,
  splitMix,
  calculateRevenue,
  formatMxn,
} from "@/lib/pricing";

type Row = {
  id: string;
  created_at: string;
  name: string;
  customers: number;
  churn_pct: number;
  mrr_mxn: number;
};

export default function PricingPage() {
  const [customers, setCustomers] = useState(140);
  const [soloPct, setSoloPct] = useState(60);
  const [negocioPct, setNegocioPct] = useState(32);
  const [churnPct, setChurnPct] = useState(4);
  const [preset, setPreset] = useState("base");

  const [rows, setRows] = useState<Row[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const mix = useMemo(() => splitMix(soloPct, negocioPct), [soloPct, negocioPct]);
  const revenue = useMemo(() => calculateRevenue(customers, mix), [customers, mix]);

  async function loadRows() {
    try {
      const res = await fetch("/api/scenarios");
      if (!res.ok) {
        setLoadError(true);
        return;
      }
      const data = await res.json();
      setRows(data.rows ?? []);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  function applyPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    setCustomers(p.customers);
    setSoloPct(p.soloPct);
    setNegocioPct(p.negocioPct);
    setChurnPct(p.churnPct);
  }

  async function save(name: string) {
    const res = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, preset, customers, soloPct, negocioPct, churnPct }),
    });
    if (!res.ok) throw new Error("save failed");
    setModalOpen(false);
    await loadRows();
  }

  return (
    <main className="mx-auto max-w-5xl px-6">
      <section className="border-b border-[var(--line)] py-20 md:py-28">
        <h1 className="m-0 max-w-[17ch] text-[clamp(2.4rem,6.5vw,4.5rem)] font-medium leading-[1.03] tracking-[-0.04em]">
          Three tiers, priced against what the market already charges.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[clamp(1rem,1.6vw,1.15rem)] leading-relaxed text-[var(--muted)]">
          Every price below traces to a figure in the{" "}
          <Link href="/research" className="underline underline-offset-4 hover:text-[var(--indigo)]">
            competitor study
          </Link>
          . Move the inputs to see what the business looks like at different adoption.
        </p>
      </section>

      <section className="border-b border-[var(--line)] py-14 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col rounded-[18px] bg-[var(--surface)] p-6 ${
                t.lead
                  ? "border-2 border-[var(--indigo)] p-[23px]"
                  : "border border-[var(--line)]"
              }`}
            >
              {t.lead && (
                <span className="mb-3 self-start rounded-full bg-[var(--indigo)] px-3 py-1 text-xs text-white">
                  Expected majority
                </span>
              )}
              <p className="m-0 text-sm text-[var(--muted)]">{t.name}</p>
              <p className="num m-0 mt-1.5 text-[2.5rem] font-medium leading-none tracking-[-0.035em]">
                {formatMxn(t.priceMxn)}
                <small className="ml-1 text-[0.95rem] font-normal tracking-normal text-[var(--muted)]">
                  MXN/mo
                </small>
              </p>
              <p className="m-0 mb-4 mt-2.5 text-[13px] text-[var(--indigo)]">{t.segment}</p>
              <ul className="m-0 list-none p-0">
                {t.includes.map((f) => (
                  <li
                    key={f}
                    className="relative py-1.5 pl-[18px] text-sm text-[var(--muted)] before:absolute before:left-0 before:top-[13px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--line)] before:content-['']"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-14 md:py-20">
        <h2 className="m-0 text-[clamp(1.6rem,3.2vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.03em]">
          Revenue simulator
        </h2>

        <div className="mt-8 grid items-start gap-8 md:grid-cols-2 md:gap-14">
          <div>
            <div className="mb-7 flex gap-1.5" role="group" aria-label="Scenario preset">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  aria-pressed={preset === p.id}
                  className={`flex-1 rounded-[10px] border px-2 py-2.5 text-sm transition-colors duration-300 ${
                    preset === p.id
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bone)]"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Slider
              id="customers"
              label="Customers at month 12"
              value={customers}
              display={customers.toLocaleString("en-US")}
              min={10}
              max={400}
              step={10}
              onChange={(v) => {
                setCustomers(v);
                setPreset("custom");
              }}
            />
            <Slider
              id="solo"
              label="Share on Solo"
              value={soloPct}
              display={`${Math.round(mix.solo * 100)}%`}
              min={0}
              max={100}
              step={1}
              onChange={(v) => {
                setSoloPct(v);
                setPreset("custom");
              }}
            />
            <Slider
              id="negocio"
              label="Share on Negocio"
              value={negocioPct}
              display={`${Math.round(mix.negocio * 100)}%`}
              min={0}
              max={100}
              step={1}
              onChange={(v) => {
                setNegocioPct(v);
                setPreset("custom");
              }}
            />
            <Slider
              id="churn"
              label="Monthly churn"
              value={churnPct}
              display={`${churnPct.toFixed(1)}%`}
              min={0}
              max={20}
              step={1}
              onChange={(v) => {
                setChurnPct(v);
                setPreset("custom");
              }}
            />

            <p className="m-0 text-[13px] text-[var(--muted)]">
              Taller takes the remainder:{" "}
              <span className="num">{Math.round(mix.taller * 100)}%</span>
            </p>
          </div>

          <div>
            <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-7">
              <Counter
                value={revenue.mrr}
                className="num m-0 text-[clamp(2.4rem,5.5vw,3.6rem)] font-medium leading-none tracking-[-0.045em]"
                suffix={
                  <small className="ml-1.5 text-base font-normal tracking-normal text-[var(--muted)]">
                    MXN
                  </small>
                }
              />
              <p className="m-0 mt-2.5 text-sm text-[var(--muted)]">
                Monthly recurring revenue at month 12
              </p>

              <div className="mt-6 flex gap-10 border-t border-[var(--line)] pt-5">
                <div>
                  <p className="m-0 text-[13px] text-[var(--muted)]">Annual run rate</p>
                  <Counter
                    value={revenue.arr}
                    className="num m-0 mt-1 text-[1.3rem] font-medium tracking-[-0.02em]"
                  />
                </div>
                <div>
                  <p className="m-0 text-[13px] text-[var(--muted)]">Per customer</p>
                  <Counter
                    value={revenue.arpu}
                    className="num m-0 mt-1 text-[1.3rem] font-medium tracking-[-0.02em]"
                  />
                </div>
              </div>

              {mix.clamped && (
                <p className="m-0 mt-4 rounded-[10px] bg-[var(--cochineal-soft)] px-3.5 py-2.5 text-[13px] text-[var(--cochineal)]">
                  Solo and Negocio exceed 100%. Negocio was cut back and Taller is zero.
                </p>
              )}
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="mt-5 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--bone)] transition-transform duration-200 active:scale-[0.97]"
            >
              Save this scenario
            </button>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-14 md:py-20">
        <table className="w-full border-collapse">
          <caption className="pb-3 text-left text-[13px] text-[var(--muted)]">
            Every figure below is either sourced or marked as a guess.
          </caption>
          <thead>
            <tr>
              <th className="w-[32%] border-b border-[var(--line)] px-2.5 py-2.5 text-left text-xs font-normal text-[var(--muted)]">
                Assumption
              </th>
              <th className="w-[16%] border-b border-[var(--line)] px-2.5 py-2.5 text-left text-xs font-normal text-[var(--muted)]">
                Value
              </th>
              <th className="border-b border-[var(--line)] px-2.5 py-2.5 text-left text-xs font-normal text-[var(--muted)]">
                Where it comes from
              </th>
            </tr>
          </thead>
          <tbody>
            {ASSUMPTIONS.map((a) => (
              <tr key={a.label}>
                <td className="border-b border-[var(--line)] px-2.5 py-3 align-top text-sm">
                  {a.label}
                </td>
                <td className="num border-b border-[var(--line)] whitespace-nowrap px-2.5 py-3 align-top text-sm">
                  {a.value}
                </td>
                <td className="border-b border-[var(--line)] px-2.5 py-3 align-top text-[13px] text-[var(--muted)]">
                  {a.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="py-14 md:py-20">
        <h2 className="m-0 text-[1.4rem] font-medium tracking-[-0.02em]">Saved scenarios</h2>

        {rows.length === 0 ? (
          <p className="m-0 mt-4 text-sm text-[var(--muted)]">
            {loadError
              ? "Saved scenarios could not be loaded right now."
              : "Nothing saved yet. Adjust the inputs and save a scenario to compare later."}
          </p>
        ) : (
          <ul className="m-0 mt-4 list-none p-0">
            {rows.map((r) => (
              <li
                key={r.id}
                className="anim-slip flex items-baseline justify-between gap-4 border-b border-[var(--line)] py-3.5 last:border-b-0"
              >
                <span className="text-sm">
                  {r.name}
                  <span className="num mt-0.5 block text-[13px] text-[var(--muted)]">
                    {r.customers.toLocaleString("en-US")} customers · {Number(r.churn_pct).toFixed(1)}% churn
                  </span>
                </span>
                <span className="num whitespace-nowrap text-sm text-[var(--muted)]">
                  {formatMxn(Number(r.mrr_mxn))} MXN/mo
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SaveScenarioModal
        open={modalOpen}
        snapshot={{ customers, mix, churnPct, revenue, preset }}
        onClose={() => setModalOpen(false)}
        onSaved={save}
      />
    </main>
  );
}

function Slider({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm text-[var(--muted)]">
          {label}
        </label>
        <output htmlFor={id} className="num text-[15px] font-medium">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/**
 * Counts to the new value when the inputs change. This is the only motion on
 * the page, and it fires because the reader moved a slider — it shows what
 * changed rather than decorating. Skipped entirely under reduced motion.
 */
function Counter({
  value,
  className,
  suffix,
}: {
  value: number;
  className?: string;
  suffix?: React.ReactNode;
}) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const from = fromRef.current;
    const to = value;

    if (reduce || Math.abs(to - from) < 1) {
      fromRef.current = to;
      setShown(to);
      return;
    }

    const start = performance.now();
    const duration = 420;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = from + (to - from) * eased;
      setShown(next);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
      fromRef.current = shown;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <p className={className}>
      {formatMxn(shown)}
      {suffix}
    </p>
  );
}
