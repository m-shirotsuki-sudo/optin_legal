import JSZip from "jszip";

/**
 * docx (Word) からテキストを抽出する。
 *
 * 重要：mammoth / officeparser 系のライブラリは図形（テキストボックス）内の文字を
 * 取りこぼすことが実際にあった（Men's Rise 原本の赤枠注意文・第9条クーリングオフが
 * テキストボックス内にあり、ライブラリ抽出ではゼロ件だった）。
 *
 * そこで `word/document.xml` を直接読み、すべての `<w:t>` を順に連結する。
 * これにより `<w:txbxContent>` 内の `<w:t>` も自動的に拾われる。
 */
export async function extractDocxText(buffer: ArrayBuffer | Uint8Array | Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const documentXmlFile = zip.file("word/document.xml");
  if (!documentXmlFile) {
    throw new Error("docxの中に word/document.xml が見つかりません。");
  }
  const xml = await documentXmlFile.async("string");

  // <w:t ...>テキスト</w:t> を順に拾う。改行や段落区切りは <w:br/> / </w:p> を改行に変換。
  let normalized = xml
    .replace(/<w:br\b[^/]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:tab\b[^/]*\/>/g, "\t");

  const parts: string[] = [];
  const re = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(normalized)) !== null) {
    parts.push(decodeXmlEntities(m[1]));
  }
  // 改行は <w:p> 単位で残したいので、XMLから抽出した本文を結合
  // ※ 改行情報はテキストで保持したいケースのため、normalizedの構造から段落単位に組み直す
  const paragraphs = normalized.split("\n");
  const textParagraphs: string[] = [];
  for (const para of paragraphs) {
    const buf: string[] = [];
    const re2 = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
    let mm: RegExpExecArray | null;
    while ((mm = re2.exec(para)) !== null) {
      buf.push(decodeXmlEntities(mm[1]));
    }
    const line = buf.join("");
    if (line.length > 0) textParagraphs.push(line);
  }
  return textParagraphs.join("\n");
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** HTMLタグと {{var}} を取り除いて、原本との照合用の素テキストを返す。 */
export function stripHtmlAndPlaceholders(html: string): string {
  return html
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, "");
}
