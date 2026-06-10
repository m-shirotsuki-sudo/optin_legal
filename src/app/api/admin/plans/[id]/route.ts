import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("plans")
    .update({
      company_id: body.company_id,
      name: body.name,
      version: body.version,
      is_active: body.is_active,
      template_html: body.template_html,
      variable_fields: body.variable_fields ?? [],
      constants: body.constants ?? {},
      original_checksum: body.original_checksum ?? null,
    })
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
