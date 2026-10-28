import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Saved marketing assets.
 *
 * The content library itself lives in the bundle; this table only holds the
 * pieces the user deliberately kept — a post they edited, a script they want
 * to find again. Append-only, like the week 2 research log: an asset log you
 * can rewrite afterwards is not a record of anything.
 */

const bodySchema = z.object({
  kind: z.enum(["post", "script", "copy"]),
  label: z.string().trim().min(1).max(120),
  channel: z.string().trim().max(40).optional(),
  lang: z.enum(["es", "en"]),
  body: z.string().trim().min(1).max(4000),
});

export async function GET() {
  const { data, error } = await supabaseServer()
    .from("marketing_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req: Request) {
  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "validation", message: "Give the asset a label and some text." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer()
    .from("marketing_assets")
    .insert({
      kind: body.kind,
      label: body.label,
      channel: body.channel ?? null,
      lang: body.lang,
      body: body.body,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
