import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";
import { splitMix, calculateRevenue, PRICE } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Saved pricing scenarios.
 *
 * The client sends the inputs, not the result. The revenue is recomputed here
 * with the same pure functions the page uses, so a tampered or stale client
 * cannot store a number that does not follow from its own assumptions — and so
 * the stored figure is always consistent with the stored inputs.
 */

const bodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  preset: z.string().trim().min(1).max(40),
  customers: z.coerce.number().int().min(1).max(100000),
  soloPct: z.coerce.number().min(0).max(100),
  negocioPct: z.coerce.number().min(0).max(100),
  churnPct: z.coerce.number().min(0).max(100),
});

export async function GET() {
  const { data, error } = await supabaseServer()
    .from("pricing_scenarios")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req: Request) {
  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "validation", message: "Give the scenario a name and valid inputs." },
      { status: 400 }
    );
  }

  const mix = splitMix(body.soloPct, body.negocioPct);
  const revenue = calculateRevenue(body.customers, mix);

  const { data, error } = await supabaseServer()
    .from("pricing_scenarios")
    .insert({
      name: body.name,
      preset: body.preset,
      customers: body.customers,
      share_solo: mix.solo,
      share_negocio: mix.negocio,
      share_taller: mix.taller,
      churn_pct: body.churnPct,
      price_solo: PRICE.solo,
      price_negocio: PRICE.negocio,
      price_taller: PRICE.taller,
      mrr_mxn: revenue.mrr,
      arr_mxn: revenue.arr,
      arpu_mxn: revenue.arpu,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ id: data.id, revenue });
}
