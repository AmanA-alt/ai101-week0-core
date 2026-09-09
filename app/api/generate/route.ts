import { NextResponse } from "next/server";
import { z } from "zod";
import { buildPrompt, STRICT_RETRY_SUFFIX } from "@/lib/prompt";
import { parseModelResponse, ParseError } from "@/lib/parse";
import { callModel, RateLimitError, ConfigError } from "@/lib/model";

export const runtime = "nodejs";

const bodySchema = z.object({
  itemName: z.string().trim().min(1),
  category: z.string().trim().optional(),
  fabric: z.string().trim().optional(),
  details: z.string().trim().optional(),
  colors: z.string().trim().optional(),
  sizes: z.string().trim().optional(),
  priceMxn: z.coerce.number().nonnegative().optional(),
  occasion: z.string().trim().optional(),
});

export async function POST(req: Request) {
  let attrs;
  try {
    attrs = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "validation", message: "Item name is required." },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(attrs);

  try {
    let raw = await callModel(prompt);
    try {
      return NextResponse.json({ drafts: parseModelResponse(raw), attrs });
    } catch (err) {
      if (!(err instanceof ParseError)) throw err;
      raw = await callModel(prompt + STRICT_RETRY_SUFFIX);
      return NextResponse.json({ drafts: parseModelResponse(raw), attrs });
    }
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: "rate_limited", retryAfterSeconds: err.retryAfterSeconds },
        { status: 429 }
      );
    }
    if (err instanceof ConfigError) {
      return NextResponse.json({ error: "config", message: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "model_error", message: "The model did not return a usable result." },
      { status: 502 }
    );
  }
}
