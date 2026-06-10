import { NextRequest, NextResponse } from "next/server";
import { extractDocxText } from "@/lib/docxExtract";
import { extractKeyPhrases, diffKeyPhrases } from "@/lib/checksum";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const templateHtml = (form.get("template_html") ?? "") as string;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file が必要です（.docx）" }, { status: 400 });
  }
  if (!templateHtml) {
    return NextResponse.json({ error: "template_html が空です" }, { status: 400 });
  }

  let originalText: string;
  try {
    const buf = await file.arrayBuffer();
    originalText = await extractDocxText(buf);
  } catch (e: any) {
    return NextResponse.json({ error: "docx解析エラー: " + (e?.message ?? e) }, { status: 400 });
  }

  const keyphrases = extractKeyPhrases(originalText);
  const missing = diffKeyPhrases(templateHtml, keyphrases);

  return NextResponse.json({
    keyphrases,
    missing,
    summary: {
      total_keyphrases: keyphrases.length,
      missing_count: missing.length,
      ok: missing.length === 0,
    },
  });
}
