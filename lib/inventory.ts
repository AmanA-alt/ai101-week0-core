/**
 * Inventory, as pure functions. Runs only in the reseller's browser.
 *
 * A reseller's stock list shows what she paid, what she charges and how much
 * she holds. None of it is ever sent to a server: these functions parse, check
 * and serialise it on her device, and the page saves it in her own browser.
 * There is no inventory route and no inventory table, so there is nothing to
 * monitor and nothing to leak.
 */
import { z } from "zod";

export const FIELDS = ["name", "material", "size", "colour", "quantity", "cost", "price"] as const;
export type Field = (typeof FIELDS)[number];

export type Item = {
  id: string;
  name: string;
  material: string;
  size: string;
  colour: string;
  quantity: number | null;
  cost: number | null;
  price: number | null;
};

export const FIELD_LABEL: Record<Field, string> = {
  name: "Garment",
  material: "Material",
  size: "Size",
  colour: "Colour",
  quantity: "Qty",
  cost: "Cost",
  price: "Price",
};

/** Headings resellers actually use, in Spanish and English, lower-cased and unaccented. */
const ALIASES: Record<Field, string[]> = {
  name: ["prenda", "nombre", "producto", "articulo", "modelo", "descripcion", "garment", "name", "item", "product"],
  material: ["material", "tela", "fabric", "tejido"],
  size: ["talla", "size", "tallas", "sizes"],
  colour: ["color", "colour", "colores", "colors"],
  quantity: ["cantidad", "piezas", "pzas", "existencia", "stock", "qty", "quantity", "unidades", "units"],
  cost: ["costo", "cost", "precio de compra", "compra", "costo unitario"],
  price: ["precio", "price", "precio de venta", "venta", "pvp"],
};

export const KNOWN_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "CH", "G", "EG", "UNITALLA", "ONE SIZE"];

function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

/** Comma or semicolon. Excel set to Spanish saves CSV with semicolons. */
export function detectDelimiter(text: string): "," | ";" {
  const first = text.replace(/^﻿/, "").split(/\r?\n/, 1)[0] ?? "";
  let commas = 0;
  let semis = 0;
  let quoted = false;
  for (const ch of first) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === ",") commas++;
    else if (!quoted && ch === ";") semis++;
  }
  return semis > commas ? ";" : ",";
}

/** RFC 4180 style parsing: quoted fields, escaped quotes, commas inside quotes, CRLF. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const d = detectDelimiter(src);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === d) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

/** Which column holds which field. A column nobody recognises maps to null. */
export function mapHeadings(headers: string[]): (Field | null)[] {
  const used = new Set<Field>();
  return headers.map((h) => {
    const f = fold(h);
    for (const field of FIELDS) {
      if (!used.has(field) && ALIASES[field].includes(f)) {
        used.add(field);
        return field;
      }
    }
    return null;
  });
}

/** "$1,290.00", "1.290", "  45 " → a number; blank → null; nonsense → NaN. */
export function toNumber(raw: string): number | null {
  const s = raw.replace(/[$\s]|mxn/gi, "");
  if (s === "") return null;
  // 1.290 or 1,290 as thousands; 12,5 as a Spanish decimal.
  let norm = s;
  if (/^\d{1,3}([.,]\d{3})+$/.test(s)) norm = s.replace(/[.,]/g, "");
  else if (/^\d+,\d{1,2}$/.test(s)) norm = s.replace(",", ".");
  else norm = s.replace(/,/g, "");
  const n = Number(norm);
  return Number.isFinite(n) ? n : NaN;
}

let counter = 0;
export function newId(): string {
  counter += 1;
  return `i${Date.now().toString(36)}${counter.toString(36)}`;
}

export type ImportResult = { items: Item[]; mapping: (Field | null)[]; headers: string[]; skipped: number };

/** Turn a CSV file's text into items, using the heading map. */
export function importCsv(text: string): ImportResult {
  const rows = parseCsv(text);
  if (rows.length === 0) return { items: [], mapping: [], headers: [], skipped: 0 };
  const headers = rows[0].map((h) => h.trim());
  const mapping = mapHeadings(headers);
  const items: Item[] = [];
  let skipped = 0;
  for (const r of rows.slice(1)) {
    const get = (f: Field) => {
      const i = mapping.indexOf(f);
      return i >= 0 ? (r[i] ?? "").trim() : "";
    };
    const name = get("name");
    if (!name) {
      skipped++;
      continue;
    }
    items.push({
      id: newId(),
      name,
      material: get("material"),
      size: get("size").toUpperCase(),
      colour: get("colour"),
      quantity: toNumber(get("quantity")),
      cost: toNumber(get("cost")),
      price: toNumber(get("price")),
    });
  }
  return { items, mapping, headers, skipped };
}

export type Flag = { id: string; field: Field | "row"; message: string };

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().nonnegative().nullable(),
  cost: z.number().nonnegative().nullable(),
  price: z.number().nonnegative().nullable(),
});

/** Every problem worth a look before saving. Nothing is changed, only reported. */
export function validate(items: Item[]): Flag[] {
  const flags: Flag[] = [];
  const seen = new Map<string, string>();
  for (const it of items) {
    if (it.quantity === null) flags.push({ id: it.id, field: "quantity", message: "Missing quantity" });
    else if (Number.isNaN(it.quantity)) flags.push({ id: it.id, field: "quantity", message: "Quantity is not a number" });
    if (it.price === null) flags.push({ id: it.id, field: "price", message: "Missing price" });
    for (const f of ["quantity", "cost", "price"] as const) {
      const v = it[f];
      if (typeof v === "number" && Number.isNaN(v) && f !== "quantity") flags.push({ id: it.id, field: f, message: `${FIELD_LABEL[f]} is not a number` });
      if (typeof v === "number" && v < 0) flags.push({ id: it.id, field: f, message: `Negative ${FIELD_LABEL[f].toLowerCase()}` });
    }
    const parsed = itemSchema.safeParse(it);
    if (!parsed.success && typeof it.quantity === "number" && it.quantity >= 0 && !Number.isInteger(it.quantity)) {
      flags.push({ id: it.id, field: "quantity", message: "Quantity should be a whole number" });
    }
    if (it.size && !KNOWN_SIZES.includes(it.size) && !/^\d{1,2}$/.test(it.size)) {
      flags.push({ id: it.id, field: "size", message: `Unrecognised size "${it.size}"` });
    }
    if (typeof it.cost === "number" && typeof it.price === "number" && it.cost > 0 && it.price > 0 && it.price < it.cost) {
      flags.push({ id: it.id, field: "price", message: "Price is below cost" });
    }
    const key = `${fold(it.name)}|${fold(it.size)}|${fold(it.colour)}`;
    const prior = seen.get(key);
    if (prior) flags.push({ id: it.id, field: "row", message: "Same garment, size and colour listed twice" });
    else seen.set(key, it.id);
  }
  return flags;
}

function csvCell(v: string | number | null): string {
  const s = v === null || (typeof v === "number" && Number.isNaN(v)) ? "" : String(v);
  return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Backup file. Spanish headings, comma separated, opens in Excel and Sheets. */
export function toCsv(items: Item[]): string {
  const head = ["Prenda", "Material", "Talla", "Color", "Cantidad", "Costo", "Precio"];
  const lines = items.map((i) => [i.name, i.material, i.size, i.colour, i.quantity, i.cost, i.price].map(csvCell).join(","));
  return [head.join(","), ...lines].join("\r\n") + "\r\n";
}

/** Totals for the summary line. */
export function totals(items: Item[]) {
  let units = 0;
  let value = 0;
  for (const i of items) {
    const q = typeof i.quantity === "number" && i.quantity > 0 ? i.quantity : 0;
    units += q;
    if (typeof i.price === "number" && i.price > 0) value += q * i.price;
  }
  return { rows: items.length, units, value };
}

export const STORAGE_KEY = "bastilla.inventory.v1";

/** Read back what the page saved, discarding anything malformed. */
export function fromStorage(raw: string | null): Item[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((d) => d && typeof d.name === "string" && typeof d.id === "string")
      .map((d) => ({
        id: d.id,
        name: d.name,
        material: String(d.material ?? ""),
        size: String(d.size ?? ""),
        colour: String(d.colour ?? ""),
        quantity: typeof d.quantity === "number" ? d.quantity : null,
        cost: typeof d.cost === "number" ? d.cost : null,
        price: typeof d.price === "number" ? d.price : null,
      }));
  } catch {
    return [];
  }
}
