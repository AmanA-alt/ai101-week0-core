import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";
import {
  EXPERIMENTS,
  EXPERIMENT_IDS,
  assignVariant,
  isKnownVariant,
  tallyEvents,
  canCallWinner,
  MIN_IMPRESSIONS_TO_CALL,
  type ExperimentId,
} from "@/lib/ab";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A/B events.
 *
 * The browser tells us which variant it displayed, and writing that straight
 * to the table would be one less line. It would also mean anyone with a
 * terminal could post a thousand clicks against whichever headline they wanted
 * and the experiment would measure nothing.
 *
 * So the route re-derives the variant from the visitor id using the same pure
 * function the page used, and rejects the event if the two disagree. Same
 * principle as the week 3 scenarios route recomputing revenue rather than
 * storing what the client claimed.
 */

const bodySchema = z.object({
  experimentId: z.enum(["headline", "cta"]),
  variant: z.string().trim().min(1).max(40),
  event: z.enum(["impression", "click"]),
  visitorId: z.string().trim().min(8).max(100),
});

/** Enough rows to tally honestly without pulling the whole table forever. */
const MAX_ROWS = 5000;

export async function GET() {
  const { data, error } = await supabaseServer()
    .from("ab_events")
    .select("experiment, variant, event")
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const rows = data ?? [];
  const results = EXPERIMENT_IDS.map((id) => {
    const counts = tallyEvents(rows, id);
    return {
      id,
      question: EXPERIMENTS[id].question,
      metric: EXPERIMENTS[id].metric,
      counts,
      callable: canCallWinner(counts),
      minToCall: MIN_IMPRESSIONS_TO_CALL,
    };
  });

  return NextResponse.json({ results });
}

export async function POST(req: Request) {
  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "validation", message: "Malformed event." },
      { status: 400 }
    );
  }

  const experimentId = body.experimentId as ExperimentId;

  if (!isKnownVariant(experimentId, body.variant)) {
    return NextResponse.json(
      { error: "unknown_variant", message: "That variant is not part of this experiment." },
      { status: 400 }
    );
  }

  // The guard. A client cannot credit an event to a variant it was never
  // assigned, because assignment is derived from the visitor id, not stored.
  const expected = assignVariant(body.visitorId, experimentId);
  if (expected !== body.variant) {
    return NextResponse.json(
      { error: "variant_mismatch", message: "Event does not match this visitor's assignment." },
      { status: 409 }
    );
  }

  const { error } = await supabaseServer().from("ab_events").insert({
    experiment: experimentId,
    variant: body.variant,
    event: body.event,
    visitor_id: body.visitorId,
  });

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
