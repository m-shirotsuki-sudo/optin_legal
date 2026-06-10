import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.company_id || !body?.name || !body?.version || !body?.template_html) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("plans")
    .insert({
      company_id: body.company_id,
      name: body.name,
      version: body.version,
      is_active: body.is_active ?? true,
      template_html: body.template_html,
      variable_fields: body.variable_fields ?? [],
      constants: body.constants ?? {},
      original_checksum: body.original_checksum ?? null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
