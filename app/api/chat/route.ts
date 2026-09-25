import { NextResponse } from "next/server";
import { z } from "zod";
import { buildChatPrompt, STRICT_RETRY_SUFFIX } from "@/lib/prompt";
import { parseChatResponse, ParseError } from "@/lib/parse";
import { callModel, RateLimitError, ConfigError } from "@/lib/model";

export const runtime = "nodejs";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["customer", "agent"]),
        text: z.string().trim().min(1),
      })
    )
    .min(1)
    .max(40),
});

export async function POST(req: Request) {
  let messages;
  try {
    messages = bodySchema.parse(await req.json()).messages;
  } catch {
    return NextResponse.json(
      { error: "validation", message: "A non-empty message is required." },
      { status: 400 }
    );
  }

  const prompt = buildChatPrompt(messages);

  try {
    let raw = await callModel(prompt);
    try {
      return NextResponse.json(parseChatResponse(raw));
    } catch (err) {
      if (!(err instanceof ParseError)) throw err;
      raw = await callModel(prompt + STRICT_RETRY_SUFFIX);
      return NextResponse.json(parseChatResponse(raw));
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
      { error: "model_error", message: "The agent did not return a usable reply." },
      { status: 502 }
    );
  }
}
