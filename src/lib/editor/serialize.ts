import type { VariableField } from "@/types/contract";

/**
 * テンプレHTML（保存形式）⇔ TipTap編集用HTML の相互変換。
 *
 * - 保存形式: `{{customer_name}}`, `<div class="page-break"></div>` を直接含む素のHTML
 * - 編集用 : `{{key}}` を `<span data-variable="key" data-label="氏名"></span>` に置換した形
 *
 * これによりエディタ上では「氏名」というチップ表示・保存時は元に戻る。
 * page-break はそのまま <div class="page-break"></div> でやり取りする
 * （TipTap側のPageBreakNodeが parseHTML で拾う）。
 */

/** 保存形式 → 編集形式（読み込み時） */
export function templateToEditorHtml(
  html: string,
  fields: VariableField[] | null | undefined
): string {
  const labelMap = buildLabelMap(fields ?? []);
  // {{key}} or {{date:key}} を span に置換
  return html.replace(/\{\{(date:)?([a-zA-Z0-9_]+)\}\}/g, (_m, dateMod, key) => {
    const label = (dateMod ? "📅 " : "") + (labelMap.get(key) || key);
    return `<span data-variable="${key}" data-label="${escapeAttr(label)}">{{${dateMod ? "date:" : ""}${key}}}</span>`;
  });
}

/** 編集形式 → 保存形式（保存時） */
export function editorHtmlToTemplate(html: string): string {
  // span.var-chip / span[data-variable] の中身（{{key}}）だけを残す。
  // タグごと中身に置換する。
  return html.replace(
    /<span[^>]*data-variable="([^"]+)"[^>]*>(?:[^<]*)?<\/span>/g,
    (_m, key) => `{{${key}}}`
  );
}

function buildLabelMap(fields: VariableField[] | any[]): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (items: any[]) => {
    for (const item of items) {
      if (item && Array.isArray(item.fields)) walk(item.fields);
      else if (item && item.key) map.set(item.key, item.label ?? item.key);
    }
  };
  walk(fields);
  return map;
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 階層化された variable_fields を平らな key の配列に */
export function flatVariableKeys(fields: any[]): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const walk = (items: any[]) => {
    for (const item of items) {
      if (item && Array.isArray(item.fields)) walk(item.fields);
      else if (item && item.key) out.push({ key: item.key, label: item.label ?? item.key });
    }
  };
  walk(fields);
  return out;
}
