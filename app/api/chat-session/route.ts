import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";
import { CATALOG } from "@/lib/catalog";
import { classify, isGuardrail, type Size } from "@/lib/guided";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The human checkpoint, and the feedback that follows it.
 *
 * The browser sends what the customer ASKED, not what the assistant concluded.
 * The route then re-runs the same classifier the page ran and counts the
 * guardrail hits itself, and it prices the basket from the catalog rather than
 * from the figures the browser attached.
 *
 * Both are the same decision made twice before: week 3 recomputes revenue
 * instead of storing the number the page claimed, and week 4 re-derives the
 * A/B variant instead of trusting the one the browser reports. Here the stake
 * is higher, because these rows are the evidence that the guardrail fired. If
 * the client could set guardrail_hits, the evidence would be worth nothing,
 * and a stored total the catalog disagrees with is how a customer ends up
 * quoted a price that was never real.
 *
 * Nothing written here is an order. There is no route in this project that
 * creates one, which is the product's entire argument.
 */

const MAX_QUESTIONS = 40;

const saveSchema = z.object({
  action: z.literal("save"),
  visitorId: z.string().trim().min(8).max(100),
  lang: z.enum(["es", "en"]),
  intake: z
    .object({
      kind: z.enum(["blouse", "trousers", "dress", "jacket"]),
      size: z.enum(["S", "M", "L", "XL"]),
      budget: z.enum(["low", "mid", "any"]),
    })
    .nullable(),
  /** The customer's own words, so the server can judge them again. */
  questions: z.array(z.string().trim().min(1).max(500)).max(MAX_QUESTIONS),
  /** Ids and sizes only. Prices come from the catalog, never from here. */
  basket: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(20),
        size: z.enum(["S", "M", "L", "XL"]),
      })
    )
    .max(20),
});

const feedbackSchema = z.object({
  action: z.literal("feedback"),
  visitorId: z.string().trim().min(8).max(100),
  sessionId: z.string().uuid().nullable(),
  rating: z.enum(["up", "down"]),
  note: z.string().trim().max(500).optional(),
});

const bodySchema = z.discriminatedUnion("action", [saveSchema, feedbackSchema]);

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", detail: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();

  if (parsed.data.action === "feedback") {
    const { visitorId, sessionId, rating, note } = parsed.data;
    const { error } = await supabase.from("chat_feedback").insert({
      visitor_id: visitorId,
      session_id: sessionId,
      rating,
      note: note ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { visitorId, lang, intake, questions, basket } = parsed.data;

  // Re-judge every question here. The page's own count never reaches the table.
  const verdicts = questions.map(classify);
  const guardrailHits = verdicts.filter(isGuardrail).length;

  // Price from the catalog, and drop any line the catalog cannot confirm in
  // that size. A basket the catalog disagrees with is not a cheaper basket,
  // it is a wrong one.
  const priced = basket.flatMap((line) => {
    const item = CATALOG.find((i) => i.id === line.id);
    if (!item || !item.sizesInStock.includes(line.size)) return [];
    return [{ id: item.id, name: item.name, size: line.size as Size, priceMxn: item.priceMxn }];
  });
  const totalMxn = priced.reduce((sum, l) => sum + l.priceMxn, 0);
  const rejected = basket.length - priced.length;

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      visitor_id: visitorId,
      lang,
      intake,
      turns: questions.length,
      guardrail_hits: guardrailHits,
      basket: priced,
      total_mxn: totalMxn,
      status: "pending_review",
    })
    .select("id, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    sessionId: data.id,
    turns: questions.length,
    guardrailHits,
    basket: priced,
    totalMxn,
    rejected,
    status: "pending_review",
  });
}

/** Recent sessions, for the evidence panel on the page. */
export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, created_at, lang, intake, turns, guardrail_hits, total_mxn, status")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}
