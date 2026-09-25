import { z } from "zod";

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

const basketLineSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().min(1),
  size: z.string().min(1),
  qty: z.coerce.number().int().positive(),
  priceMxn: z.coerce.number().nonnegative(),
});

const chatSchema = z.object({
  reply: z.string().trim().min(1),
  basket: z.array(basketLineSchema),
  gaps: z.string(),
});

export type BasketLine = z.infer<typeof basketLineSchema>;
export type ChatResult = z.infer<typeof chatSchema>;

export function stripFences(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last > first) s = s.slice(first, last + 1);
  return s;
}

export function parseChatResponse(raw: string): ChatResult {
  const cleaned = stripFences(raw);

  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch {
    throw new ParseError("The model response is not valid JSON.");
  }

  const result = chatSchema.safeParse(json);
  if (!result.success) {
    throw new ParseError("The JSON does not match the expected reply/basket/gaps shape.");
  }
  return result.data;
}
