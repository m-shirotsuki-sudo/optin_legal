/**
 * 同梱の原本docxと、シードに含まれる Men's Rise VIPテンプレ本文の整合を
 * ローカルでチェックするスクリプト。
 *
 *   pnpm tsx scripts/verifyOriginal.ts
 *
 * 期待結果：missing 0件。失敗したら、テンプレ本文が原本から乖離している。
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { extractDocxText } from "../src/lib/docxExtract";
import { extractKeyPhrases, diffKeyPhrases } from "../src/lib/checksum";
import { MENSRISE_VIP_TEMPLATE_HTML } from "../src/lib/seed/mensriseVipTemplate";

/**
 * 「想定どおり」の差分リスト。
 *
 * KICKOFF §6 のとおり、原本にあるがテンプレでは可変化／省略している項目を
 * 明示的にホワイトリストする。リストが膨らんだら、本当に原本通り保持すべきかを再点検すること。
 */
const EXPECTED_DIFF: string[] = [
  // 原本のテーブルヘッダ「内容（頻度、回数、各回の時間など）」 → デモ化時に省略
  "内容(頻度、回数、各回の時間など)",
  // KICKOFF §6: 「Mosh」は固定をやめ {{credit_company}} へ可変化
  "クレジット会社名:Mosh",
];

async function main() {
  const docxPath = path.join(process.cwd(), "samples", "MensRise_20260519.docx");
  if (!fs.existsSync(docxPath)) {
    console.error("原本docxが見つかりません:", docxPath);
    process.exit(1);
  }
  const buf = fs.readFileSync(docxPath);
  const text = await extractDocxText(buf);
  const keyphrases = extractKeyPhrases(text);
  const missing = diffKeyPhrases(MENSRISE_VIP_TEMPLATE_HTML, keyphrases);
  const expected = new Set(EXPECTED_DIFF);
  const unexpected = missing.filter((m) => !expected.has(m));
  const expectedFound = missing.filter((m) => expected.has(m));

  console.log(`原本キーフレーズ数 : ${keyphrases.length}`);
  console.log(`欠落フレーズ数     : ${missing.length}`);
  console.log(`  想定どおりの差分 : ${expectedFound.length} (KICKOFF §6 等で承認済み)`);
  console.log(`  予期せぬ欠落     : ${unexpected.length}`);

  if (unexpected.length === 0) {
    console.log("\n✅ テンプレ本文は原本docxを実質的に網羅しています。");
  } else {
    console.log("\n⚠️ 想定外の欠落フレーズがあります：");
    for (const m of unexpected.slice(0, 50)) console.log("  -", m);
    if (unexpected.length > 50) console.log(`  ... 他 ${unexpected.length - 50} 件`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
