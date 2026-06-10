import type { VariableFieldSpec, VariableField } from "@/types/contract";

/**
 * テンプレートHTML中の `{{key}}` または `{{date:key}}` を、入力値で置換する。
 *
 * - 値があれば `<span class="var">…</span>` で囲む（黄色ハイライト）
 * - 値が空なら `<span class="var empty"></span>`（画面で「（未入力）」、印刷で空白）
 * - `{{date:key}}` は ISO（YYYY-MM-DD）→「YYYY年M月D日」に変換してから埋める
 *
 * これにより：本文HTMLは1文字も触らず、可変箇所だけが差し変わる。
 */
export function renderTemplate(templateHtml: string, values: Record<string, string>): string {
  return templateHtml.replace(/\{\{(?:(date):)?([a-z_][a-z0-9_]*)\}\}/gi, (_match, fmt, key) => {
    let raw = values[key] ?? "";
    if (fmt === "date") raw = formatDateJa(raw);
    return wrapVar(raw);
  });
}

export function wrapVar(value: string): string {
  if (!value || !value.trim()) return '<span class="var empty"></span>';
  return `<span class="var">${escapeHtml(value)}</span>`;
}

export function formatDateJa(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${y}年${parseInt(m, 10)}月${parseInt(d, 10)}日`;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** variable_fields の入れ子（グループ）を展開して、平坦なフィールドリストにする。 */
export function flattenFields(spec: VariableFieldSpec[]): VariableField[] {
  const out: VariableField[] = [];
  for (const item of spec) {
    if ("fields" in item) out.push(...item.fields);
    else out.push(item);
  }
  return out;
}
