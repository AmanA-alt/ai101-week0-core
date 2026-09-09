import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const saveSchema = z.object({
  attrs: z.object({
    itemName: z.string().trim().min(1),
    category: z.string().trim().optional(),
    fabric: z.string().trim().optional(),
    details: z.string().trim().optional(),
    colors: z.string().trim().optional(),
    sizes: z.string().trim().optional(),
    priceMxn: z.coerce.number().nonnegative().optional(),
    occasion: z.string().trim().optional(),
  }),
  drafts: z.object({
    instagram: z.string().min(1),
    facebook: z.string().min(1),
    whatsapp: z.string().min(1),
  }),
});

export async function GET() {
  const { data, error } = await supabaseServer()
    .from("core_outputs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req: Request) {
  let body;
  try {
    body = saveSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const { attrs, drafts } = body;

  const { data, error } = await supabaseServer()
    .from("core_outputs")
    .insert({
      item_name: attrs.itemName,
      category: attrs.category ?? null,
      fabric: attrs.fabric ?? null,
      details: attrs.details ?? null,
      colors: attrs.colors ?? null,
      sizes: attrs.sizes ?? null,
      price_mxn: attrs.priceMxn ?? null,
      occasion: attrs.occasion ?? null,
      output_instagram: drafts.instagram,
      output_facebook: drafts.facebook,
      output_whatsapp: drafts.whatsapp,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
