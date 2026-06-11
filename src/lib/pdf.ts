/**
 * HTML → PDF（A4縦・printBackground有効）。
 *
 * - 本番(Vercel/Serverless)：@sparticuz/chromium-min + puppeteer-core
 *   バイナリは同梱せず、実行時にGitHub Releasesから取得する。
 *   Vercel の関数サイズ50MB制限を確実に回避し、libnss3.so 等の
 *   shared lib も pack tar に含まれているため起動失敗しない。
 * - 開発(local Mac/Linux)：通常の puppeteer のフルChromiumを使う。
 */

// pack tar URL（バージョン更新時はここを @sparticuz/chromium-min の version と
// 合わせること）。v138以降は arch 別（x64/arm64）になっている。Vercel は x64。
// env CHROMIUM_PACK_URL で実行時に差し替え可。
const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar";

export async function htmlToPdf(html: string): Promise<Uint8Array> {
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  let browser: { newPage: () => Promise<any>; close: () => Promise<void> };

  if (isServerless || process.env.PUPPETEER_EXECUTABLE_PATH) {
    const puppeteer = (await import("puppeteer-core")).default;
    const chromium = (await import("@sparticuz/chromium-min")).default;

    // v149 で setHeadlessMode / defaultViewport / headless getter は削除済み。
    // graphics off だけ残す（WebGL不要・libnss3 等への依存を最小化）。
    chromium.setGraphicsMode = false;

    const packUrl = process.env.CHROMIUM_PACK_URL || CHROMIUM_PACK_URL;
    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH || (await chromium.executablePath(packUrl));

    browser = (await puppeteer.launch({
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
      executablePath,
      headless: true,
    })) as any;
  } else {
    // dev only：本番にはバンドルしないように動的import
    const puppeteer = (await import("puppeteer")).default;
    browser = (await puppeteer.launch({ headless: true })) as any;
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: true,
    });
    return pdf;
  } finally {
    await browser.close();
  }
}

/** PDF生成用にプレビューHTMLをラップする（contractdemo.html と同じ体裁を当てる）。 */
export function buildPrintableHtml(innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  html, body { margin: 0; padding: 0; background: #fff; }
  body { font-family: "Yu Mincho", "Hiragino Mincho ProN", "MS Mincho", serif; color: #14171d; }
  .contract-page { width: auto; padding: 14mm 16mm; font-size: 9.8pt; line-height: 1.72; }
  .contract-page .notice-box { border: 1.5px solid #FF0000; color: #FF0000; font-size: 9.4pt; line-height: 1.7; padding: 8px 12px; margin: 0 0 18px; text-align: justify; }
  .contract-page .doc-title { text-align: center; font-size: 15pt; font-weight: 700; letter-spacing: .28em; margin: 0 0 20px; }
  .contract-page .article { margin-bottom: 12px; }
  .contract-page .svc-table, .contract-page .pay-table { break-inside: avoid; page-break-inside: avoid; }
  .contract-page .article p, .contract-page .ind, .contract-page .ind2, .contract-page .env-block { break-inside: avoid; page-break-inside: avoid; }
  .contract-page .article-head { break-after: avoid; page-break-after: avoid; font-weight: 700; font-size: 10.4pt; margin-bottom: 3px; }
  .contract-page .article-head.red { color: #FF0000; }
  .contract-page .article p { margin: 0 0 4px; text-align: justify; }
  .contract-page .ind { padding-left: 1.5em; text-indent: -1.5em; }
  .contract-page .ind2 { padding-left: 2.7em; text-indent: -1.2em; }
  .contract-page .red { color: #FF0000; }
  .contract-page .svc-table, .contract-page .pay-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; line-height: 1.55; }
  .contract-page .svc-table th, .contract-page .svc-table td, .contract-page .pay-table th, .contract-page .pay-table td { border: 1px solid #555; padding: 5px 8px; text-align: left; vertical-align: top; }
  .contract-page .svc-table th { background: #f0f0f0; width: 38%; font-weight: 700; }
  .contract-page .pay-table td:first-child { width: 40%; }
  .contract-page .env-block { margin: 4px 0 4px 1.5em; font-size: 9.2pt; line-height: 1.5; }
  /* 印刷PDFでは可変箇所のハイライト & 「未入力」ラベルを消す */
  .contract-page .var { background: transparent; border-bottom: none; padding: 0; }
  .contract-page .var.empty { color: transparent; }
  .contract-page .var.empty::after { content: ""; }
  .contract-page .sign-block { margin-top: 16px; line-height: 1.4; }
  .contract-page .sign-block .party { font-weight: 700; margin: 9px 0 2px; }
  .contract-page .sign-line { margin: 1px 0; }
  .contract-page .name-seal { display: flex; justify-content: space-between; align-items: baseline; }
  .contract-page .name-seal .seal { color: #888; padding-right: 2em; }
  @page { size: A4; margin: 0; }
</style>
</head>
<body>
<div class="contract-page">
${innerHtml}
</div>
</body>
</html>`;
}
