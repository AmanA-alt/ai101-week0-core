import { z } from "zod";

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

const draftsSchema = z.object({
  instagram: z.string().trim().min(1),
  facebook: z.string().trim().min(1),
  whatsapp: z.string().trim().min(1),
});

export type Drafts = z.infer<typeof draftsSchema>;

export function stripFences(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last > first) s = s.slice(first, last + 1);
  return s;
}

export function parseModelResponse(raw: string): Drafts {
  const cleaned = stripFences(raw);

  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch {
    throw new ParseError("The model response is not valid JSON.");
  }

  const result = draftsSchema.safeParse(json);
  if (!result.success) {
    throw new ParseError("The JSON does not contain all three channels as non-empty strings.");
  }
  return result.data;
}
