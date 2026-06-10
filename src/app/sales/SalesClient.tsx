"use client";

import { useMemo, useState } from "react";
import type { Company, Plan, VariableField } from "@/types/contract";
import { renderTemplate, flattenFields } from "@/lib/render";

interface Props {
  companies: Company[];
  plans: Plan[];
}

export function SalesClient({ companies, plans }: Props) {
  const [companyId, setCompanyId] = useState<string>(companies[0]?.id ?? "");
  const [planId, setPlanId] = useState<string>("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [issuing, setIssuing] = useState(false);

  const plansForCompany = useMemo(
    () => plans.filter((p) => p.company_id === companyId),
    [plans, companyId]
  );
  const plan = useMemo(() => plans.find((p) => p.id === planId), [plans, planId]);

  // 会社が変わったらプラン選択をリセット。最初の１つを自動選択。
  useMemo(() => {
    if (plansForCompany.length > 0 && !plansForCompany.find((p) => p.id === planId)) {
      setPlanId(plansForCompany[0].id);
      setValues({});
    }
    if (plansForCompany.length === 0) setPlanId("");
  }, [plansForCompany, planId]);

  const previewHtml = useMemo(
    () => (plan ? renderTemplate(plan.template_html, values) : ""),
    [plan, values]
  );

  function setField(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function issuePdf() {
    if (!plan) return;
    const fields = flattenFields(plan.variable_fields as any);
    const missing = fields.filter((f) => f.required && !(values[f.key] ?? "").trim());
    if (missing.length > 0) {
      alert("必須項目が未入力です：\n" + missing.map((f) => "・" + f.label).join("\n"));
      return;
    }
    setIssuing(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: plan.id, values }),
      });
      if (!res.ok) {
        const msg = await res.text();
        alert("PDF生成に失敗しました：" + msg);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${plan.name}_${plan.version}_${values.customer_name || "契約書"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIssuing(false);
    }
  }

  return (
    <div className="app" style={layoutStyle}>
      <div className="panel-form no-print" style={formPanelStyle}>
        <div style={{ fontSize: 12, letterSpacing: ".14em", color: "var(--accent)", fontWeight: 700 }}>
          OPT-IN · 契約書作成ツール
        </div>
        <h1 style={{ fontSize: 18, margin: "6px 0 16px" }}>セールス画面</h1>

        <div style={groupStyle}>
          <div style={groupLabelStyle}>会社／サービスを選ぶ</div>
          <Label text="会社">
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              style={inputStyle}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}（{c.code}）
                </option>
              ))}
            </select>
          </Label>
          <Label text="サービス／プラン">
            <select
              value={planId}
              onChange={(e) => {
                setPlanId(e.target.value);
                setValues({});
              }}
              style={inputStyle}
              disabled={plansForCompany.length === 0}
            >
              {plansForCompany.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}（{p.version}）
                </option>
              ))}
              {plansForCompany.length === 0 && <option>選択肢がありません</option>}
            </select>
          </Label>
        </div>

        <div style={{ background: "var(--accent-soft)", border: "1px solid #cfe0f1", borderRadius: 8, padding: "10px 12px", fontSize: 11.5, color: "#2a4a6b", marginBottom: 20 }}>
          条文・金額・口座・サービス内容・<b>赤字のクーリングオフ条項</b>はすべて<b>固定</b>。入力するのは<b>黄色く光る可変箇所だけ</b>。本文は一文字も触れません。
        </div>

        {plan && (
          <DynamicForm
            fields={plan.variable_fields as any}
            values={values}
            onChange={setField}
          />
        )}

        <div style={{ position: "sticky", bottom: 0, background: "linear-gradient(transparent, #fff 22%)", paddingTop: 20, marginTop: 8 }}>
          <button onClick={issuePdf} disabled={!plan || issuing} style={btnPrimaryStyle}>
            {issuing ? "生成中…" : "PDFを発行する"}
          </button>
          <p style={{ fontSize: 11, color: "var(--ink-soft)", textAlign: "center", marginTop: 8 }}>
            ※発行PDFをダウンロードし、人がクラウドサインへアップロード（フェーズ1）
          </p>
        </div>
      </div>

      <div style={previewPanelStyle}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }} className="no-print">
          <Tag color="green">● リアルタイムプレビュー</Tag>
          <Tag>A4 / 縦</Tag>
          <Tag>黄色＝可変箇所</Tag>
          <Tag color="red">赤字＝原本ママ保持</Tag>
        </div>
        <div className="contract-page" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </div>
    </div>
  );
}

function DynamicForm({
  fields,
  values,
  onChange,
}: {
  fields: any[];
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <>
      {fields.map((item, idx) =>
        "fields" in item ? (
          <div key={"g_" + idx} style={groupStyle}>
            <div style={groupLabelStyle}>{item.group}</div>
            {item.description && (
              <p style={{ fontSize: 11, color: "#9aa1ad", margin: "-2px 0 10px", lineHeight: 1.5 }}>
                {item.description}
              </p>
            )}
            {item.fields.map((f: VariableField) => (
              <FieldInput key={f.key} f={f} value={values[f.key] ?? ""} onChange={onChange} />
            ))}
          </div>
        ) : (
          <FieldInput
            key={item.key}
            f={item as VariableField}
            value={values[item.key] ?? ""}
            onChange={onChange}
          />
        )
      )}
    </>
  );
}

function FieldInput({
  f,
  value,
  onChange,
}: {
  f: VariableField;
  value: string;
  onChange: (key: string, val: string) => void;
}) {
  const labelEl = (
    <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
      {f.label}
      {f.required && <span style={{ color: "#c0392b" }}> *</span>}
      {f.hint && (
        <span style={{ fontWeight: 400, color: "#9aa1ad", fontSize: 11, marginLeft: 6 }}>（{f.hint}）</span>
      )}
    </span>
  );

  if (f.type === "textarea") {
    return (
      <label style={{ display: "block", marginBottom: 11 }}>
        {labelEl}
        <textarea
          value={value}
          onChange={(e) => onChange(f.key, e.target.value)}
          placeholder={f.placeholder}
          style={{ ...inputStyle, minHeight: 54, resize: "vertical" }}
        />
      </label>
    );
  }
  return (
    <label style={{ display: "block", marginBottom: 11 }}>
      {labelEl}
      <input
        type={f.type}
        value={value}
        onChange={(e) => onChange(f.key, e.target.value)}
        placeholder={f.placeholder}
        pattern={f.pattern}
        style={inputStyle}
      />
    </label>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 11 }}>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{text}</span>
      {children}
    </label>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color?: "green" | "red" }) {
  const bg = color === "green" ? "#e3f3e8" : color === "red" ? "#fdeaea" : "#e2e7ef";
  const fg = color === "green" ? "#1f7a42" : color === "red" ? "#c0392b" : "var(--ink-soft)";
  return (
    <span style={{ fontSize: 11, background: bg, color: fg, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
      {children}
    </span>
  );
}

// ===== styles =====
const layoutStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "380px 1fr", minHeight: "100vh" };
const formPanelStyle: React.CSSProperties = {
  background: "#fff",
  borderRight: "1px solid var(--line)",
  padding: "24px 22px 60px",
  overflowY: "auto",
  height: "100vh",
  position: "sticky",
  top: 0,
};
const previewPanelStyle: React.CSSProperties = { padding: "28px 28px 80px", overflowY: "auto", height: "100vh" };
const groupStyle: React.CSSProperties = { marginBottom: 18 };
const groupLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".08em",
  color: "var(--ink-soft)",
  textTransform: "uppercase",
  marginBottom: 8,
  paddingBottom: 5,
  borderBottom: "1px solid var(--line-soft)",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid var(--line)",
  borderRadius: 7,
  fontSize: 13.5,
  fontFamily: "inherit",
  color: "var(--ink)",
  background: "#fff",
};
const btnPrimaryStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
  background: "var(--accent)",
  color: "#fff",
};
