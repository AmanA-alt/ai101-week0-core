export type GarmentAttrs = {
  itemName: string;
  category?: string;
  fabric?: string;
  details?: string;
  colors?: string;
  sizes?: string;
  priceMxn?: number;
  occasion?: string;
};

const FIELDS: Array<[keyof GarmentAttrs, string]> = [
  ["itemName", "Name"],
  ["category", "Category"],
  ["fabric", "Fabric"],
  ["details", "Details"],
  ["colors", "Colors"],
  ["sizes", "Sizes"],
  ["priceMxn", "Price (MXN)"],
  ["occasion", "Occasion"],
];

const HEADER =
  "You are a copywriter for a clothing boutique. Using the garment data below, " +
  "write three sales drafts, one per channel.\n\nGarment data:";

const RULES = `Output rules:
1. Respond with a valid JSON object only. No text before or after, no explanations, no code blocks.
2. The object has exactly three keys: "instagram", "facebook", "whatsapp". All three values are strings.
3. Write all text in English.
4. "instagram": 400 characters maximum. End with 3 to 5 hashtags. One emoji maximum in the whole text.
5. "facebook": between 60 and 120 words, running prose, no hashtags and no emojis. Mention the price if one was provided.
6. "whatsapp": 300 characters maximum, direct and personal tone, ending with a question.
7. Use only the data provided above. Do not invent fabrics, colors, sizes, prices, measurements, care instructions, fit claims or country of origin.
8. Never claim the garment is artisanal, handmade, organic, sustainable, fair-trade or hypoallergenic. Never mention certifications.
9. If a field was not provided, do not mention it and do not substitute another value for it.`;

export const STRICT_RETRY_SUFFIX =
  "\n\nYour previous response was not valid JSON. Respond now with the JSON object ONLY, " +
  "starting with { and ending with }. Nothing else.";

function isSupplied(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export function buildPrompt(attrs: GarmentAttrs): string {
  const supplied = FIELDS.filter(([key]) => isSupplied(attrs[key]))
    .map(([key, label]) => `- ${label}: ${String(attrs[key]).trim()}`)
    .join("\n");

  return [HEADER, supplied, RULES].join("\n\n");
}

export const PROMPT_VERSIONS = [
  {
    version: 1,
    date: "2026-09-07",
    change: "Initial version: three channels, character limits, JSON-only output.",
    text: [HEADER, "- (garment fields)", RULES].join("\n\n"),
  },
];
