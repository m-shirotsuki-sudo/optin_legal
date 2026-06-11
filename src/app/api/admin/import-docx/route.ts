import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * docx を放り込むと本文HTMLに変換して返す。
 * mammoth は word/document.xml の段落・見出し・表・太字等を素直なHTMLに落とす。
 * 変換結果は `.contract-page` 配下に挿入される前提の **本文断片** であり、
 * 細かな整形（クーリングオフ枠の赤囲み、{{var}}マーカ等）は管理画面で人が追記する。
 */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "form invalid" }, { status: 400 });
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file missing" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());

  try {
    const result = await mammoth.convertToHtml(
      { buffer: buf },
      {
        // 余計な <p> ラップ・空 <p> を減らしつつ、見出し・表は保持。
        styleMap: [
          "p[style-name='Title'] => h1.doc-title:fresh",
          "p[style-name='Heading 1'] => h2.article-head:fresh",
          "p[style-name='Heading 2'] => h3.article-sub:fresh",
        ],
      }
    );

    // mammoth の出力は <p>…</p><table>…</table>… の素直な並び。
    // テンプレ側で .contract-page クラスを当てるので、ここでは中身だけ返す。
    const html = wrapArticles(result.value);

    return NextResponse.json({
      html,
      messages: result.messages, // 変換時の警告（未対応スタイル等）
    });
  } catch (e: any) {
    console.error("[import-docx]", e?.stack || e);
    return NextResponse.json({ error: "docx変換エラー: " + (e?.message ?? String(e)) }, { status: 500 });
  }
}

/**
 * mammoth の生出力に最低限の構造を足す。
 * - 第N条 で始まる段落は .article-head として強調
 * - 連続する段落を <div class="article"> で包む（任意位置に page-break を入れやすくする）
 */
function wrapArticles(html: string): string {
  // 第○条 で改ページ単位を明示できるよう、その直前に .page-break コメントを置いておく（コメントなので出力には影響しない、運用者が手で外す前提のヒント）
  return html.replace(
    /<p>(第[一二三四五六七八九十0-9０-９]+条[^<]*)<\/p>/g,
    '<!-- ここに <div class="page-break"></div> を入れると改ページします -->\n<p class="article-head">$1</p>'
  );
}
