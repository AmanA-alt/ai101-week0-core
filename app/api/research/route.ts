import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const recordSchema = z.object({
  source: z.string().trim().min(1),
  category: z.string().trim().min(1),
  note: z.string().trim().min(1),
});

export async function GET() {
  const { data, error } = await supabaseServer()
    .from("research_records")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req: Request) {
  let body;
  try {
    body = recordSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "validation", message: "Source, category and note are all required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer()
    .from("research_records")
    .insert(body)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
