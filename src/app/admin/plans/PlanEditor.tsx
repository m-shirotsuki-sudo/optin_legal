"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Company, Plan } from "@/types/contract";
import { renderTemplate } from "@/lib/render";
import { RichTemplateEditor } from "@/components/admin/RichTemplateEditor";

interface Props {
  companies: Company[];
  plan?: Plan;
}

export function PlanEditor({ companies, plan }: Props) {
  const router = useRouter();
  const editing = !!plan;
  const [busy, setBusy] = useState(false);

  const [companyId, setCompanyId] = useState(plan?.company_id ?? companies[0]?.id ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [version, setVersion] = useState(plan?.version ?? new Date().toISOString().slice(0, 10).replace(/-/g, ""));
  const [isActive, setIsActive] = useState(plan?.is_active ?? true);
  const [templateHtml, setTemplateHtml] = useState(plan?.template_html ?? "");
  const [variableFieldsJson, setVariableFieldsJson] = useState(
    JSON.stringify(plan?.variable_fields ?? [], null, 2)
  );
  const [constantsJson, setConstantsJson] = useState(
    JSON.stringify(plan?.constants ?? {}, null, 2)
  );

  const [docxUploading, setDocxUploading] = useState(false);
  const [keyphrases, setKeyphrases] = useState<string[]>(
    (plan?.original_checksum?.keyphrases as string[]) ?? []
  );
  const [missingPhrases, setMissingPhrases] = useState<string[]>([]);
  const [verifyMsg, setVerifyMsg] = useState<string>("");

  // docx 取込（テンプレ本文を一括差し替え）用の状態
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string>("");

  // PDF実物プレビュー用 iframe URL（blob URL）
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>("");
  const [pdfPreviewing, setPdfPreviewing] = useState(false);

  // 編集モード：html=生HTML編集（既存の複雑テンプレを安全に編集）、
  //              visual=ビジュアル編集（docx取込直後など、まだ構造がシンプルな時用）
  // 既定はHTML。複雑なクラス構造（.notice-box, .doc-title 等）はTipTapが
  // 取り込み時に剥がしてしまうため、既存テンプレに対しては破壊的になる。
  const [editMode, setEditMode] = useState<"visual" | "html">("html");

  // 可変フィールド一覧を解析（ビジュアルエディタのチップ表示・挿入メニュー用）
  const parsedVariableFields = useMemo(() => {
    try {
      const v = JSON.parse(variableFieldsJson);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }, [variableFieldsJson]);

  const previewHtml = useMemo(() => renderTemplate(templateHtml, {}), [templateHtml]);

  // docxを読み込んで本文HTMLに一括差し替え
  async function importDocx(file: File) {
    if (templateHtml.trim().length > 0) {
      const ok = confirm("既存の本文HTMLを破棄して docx の内容で置き換えます。よろしいですか？");
      if (!ok) return;
    }
    setImporting(true);
    setImportMsg("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/import-docx", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setImportMsg("❌ 取込失敗：" + json.error);
        return;
      }
      setTemplateHtml(json.html);
      const warn = (json.messages ?? []).filter((m: any) => m.type === "warning").length;
      setImportMsg(
        `✅ docxから本文を取り込みました。${warn > 0 ? `（${warn}件の変換警告あり）` : ""} ` +
          `第○条 の見出し化と可変箇所の {{key}} 化は手で調整してください。`
      );
    } catch (e: any) {
      setImportMsg("❌ 取込失敗：" + e?.message);
    } finally {
      setImporting(false);
    }
  }

  // 現在の本文HTMLでPDFを生成して iframe にプレビュー
  async function previewPdf() {
    setPdfPreviewing(true);
    try {
      const res = await fetch("/api/admin/preview-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_html: templateHtml }),
      });
      if (!res.ok) {
        alert("PDFプレビュー失敗：" + (await res.text()));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(url);
    } finally {
      setPdfPreviewing(false);
    }
  }

  async function uploadDocx(file: File) {
    setDocxUploading(true);
    setVerifyMsg("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("template_html", templateHtml);
      const res = await fetch("/api/admin/verify-docx", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setVerifyMsg("❌ 解析失敗：" + json.error);
        return;
      }
      setKeyphrases(json.keyphrases);
      setMissingPhrases(json.missing);
      setVerifyMsg(
        json.missing.length === 0
          ? `✅ 原本との照合OK（${json.keyphrases.length}キーフレーズすべて一致）。保存可能です。`
          : `⚠️ 原本に存在するが本文テンプレに欠落しているフレーズが ${json.missing.length} 件あります。下に一覧表示。`
      );
    } finally {
      setDocxUploading(false);
    }
  }

  async function save() {
    let variable_fields: unknown, constants: unknown;
    try {
      variable_fields = JSON.parse(variableFieldsJson);
    } catch {
      alert("variable_fields のJSONが壊れています。");
      return;
    }
    try {
      constants = JSON.parse(constantsJson);
    } catch {
      alert("constants のJSONが壊れています。");
      return;
    }
    if (!companyId || !name || !version || !templateHtml) {
      alert("会社／サービス名／バージョン／本文テンプレは必須です。");
      return;
    }
    if (missingPhrases.length > 0) {
      const ok = confirm(
        `原本照合で ${missingPhrases.length} 件の欠落が検出されています。それでも保存しますか？\n（推奨：欠落を埋めてから保存）`
      );
      if (!ok) return;
    }
    setBusy(true);
    try {
      const res = await fetch(editing ? `/api/admin/plans/${plan!.id}` : "/api/admin/plans", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          name,
          version,
          is_active: isActive,
          template_html: templateHtml,
          variable_fields,
          constants,
          original_checksum:
            keyphrases.length > 0
              ? { keyphrases, verified_at: new Date().toISOString() }
              : null,
        }),
      });
      if (!res.ok) {
        alert("保存に失敗しました：" + (await res.text()));
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 80px" }}>
      <Link href="/admin" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13 }}>
        ← 管理画面に戻る
      </Link>
      <h1 style={{ fontSize: 22, margin: "8px 0 16px" }}>
        {editing ? `${name || plan?.name} を編集` : "サービス／プランを追加"}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <Section title="基本情報">
            <Field label="会社">
              <select style={input} value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}（{c.code}）</option>
                ))}
              </select>
            </Field>
            <Field label="サービス名">
              <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="VIPプラン" />
            </Field>
            <Field label="バージョン">
              <input style={input} value={version} onChange={(e) => setVersion(e.target.value)} placeholder="20260519" />
            </Field>
            <Field label="状態">
              <label style={{ fontSize: 13 }}>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span style={{ marginLeft: 6 }}>このバージョンを稼働中にする（セールス画面に出す）</span>
              </label>
            </Field>
          </Section>

          <Section title="原本docxとの照合（刷新事故防止）">
            <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: "0 0 10px" }}>
              原本docxをアップロード → サーバーで `word/document.xml` を直読みし、テキストボックス内（赤枠注意文・第9条クーリングオフ等）も含めキーフレーズを抽出 → 本文テンプレと照合します。
            </p>
            <input
              type="file"
              accept=".docx"
              onChange={(e) => e.target.files?.[0] && uploadDocx(e.target.files[0])}
              disabled={docxUploading}
            />
            {docxUploading && <p style={{ fontSize: 12, marginTop: 8 }}>解析中…</p>}
            {verifyMsg && (
              <p style={{ fontSize: 12, marginTop: 10, padding: "8px 10px", background: missingPhrases.length === 0 ? "#e3f3e8" : "#fdecea", borderRadius: 6 }}>
                {verifyMsg}
              </p>
            )}
            {missingPhrases.length > 0 && (
              <details style={{ marginTop: 10 }}>
                <summary style={{ fontSize: 12, cursor: "pointer" }}>欠落フレーズ一覧（{missingPhrases.length}件）</summary>
                <ul style={{ fontSize: 11, color: "#c0392b", maxHeight: 200, overflow: "auto", paddingLeft: 18 }}>
                  {missingPhrases.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </details>
            )}
          </Section>

          <Section title="可変フィールド定義（JSON）">
            <textarea
              style={{ ...input, height: 160, fontFamily: "monospace", fontSize: 12 }}
              value={variableFieldsJson}
              onChange={(e) => setVariableFieldsJson(e.target.value)}
            />
          </Section>

          <Section title="定数（金額・口座など参考表示用 JSON）">
            <textarea
              style={{ ...input, height: 100, fontFamily: "monospace", fontSize: 12 }}
              value={constantsJson}
              onChange={(e) => setConstantsJson(e.target.value)}
            />
          </Section>

          <Section title="本文HTMLテンプレート">
            <p style={{ fontSize: 12, color: "var(--ink-soft)", margin: "0 0 6px" }}>
              <code>{`{{key}}`}</code> 形式の可変箇所以外は<b>すべて原本ママ</b>。日付は <code>{`{{date:contract_date}}`}</code>。
            </p>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, padding: "8px 10px", background: "#eef5ff", borderRadius: 6, border: "1px solid #cfe0f1" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#2a4a6b" }}>📄 docxから本文を取込：</span>
              <input
                type="file"
                accept=".docx"
                onChange={(e) => e.target.files?.[0] && importDocx(e.target.files[0])}
                disabled={importing}
                style={{ fontSize: 12 }}
              />
              {importing && <span style={{ fontSize: 12 }}>変換中…</span>}
            </div>
            {importMsg && (
              <p style={{ fontSize: 12, margin: "0 0 8px", padding: "6px 10px", background: importMsg.startsWith("✅") ? "#e3f3e8" : "#fdecea", borderRadius: 6 }}>
                {importMsg}
              </p>
            )}
            <div style={{ display: "flex", gap: 6, marginBottom: 6, fontSize: 11, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setEditMode("html")}
                style={{
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "1px solid #d8dde7",
                  background: editMode === "html" ? "#2f6dd1" : "#fff",
                  color: editMode === "html" ? "#fff" : "#14171d",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {`</> HTML直接編集（安全・推奨）`}
              </button>
              <button
                type="button"
                onClick={() => {
                  const ok = confirm(
                    "⚠️ ビジュアル編集は実験中です。\n\n" +
                      "複雑なHTML（赤囲み枠、独自CSSクラス等）を含むテンプレでは、" +
                      "切替時に一部の見た目が剥がれる可能性があります。" +
                      "保存ボタンを押さなければDBは変更されません。\n\n" +
                      "切り替えますか？"
                  );
                  if (ok) setEditMode("visual");
                }}
                style={{
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "1px solid #d8dde7",
                  background: editMode === "visual" ? "#2f6dd1" : "#fff",
                  color: editMode === "visual" ? "#fff" : "#14171d",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ✏️ ビジュアル編集（実験中）
              </button>
              <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                ※ 既存テンプレを編集中の方は「HTML直接編集」のままで。docx取込直後はビジュアル編集が楽です。
              </span>
            </div>
            {editMode === "visual" ? (
              <RichTemplateEditor
                value={templateHtml}
                onChange={setTemplateHtml}
                variableFields={parsedVariableFields}
              />
            ) : (
              <textarea
                style={{ ...input, height: 380, fontFamily: "monospace", fontSize: 12 }}
                value={templateHtml}
                onChange={(e) => setTemplateHtml(e.target.value)}
              />
            )}
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 12, cursor: "pointer", color: "var(--accent)" }}>
                改ページ・文字切れを調整したい時（クリックで展開）
              </summary>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: "var(--ink)", background: "#f7f9fc", padding: "10px 12px", borderRadius: 6, marginTop: 6 }}>
                テンプレ本文に下記タグを埋め込むと、生成PDFの改ページを制御できます。
                <ul style={{ paddingLeft: 18, margin: "6px 0" }}>
                  <li>
                    <code>{`<div class="page-break"></div>`}</code>
                    　← ここで<b>必ず改ページ</b>。条と条の間、署名ブロックの直前などに置く。
                  </li>
                  <li>
                    <code>{`<div class="keep-together">…</div>`}</code>
                    　← このブロックの<b>途中で改ページしない</b>。表や条文ブロックを丸ごと包む。
                  </li>
                  <li>
                    <code>{`<div class="keep-with-next">…</div>`}</code>
                    　← 直後の要素と<b>離さない</b>（見出しだけページ末に残るのを防ぐ）。
                  </li>
                  <li>
                    <code>{`<span class="no-break">100,000円</span>`}</code>
                    　← この行内テキストを<b>折り返さない</b>。金額・口座番号などに。
                  </li>
                </ul>
                既に <code>.article</code> / <code>.svc-table</code> / <code>.pay-table</code> は<b>標準で途中改ページ禁止</b>になっています。
                上のプレビューは1枚に圧縮表示なので、改ページ位置の確認は<b>実際にPDFを発行して確認</b>してください。
              </div>
            </details>
          </Section>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={save} disabled={busy} style={btn}>
              {busy ? "保存中…" : editing ? "保存する" : "作成する"}
            </button>
          </div>
        </div>

        <div>
          <Section title="プレビュー（赤い点線＝A4の改ページ位置）">
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button onClick={previewPdf} disabled={pdfPreviewing || !templateHtml} style={{ ...btn, padding: "6px 14px", fontSize: 12 }}>
                {pdfPreviewing ? "生成中…" : "📄 PDFで実物プレビュー"}
              </button>
              {pdfPreviewUrl && (
                <a href={pdfPreviewUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--accent)", alignSelf: "center" }}>
                  別タブで開く →
                </a>
              )}
            </div>
            {pdfPreviewUrl && (
              <iframe
                src={pdfPreviewUrl}
                style={{ width: "100%", height: 600, border: "1px solid var(--line)", borderRadius: 6, marginBottom: 12, background: "#eee" }}
                title="PDFプレビュー"
              />
            )}
            <div style={a4WrapperStyle}>
              <div
                className="contract-page"
                style={a4PageStyle}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
            <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 6, lineHeight: 1.5 }}>
              ↑ 赤い点線が <b>A4の改ページ境界</b>。点線を文字がまたぐと、その位置でページが割れます。
              境界の直前で <code>{`<div class="page-break"></div>`}</code> を入れると、強制的に次のページから始まります。
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", color: "var(--ink-soft)", textTransform: "uppercase", margin: "0 0 8px" }}>{title}</h2>
      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: 14 }}>{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{label}</span>
      {children}
    </label>
  );
}

const input: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 7, fontSize: 13.5, fontFamily: "inherit", background: "#fff" };
const btn: React.CSSProperties = { padding: "10px 22px", background: "var(--accent)", color: "#fff", borderRadius: 7, border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14 };
// A4プレビュー：210mm幅で表示し、297mm刻みで赤い点線を引いて改ページ境界を可視化。
// スクロールは .article-page 自体に縦に流す。CSSのrepeating-linear-gradient で
// 「ほぼ透明 → 短い赤 → 透明」を繰り返すことで点線を描画。
const a4WrapperStyle: React.CSSProperties = {
  width: "210mm",
  maxWidth: "100%",
  margin: "0 auto",
  background: "#fff",
  border: "1px solid var(--line)",
  borderRadius: 4,
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,.06)",
  transform: "scale(.72)",
  transformOrigin: "top center",
};
const a4PageStyle: React.CSSProperties = {
  width: "210mm",
  // 297mm（A4の縦）刻みで、上から下に向かって薄い赤の境界線を引く。
  // repeating-linear-gradient で「ほぼ全部透明、最後の1mmだけ赤」を 297mm 周期で繰り返す。
  // 注：PDF生成時の .contract-page padding は 14mm 16mm。プレビューでは 20mm 18mm
  // (globals.css) なので位置は数mm差がある。厳密には「PDFで実物プレビュー」で確認。
  backgroundImage:
    "repeating-linear-gradient(to bottom, transparent 0, transparent calc(297mm - 1px), #ff5050 calc(297mm - 1px), #ff5050 297mm)",
};
