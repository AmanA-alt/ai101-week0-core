"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  FIELD_LABEL,
  STORAGE_KEY,
  fromStorage,
  importCsv,
  newId,
  toCsv,
  toNumber,
  totals,
  validate,
  type Field,
  type ImportResult,
  type Item,
} from "@/lib/inventory";

/**
 * The reseller's stock list.
 *
 * Everything on this page happens inside her browser. The file is read by the
 * browser, parsed by pure functions, and saved to this device's own storage.
 * There is no fetch call anywhere in this file, no inventory route and no
 * inventory table. The promise at the top of the page is therefore true by
 * construction, and the limits of that promise are stated just as plainly.
 */

const SAMPLE = `Prenda,Material,Talla,Color,Cantidad,Costo,Precio
Blusa de lino manga corta,Lino,S,Blanco,3,320,690
Blusa de lino manga corta,Lino,M,Blanco,4,320,690
Pantalón wide leg,Crepé,L,Negro,2,410,890
Vestido midi cruzado,Viscosa,S,Salvia,1,540,1290
Chamarra de mezclilla,Mezclilla,M,Azul,,600,1490
Pantalón wide leg,Crepé,L,negro,1,410,890
`;

const EDITABLE: Field[] = ["name", "material", "size", "colour", "quantity", "cost", "price"];
const NUMERIC = new Set<Field>(["quantity", "cost", "price"]);

// localStorage as an external store, so no effect has to copy it into state.
let listeners: (() => void)[] = [];
function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function writeItems(items: Item[]) {
  try {
    if (items.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage full or blocked: the in-page list still works for this visit */
  }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.push(l);
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && l();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners = listeners.filter((x) => x !== l);
    window.removeEventListener("storage", onStorage);
  };
}

const mxn = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default function InventoryClient() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const saved = useMemo(() => fromStorage(raw), [raw]);

  const [review, setReview] = useState<ImportResult | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState<Record<Field, string>>({
    name: "", material: "", size: "", colour: "", quantity: "", cost: "", price: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const items = review ? review.items : saved;
  const flags = useMemo(() => validate(items), [items]);
  const flagsById = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const f of flags) m.set(f.id, [...(m.get(f.id) ?? []), f.message]);
    return m;
  }, [flags]);
  const sum = totals(items);

  function update(list: Item[]) {
    if (review) setReview({ ...review, items: list });
    else writeItems(list);
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReview(importCsv(String(reader.result ?? "")));
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addRow(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const item: Item = {
      id: newId(),
      name: draft.name.trim(),
      material: draft.material.trim(),
      size: draft.size.trim().toUpperCase(),
      colour: draft.colour.trim(),
      quantity: toNumber(draft.quantity),
      cost: toNumber(draft.cost),
      price: toNumber(draft.price),
    };
    update([...items, item]);
    setDraft({ name: "", material: "", size: "", colour: "", quantity: "", cost: "", price: "" });
  }

  function editCell(id: string, field: Field, value: string) {
    update(
      items.map((it) =>
        it.id !== id
          ? it
          : { ...it, [field]: NUMERIC.has(field) ? toNumber(value) : field === "size" ? value.toUpperCase() : value }
      )
    );
  }

  function exportCsv() {
    const blob = new Blob([toCsv(saved)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventario-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="border-b border-[var(--line)] pb-6">
        <p className="mono m-0 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Your stock</p>
        <h1 className="display m-0 mt-2 text-[clamp(2rem,5vw,3rem)] text-[var(--indigo)]">Inventory</h1>
      </header>

      <div className="mt-6 flex gap-4 rounded-[14px] border border-[var(--indigo)] bg-[var(--indigo-soft)] p-5" role="note">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" className="mt-0.5 shrink-0 text-[var(--indigo)]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <div className="text-sm leading-relaxed">
          <p className="m-0 font-medium text-[var(--indigo)]">Saved only on this device. Never sent to Bastilla or anyone else.</p>
          <p className="m-0 mt-1 text-[var(--muted)]">
            Nobody, including us, can see or monitor it. That also means it lives in this browser only:
            if you clear your browser data or lose this phone, it is gone unless you export a copy.
          </p>
        </div>
      </div>

      {!review && saved.length === 0 && (
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="lift-card rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6">
            <h2 className="m-0 text-[1.05rem] font-medium">Load a spreadsheet</h2>
            <p className="m-0 mt-2 text-sm leading-relaxed text-[var(--muted)]">
              In Excel or Google Sheets choose File, then Save as or Download, then CSV. Headings like
              Prenda, Talla, Color, Cantidad, Costo and Precio are recognised automatically.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <label className="nav-cta relative inline-flex cursor-pointer">
                Choose CSV file
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
              <button type="button" className="text-sm text-[var(--indigo)] underline underline-offset-4" onClick={() => setReview(importCsv(SAMPLE))}>
                Try a sample sheet
              </button>
            </div>
          </div>
          <div className="lift-card rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6">
            <h2 className="m-0 text-[1.05rem] font-medium">Start by hand</h2>
            <p className="m-0 mt-2 text-sm leading-relaxed text-[var(--muted)]">
              No sheet? Add garments one at a time with the form below. You can load a sheet later too.
            </p>
          </div>
        </section>
      )}

      {review && (
        <section className="anim-sheet mt-8 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6" aria-labelledby="review-h">
          <h2 id="review-h" className="m-0 text-[1.05rem] font-medium">Check before saving</h2>
          <p className="m-0 mt-1 text-sm text-[var(--muted)]">
            Read {review.items.length} garments{review.skipped ? `, skipped ${review.skipped} rows with no name` : ""}.
            Nothing is saved until you press Save.
          </p>
          <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
            {review.headers.map((h, i) => (
              <li key={i} className="mono rounded-[6px] border border-[var(--line)] bg-[var(--bone)] px-2 py-1 text-[11px]">
                {h || "(blank)"} → {review.mapping[i] ? FIELD_LABEL[review.mapping[i]!] : <span className="text-[var(--muted)]">ignored</span>}
              </li>
            ))}
          </ul>
          <p className={`m-0 mt-4 text-sm ${flags.length ? "text-[var(--caution)]" : "text-[var(--indigo)]"}`}>
            {flags.length ? `${flags.length} things to look at, marked in the table. Fix them there or save as is.` : "No problems found."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="nav-cta inline-flex"
              onClick={() => {
                writeItems([...saved, ...review.items]);
                setReview(null);
              }}
            >
              Save {review.items.length} garments
            </button>
            <button type="button" className="text-sm text-[var(--muted)] underline underline-offset-4" onClick={() => setReview(null)}>
              Cancel
            </button>
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section className="mt-8" aria-label="Stock list">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <p className="m-0 text-sm">
              <span className="num font-medium">{sum.rows}</span> rows · <span className="num font-medium">{sum.units}</span> pieces ·{" "}
              <span className="num font-medium">{mxn(sum.value)}</span> at selling price
            </p>
            {!review && (
              <label className="relative cursor-pointer text-sm text-[var(--indigo)] underline underline-offset-4">
                Add from another CSV
                <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
            )}
          </div>
          <div className="relative overflow-x-auto rounded-[12px] border border-[var(--line)]">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--surface)]">
                  {EDITABLE.map((f) => (
                    <th key={f} scope="col" className="mono px-2 py-2 text-left text-[11px] font-normal uppercase tracking-[0.08em] text-[var(--muted)]">
                      {FIELD_LABEL[f]}
                    </th>
                  ))}
                  <th scope="col"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const msgs = flagsById.get(it.id);
                  return (
                    <tr key={it.id} className={`border-t border-[var(--line)] ${msgs ? "bg-[var(--cochineal-soft)]" : ""}`}>
                      {EDITABLE.map((f) => {
                        const v = it[f];
                        const shown = v === null || (typeof v === "number" && Number.isNaN(v)) ? "" : String(v);
                        return (
                          <td key={f} className="px-1 py-1">
                            <input
                              key={`${f}:${shown}`}
                              aria-label={`${FIELD_LABEL[f]} for ${it.name}`}
                              defaultValue={shown}
                              onBlur={(e) => e.target.value !== shown && editCell(it.id, f, e.target.value)}
                              inputMode={NUMERIC.has(f) ? "decimal" : undefined}
                              className={`w-full rounded-[6px] border border-transparent bg-transparent px-1.5 py-1.5 hover:border-[var(--line)] focus:border-[var(--indigo)] focus:bg-[var(--bone)] ${NUMERIC.has(f) ? "num text-right" : ""} ${f === "name" ? "min-w-[180px]" : ""}`}
                            />
                          </td>
                        );
                      })}
                      <td className="px-2 text-right">
                        <button
                          type="button"
                          aria-label={`Remove ${it.name}`}
                          className="rounded-full px-2 py-1 text-[var(--muted)] hover:text-[var(--cochineal)]"
                          onClick={() => update(items.filter((x) => x.id !== it.id))}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {flags.length > 0 && (
            <ul className="m-0 mt-3 list-none space-y-1 p-0 text-[13px] text-[var(--cochineal)]">
              {flags.map((f, i) => {
                const it = items.find((x) => x.id === f.id);
                return <li key={i}>{it?.name}{it?.size ? ` (${it.size})` : ""}: {f.message}</li>;
              })}
            </ul>
          )}
        </section>
      )}

      {!review && (
        <form onSubmit={addRow} className="mt-8 rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-5" aria-labelledby="add-h">
          <h2 id="add-h" className="m-0 text-[1.05rem] font-medium">Add a garment</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-7">
            {EDITABLE.map((f) => (
              <label key={f} className={`text-[12px] text-[var(--muted)] ${f === "name" ? "col-span-2 md:col-span-2" : ""}`}>
                {FIELD_LABEL[f]}
                <input
                  value={draft[f]}
                  required={f === "name"}
                  inputMode={NUMERIC.has(f) ? "decimal" : undefined}
                  onChange={(e) => setDraft({ ...draft, [f]: e.target.value })}
                  className="mt-1 block w-full rounded-[8px] border border-[var(--line)] bg-[var(--bone)] px-2.5 py-2 text-sm text-[var(--ink)]"
                />
              </label>
            ))}
          </div>
          <button type="submit" className="nav-cta mt-4 inline-flex">Add to my stock</button>
        </form>
      )}

      {!review && saved.length > 0 && (
        <section className="mt-8 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-6">
          <button type="button" className="nav-cta inline-flex" onClick={exportCsv}>Export a backup (CSV)</button>
          {!confirmDelete ? (
            <button type="button" className="text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--cochineal)]" onClick={() => setConfirmDelete(true)}>
              Delete everything
            </button>
          ) : (
            <span className="anim-slip flex flex-wrap items-center gap-3 text-sm">
              Delete all {saved.length} garments from this device?
              <button
                type="button"
                className="rounded-full border border-[var(--cochineal)] px-4 py-1.5 text-[var(--cochineal)]"
                onClick={() => {
                  writeItems([]);
                  setConfirmDelete(false);
                }}
              >
                Yes, delete
              </button>
              <button type="button" className="text-[var(--muted)] underline underline-offset-4" onClick={() => setConfirmDelete(false)}>
                Keep it
              </button>
            </span>
          )}
        </section>
      )}
    </main>
  );
}
