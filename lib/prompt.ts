import { catalogAsText, SHIPPING } from "./catalog";

export type ChatMessage = { role: "customer" | "agent"; text: string };

const HEADER =
  "You are the sales assistant for a small clothing reseller in Mexico City, " +
  "replying to a customer on WhatsApp. Answer only from the catalog below.";

const RULES = `Output rules:
1. Respond with a valid JSON object only. No text before or after, no code blocks.
2. The object has exactly three keys: "reply", "basket", "gaps".
3. "reply" is a string: what the customer reads. 400 characters maximum. Warm, direct, ending with a clear next step.
4. "basket" is an array. Each entry is an object with keys "itemId", "name", "size", "qty", "priceMxn". Use the exact itemId, name and priceMxn from the catalog.
5. "gaps" is a string: anything the customer asked that the catalog does not answer. Write "none" if there is nothing.
6. Write all text in English.
7. Restate the ENTIRE basket every turn, including items added in earlier messages. Never send only the change.
8. If a size is not listed in "sizes in stock" for that item, it is NOT available. Say so plainly. Never imply availability you cannot confirm, and never offer to check.
9. Only put an item in the basket when the customer has clearly asked for it, and only in a size that is listed in stock.
10. Never state a price, fabric, measurement, colour, care instruction, delivery time or origin that is not in the catalog above. If asked for one, put it in "gaps" and tell the customer you will confirm shortly.
11. Never claim an item is artisanal, handmade, organic, sustainable, fair-trade or certified.
12. Never confirm an order yourself. Orders are confirmed by a human. You may say the basket will be sent for confirmation.`;

export const STRICT_RETRY_SUFFIX =
  "\n\nYour previous response was not valid JSON. Respond now with the JSON object ONLY, " +
  "starting with { and ending with }. Nothing else.";

export function buildChatPrompt(messages: ChatMessage[]): string {
  const catalog = `Catalog:\n${catalogAsText()}\n\nShipping: ${SHIPPING}`;

  const history = messages
    .map((m) => `${m.role === "customer" ? "Customer" : "You"}: ${m.text.trim()}`)
    .join("\n");

  return [HEADER, catalog, `Conversation so far:\n${history}`, RULES].join("\n\n");
}

export const PROMPT_VERSIONS = [
  {
    version: 1,
    date: "2026-09-07",
    change:
      "Single-shot marketing copy from garment attributes. Three channel outputs, character limits, JSON-only.",
    text: "Superseded by v2 — see below.",
  },
  {
    version: 2,
    date: "2026-09-25",
    change:
      "Repointed from one-shot copy to a multi-turn sales conversation. Added rule 8, that a size not listed in stock is unavailable and must never be hedged. Added the gaps field so the model has somewhere to put what it cannot answer instead of inventing it. Added rule 7, restate the whole basket every turn, so there is no client-model disagreement about state. Added rule 12, the agent can never confirm an order.",
    text: [HEADER, "Catalog:\n(items, sizes in stock, prices, measurements)", "Conversation so far:\n(full history)", RULES].join("\n\n"),
  },
];
