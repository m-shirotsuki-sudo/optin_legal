import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderTemplate } from "@/lib/render";
import { buildPrintableHtml, htmlToPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.plan_id !== "string" || typeof body.values !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { plan_id, values } = body as { plan_id: string; values: Record<string, string> };

  // テンプレ取得は service_role でも安全（公開しない情報を含むのでサーバー側で扱う）
  const admin = createSupabaseAdminClient();
  const { data: plan, error } = await admin
    .from("plans")
    .select("id, name, version, template_html, is_active")
    .eq("id", plan_id)
    .single();

  if (error || !plan) {
    return NextResponse.json({ error: "plan not found" }, { status: 404 });
  }
  if (!plan.is_active) {
    return NextResponse.json({ error: "plan is not active" }, { status: 409 });
  }

  // 本文を可変値で差し込み → A4印刷用にラップ → Puppeteerへ
  const inner = renderTemplate(plan.template_html, values);
  const fullHtml = buildPrintableHtml(inner);

  let pdf: Uint8Array;
  try {
    pdf = await htmlToPdf(fullHtml);
  } catch (e: any) {
    console.error("[pdf]", e);
    return NextResponse.json({ error: "PDF生成エラー: " + (e?.message ?? e) }, { status: 500 });
  }

  // 発行履歴を記録（認証セッションがある場合は created_by を埋める）
  try {
    const ss = createSupabaseServerClient();
    const { data: userData } = await ss.auth.getUser();
    await admin.from("contracts").insert({
      plan_id: plan.id,
      created_by: userData?.user?.id ?? null,
      input_values: values,
    });
  } catch (e) {
    console.warn("[pdf] contracts insert skipped:", e);
  }

  return new Response(pdf as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(plan.name)}_${plan.version}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
