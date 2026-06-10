import { stripHtmlAndPlaceholders } from "./docxExtract";

/**
 * 原本テキストから「照合用キーフレーズ群」を抽出する。
 * - 各行を空白除去で正規化
 * - 短い行（10文字未満）は除外（誤マッチ防止）
 * - 行が長すぎる場合は分割して登録（句点で区切る）
 *
 * 用途：管理者がテンプレを保存するとき、ここで返したキーフレーズ群が
 *      テンプレHTML（タグ除去後）に**すべて**含まれているかを照合する。
 *      ひとつでも欠けたら保存ブロック → 刷新事故を防ぐ。
 */
export function extractKeyPhrases(originalText: string): string[] {
  const out: string[] = [];
  for (const rawLine of originalText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    // 文末（。！？）で分割。長い段落でも、句点単位ならテンプレ側と一致しやすい。
    const sentences = line.split(/(?<=[。！？])/);
    for (const s of sentences) {
      const norm = normalize(s);
      if (norm.length >= 10) out.push(norm);
    }
  }
  return dedup(out);
}

/** テンプレHTMLが原本キーフレーズをすべて含むかチェック。差分（欠落）を返す。 */
export function diffKeyPhrases(templateHtml: string, keyphrases: string[]): string[] {
  const haystack = normalize(stripHtmlAndPlaceholders(templateHtml));
  const missing: string[] = [];
  for (const phrase of keyphrases) {
    if (!haystack.includes(phrase)) missing.push(phrase);
  }
  return missing;
}

/**
 * 照合用の文字列正規化。
 *
 * - 空白の除去
 * - Unicode NFKC 正規化（半角全角、Kangxi/CJK部首補助→通常のCJK統合漢字、ローマ数字など）
 * - 各種クォートを ASCII に寄せる（'/'/′/`/´ → '、"/"/″ → "）
 *
 * 実際の原本docxを解析すると、Word由来で「乙→⼄」「金→⾦」「行→⾏」などの
 * CJK部首補助コードポイントが混ざっており、肉眼では気付けない。NFKCで吸収する。
 */
function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[‘’ʼʻ´`′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/\s+/g, "")
    .trim();
}

function dedup(arr: string[]): string[] {
  return Array.from(new Set(arr));
}
