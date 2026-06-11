import { NextRequest, NextResponse } from "next/server";
import { buildPrintableHtml, htmlToPdf } from "@/lib/pdf";
import { renderTemplate } from "@/lib/render";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * 未保存の本文HTMLを受け取って、その場でPDFを生成して返す。
 * 管理画面の「PDFで実物プレビュー」ボタン用エンドポイント。
 * 可変箇所はサーバ側でダミー値（_____）で埋める。
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.template_html !== "string") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { template_html, values } = body as { template_html: string; values?: Record<string, string> };
  const filled = renderTemplate(template_html, values ?? {});
  const fullHtml = buildPrintableHtml(filled);
  try {
    const pdf = await htmlToPdf(fullHtml);
    return new Response(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("[preview-pdf]", e?.stack || e);
    return NextResponse.json({ error: "PDF生成エラー: " + (e?.message ?? String(e)) }, { status: 500 });
  }
}
