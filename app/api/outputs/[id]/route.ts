import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

const patchSchema = z.object({
  usedChannel: z.enum(["instagram", "facebook", "whatsapp"]).nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body;
  try {
    body = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const { error } = await supabaseServer()
    .from("core_outputs")
    .update({ used_channel: body.usedChannel })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
