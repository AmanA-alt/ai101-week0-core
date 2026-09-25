import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const orderSchema = z.object({
  customerLabel: z.string().trim().optional(),
  basket: z
    .array(
      z.object({
        itemId: z.string().min(1),
        name: z.string().min(1),
        size: z.string().min(1),
        qty: z.coerce.number().int().positive(),
        priceMxn: z.coerce.number().nonnegative(),
      })
    )
    .min(1),
  transcript: z.array(z.object({ role: z.string(), text: z.string() })).optional(),
});

export async function GET() {
  const { data, error } = await supabaseServer()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req: Request) {
  let body;
  try {
    body = orderSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "validation", message: "The basket is empty." },
      { status: 400 }
    );
  }

  const subtotal = body.basket.reduce((sum, l) => sum + l.priceMxn * l.qty, 0);
  const itemCount = body.basket.reduce((sum, l) => sum + l.qty, 0);

  const { data, error } = await supabaseServer()
    .from("orders")
    .insert({
      customer_label: body.customerLabel ?? "Web demo customer",
      basket: body.basket,
      subtotal_mxn: subtotal,
      item_count: itemCount,
      status: "pending_review",
      transcript: body.transcript ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ id: data.id, status: "pending_review" });
}
