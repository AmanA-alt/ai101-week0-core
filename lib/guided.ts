import { CATALOG, SHIPPING, type CatalogItem } from "./catalog";
import type { Lang, Localized } from "./i18n";

/**
 * The guided assistant, as pure functions.
 *
 * Week 5's testable surface, kept in its own file for the same reason the
 * pricing arithmetic and the A/B assignment are: it runs under Vitest with no
 * browser, no network and no API key, which is the only kind of test I can
 * actually run on a locked-down laptop.
 *
 * The rule the whole module exists to enforce: AVAILABILITY IS NEVER PHRASED
 * BY A LANGUAGE MODEL. Whether a size is in stock is a lookup against the
 * catalog, decided here, and the answer is the same every time. A model is
 * free to be fluent about a blouse; it is not free to decide whether the
 * blouse exists in a large. Getting that wrong costs the sale twice, because
 * the customer is disappointed and then stops believing the next answer too.
 *
 * Everything below is therefore deterministic. No randomness, no model call,
 * no clock.
 */

export type Kind = "blouse" | "trousers" | "dress" | "jacket";
export type Size = "S" | "M" | "L" | "XL";
export type Budget = "low" | "mid" | "any";

/** Which catalog item is which kind. Kept here so catalog.ts, which /core
 *  depends on, did not have to change shape for this week's feature. */
export const KIND_OF: Record<string, Kind> = {
  "BL-001": "blouse",
  "TR-002": "trousers",
  "DR-003": "dress",
  "JK-004": "jacket",
};

export const BUDGET_CAP: Record<Budget, number> = {
  low: 800,
  mid: 1200,
  any: Number.POSITIVE_INFINITY,
};

/* ------------------------------------------------------------ the intake */

export type IntakeId = "kind" | "size" | "budget";

export type IntakeStep = {
  id: IntakeId;
  question: Localized;
  options: { value: string; label: Localized }[];
};

/**
 * Three questions and no more.
 *
 * Marisol's customer is on a phone between other things. Every extra question
 * is a chance to close the tab, and these three are the minimum that let the
 * answer be a real recommendation rather than a catalog dump.
 */
export const INTAKE: IntakeStep[] = [
  {
    id: "kind",
    question: { es: "¿Qué estás buscando?", en: "What are you looking for?" },
    options: [
      { value: "blouse", label: { es: "Blusa", en: "Blouse" } },
      { value: "trousers", label: { es: "Pantalón", en: "Trousers" } },
      { value: "dress", label: { es: "Vestido", en: "Dress" } },
      { value: "jacket", label: { es: "Chamarra", en: "Jacket" } },
    ],
  },
  {
    id: "size",
    question: { es: "¿Qué talla usas?", en: "What size do you wear?" },
    options: [
      { value: "S", label: { es: "CH", en: "S" } },
      { value: "M", label: { es: "M", en: "M" } },
      { value: "L", label: { es: "G", en: "L" } },
      { value: "XL", label: { es: "EG", en: "XL" } },
    ],
  },
  {
    id: "budget",
    question: { es: "¿Cuál es tu presupuesto?", en: "What is your budget?" },
    options: [
      { value: "low", label: { es: "Hasta $800", en: "Up to $800" } },
      { value: "mid", label: { es: "Hasta $1,200", en: "Up to $1,200" } },
      { value: "any", label: { es: "Sin límite", en: "No limit" } },
    ],
  },
];

export type Intake = { kind: Kind; size: Size; budget: Budget };

export function isComplete(partial: Partial<Intake>): partial is Intake {
  return Boolean(partial.kind && partial.size && partial.budget);
}

/** Items that match all three answers. */
export function recommend(intake: Intake): CatalogItem[] {
  return CATALOG.filter(
    (i) =>
      KIND_OF[i.id] === intake.kind &&
      i.sizesInStock.includes(intake.size) &&
      i.priceMxn <= BUDGET_CAP[intake.budget]
  );
}

/**
 * Right kind, wrong size or over budget.
 *
 * Returned separately so the assistant can say what it does have instead of
 * going silent. Silence reads as "sold out everywhere" and loses a customer
 * who would happily have taken the next size.
 */
export function nearMisses(intake: Intake): CatalogItem[] {
  const matched = new Set(recommend(intake).map((i) => i.id));
  return CATALOG.filter((i) => KIND_OF[i.id] === intake.kind && !matched.has(i.id));
}

/* --------------------------------------------------------- the guardrail */

export type OffTopic = "discount" | "returns" | "custom" | "other";

export type Verdict =
  | { kind: "in_catalog"; item: CatalogItem; size: Size | null }
  | { kind: "size_unavailable"; item: CatalogItem; size: Size }
  | { kind: "not_on_file"; item: CatalogItem; field: "care" }
  | { kind: "shipping" }
  | { kind: "outside_catalog"; topic: OffTopic };

const ITEM_WORDS: Record<string, string[]> = {
  "BL-001": ["blusa", "blouse", "lino", "linen"],
  "TR-002": ["pantalon", "pantalón", "trouser", "trousers", "pants"],
  "DR-003": ["vestido", "dress", "wrap", "sage", "salvia"],
  "JK-004": ["chamarra", "chaqueta", "jacket", "mezclilla", "denim"],
};

const SIZE_WORDS: Record<string, Size> = {
  ch: "S", s: "S", chica: "S", small: "S",
  m: "M", mediana: "M", medium: "M",
  g: "L", l: "L", grande: "L", large: "L",
  eg: "XL", xg: "XL", xl: "XL",
};

const OFF_TOPIC_WORDS: { topic: OffTopic; words: string[] }[] = [
  { topic: "discount", words: ["descuento", "rebaja", "discount", "cupon", "promocion"] },
  { topic: "returns", words: ["devol", "return", "refund", "reembolso", "cambio"] },
  { topic: "custom", words: ["a la medida", "custom", "personalizado", "mandar hacer", "ajuste"] },
];

/*
  Stems rather than whole words, because Spanish conjugates: "lavar", "lavas",
  "lavado" and "lavarlo" are all the same question and all contain "lava".
  Matching whole words here would have let "¿cómo la lavas?" fall through to
  the catch-all and get handed to a human for no reason.
*/
const CARE_WORDS = ["lav", "cuidado", "plancha", "wash", "care", "iron"];
const SHIPPING_WORDS = ["envio", "envío", "entrega", "shipping", "delivery", "llega"];

/**
 * Lowercase, strip accents, turn every run of punctuation into a space, then
 * pad, so a standalone-token check cannot match inside a word.
 *
 * The punctuation step is not cosmetic. Spanish questions end in '?' and begin
 * in '¿', so "¿tienes la blusa en G?" ends with the token "g?" rather than
 * "g". Without this the size was simply never found, and the question fell
 * through to a cheerful in_catalog answer: exactly the invented-stock failure
 * this module exists to make impossible. The tests caught it on the first run.
 */
function normalise(text: string): string {
  const flat = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return ` ${flat} `;
}

function findItem(norm: string): CatalogItem | null {
  for (const item of CATALOG) {
    const words = ITEM_WORDS[item.id] ?? [];
    if (words.some((w) => norm.includes(normalise(w).trim()))) return item;
  }
  return null;
}

function findSize(norm: string): Size | null {
  for (const [word, size] of Object.entries(SIZE_WORDS)) {
    if (norm.includes(` ${word} `)) return size;
  }
  return null;
}

/**
 * Decide what kind of question this is, before any wording happens.
 *
 * Order matters. Off-topic is checked first, because "¿tienes descuento en la
 * blusa?" names a catalog item but is not a catalog question, and answering
 * the half it recognises would be worse than admitting it cannot help.
 */
export function classify(text: string): Verdict {
  const norm = normalise(text);

  for (const { topic, words } of OFF_TOPIC_WORDS) {
    if (words.some((w) => norm.includes(normalise(w).trim()))) {
      return { kind: "outside_catalog", topic };
    }
  }

  const item = findItem(norm);

  if (!item) {
    if (SHIPPING_WORDS.some((w) => norm.includes(normalise(w).trim()))) return { kind: "shipping" };
    return { kind: "outside_catalog", topic: "other" };
  }

  if (CARE_WORDS.some((w) => norm.includes(normalise(w).trim())) && !item.care) {
    return { kind: "not_on_file", item, field: "care" };
  }

  const size = findSize(norm);
  if (size && !item.sizesInStock.includes(size)) {
    return { kind: "size_unavailable", item, size };
  }

  return { kind: "in_catalog", item, size };
}

/** True when the verdict is one the guardrail had to catch. Counted per
 *  session, because a session that hit the guardrail twice is the interesting
 *  one to read afterwards. */
export function isGuardrail(v: Verdict): boolean {
  return v.kind === "size_unavailable" || v.kind === "not_on_file" || v.kind === "outside_catalog";
}

/** True when the honest answer is to stop and fetch a person. */
export function needsHuman(v: Verdict): boolean {
  return v.kind === "not_on_file" || v.kind === "outside_catalog";
}

const money = (n: number) => `$${n.toLocaleString("es-MX")}`;

export function answer(v: Verdict, lang: Lang): string {
  const es = lang === "es";
  switch (v.kind) {
    case "in_catalog": {
      const sizes = v.item.sizesInStock.join(", ");
      if (v.size) {
        return es
          ? `Sí, la ${v.item.name} está en talla ${v.size}, ${money(v.item.priceMxn)}. ${v.item.measurements}.`
          : `Yes, the ${v.item.name} is in ${v.size}, ${money(v.item.priceMxn)}. ${v.item.measurements}.`;
      }
      return es
        ? `La ${v.item.name} cuesta ${money(v.item.priceMxn)} y la tengo en ${sizes}.`
        : `The ${v.item.name} is ${money(v.item.priceMxn)} and I have it in ${sizes}.`;
    }
    case "size_unavailable":
      return es
        ? `No, la ${v.item.name} no la tengo en ${v.size}. Solo en ${v.item.sizesInStock.join(", ")}.`
        : `No, I do not have the ${v.item.name} in ${v.size}. Only in ${v.item.sizesInStock.join(", ")}.`;
    case "not_on_file":
      return es
        ? `No tengo los cuidados de la ${v.item.name} registrados. Prefiero confirmártelo antes que inventarlo.`
        : `I do not have care instructions on file for the ${v.item.name}. I would rather confirm than guess.`;
    case "shipping":
      return SHIPPING;
    case "outside_catalog":
      switch (v.topic) {
        case "discount":
          return es
            ? "Los descuentos los decide la vendedora, no yo. Te paso con ella."
            : "Discounts are the seller's decision, not mine. Let me hand you over.";
        case "returns":
          return es
            ? "Las devoluciones y cambios los ve la vendedora directamente. Te paso con ella."
            : "Returns and exchanges are handled by the seller directly. Let me hand you over.";
        case "custom":
          return es
            ? "Los ajustes a la medida no están en el catálogo. Te paso con la vendedora."
            : "Made-to-measure work is not in the catalog. Let me hand you over to the seller.";
        default:
          return es
            ? "Eso no está en el catálogo, así que no te lo puedo responder. Te paso con la vendedora."
            : "That is not in the catalog, so I cannot answer it. Let me hand you over to the seller.";
      }
  }
}

/* -------------------------------------------------------------- the basket */

export type BasketLine = { id: string; name: string; priceMxn: number; size: Size };

export function basketTotal(lines: BasketLine[]): number {
  return lines.reduce((sum, l) => sum + l.priceMxn, 0);
}

export type SessionSummary = {
  intake: Intake | null;
  turns: number;
  guardrailHits: number;
  basket: BasketLine[];
  totalMxn: number;
};

/**
 * What gets written when the customer sends the basket for review.
 *
 * It stores the assumptions as well as the answer, the same decision as the
 * Module 3 pricing scenarios: an old session should still say what the
 * customer asked for, even after the catalog has moved on.
 */
export function summarize(
  intake: Intake | null,
  verdicts: Verdict[],
  basket: BasketLine[]
): SessionSummary {
  return {
    intake,
    turns: verdicts.length,
    guardrailHits: verdicts.filter(isGuardrail).length,
    basket,
    totalMxn: basketTotal(basket),
  };
}
