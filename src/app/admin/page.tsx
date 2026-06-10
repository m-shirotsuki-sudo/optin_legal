import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Company, Plan } from "@/types/contract";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: companies }, { data: plans }] = await Promise.all([
    supabase.from("companies").select("id, code, name, seller_info, created_at").order("name"),
    supabase
      .from("plans")
      .select("id, company_id, name, version, is_active, original_docx_path, original_checksum, created_at")
      .order("name"),
  ]);

  const list = (companies ?? []) as Company[];
  const planList = (plans ?? []) as Plan[];

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: ".14em", color: "var(--accent)", fontWeight: 700 }}>
            OPT-IN · 契約書作成ツール
          </p>
          <h1 style={{ fontSize: 24, margin: "6px 0 0" }}>管理画面</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/companies/new" style={btnGhost}>+ 会社を追加</Link>
          <Link href="/admin/plans/new" style={btnPrimary}>+ サービスを追加</Link>
          <Link href="/sales" style={btnGhost}>セールス画面 →</Link>
        </div>
      </div>

      <Section title={`会社マスタ（${list.length}件）`}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>コード</th>
              <th style={thStyle}>会社名</th>
              <th style={thStyle}>所在地</th>
              <th style={thStyle}>代表者</th>
              <th style={thStyle}>サービス数</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const count = planList.filter((p) => p.company_id === c.id).length;
              return (
                <tr key={c.id}>
                  <td style={tdStyle}><code>{c.code}</code></td>
                  <td style={tdStyle}>{c.name}</td>
                  <td style={tdStyle}>{c.seller_info?.address}</td>
                  <td style={tdStyle}>{c.seller_info?.representative}</td>
                  <td style={tdStyle}>{count}</td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr><td colSpan={5} style={emptyTdStyle}>会社が登録されていません。「会社を追加」から始めてください。</td></tr>
            )}
          </tbody>
        </table>
      </Section>

      <Section title={`サービス／プランマスタ（${planList.length}件）`}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>サービス</th>
              <th style={thStyle}>会社</th>
              <th style={thStyle}>バージョン</th>
              <th style={thStyle}>状態</th>
              <th style={thStyle}>原本docx</th>
              <th style={thStyle}>原本照合</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {planList.map((p) => {
              const c = list.find((x) => x.id === p.company_id);
              return (
                <tr key={p.id}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{c?.name}</td>
                  <td style={tdStyle}><code>{p.version}</code></td>
                  <td style={tdStyle}>
                    <span style={{ ...badgeStyle, background: p.is_active ? "#e3f3e8" : "#eee", color: p.is_active ? "#1f7a42" : "#666" }}>
                      {p.is_active ? "稼働中" : "停止中"}
                    </span>
                  </td>
                  <td style={tdStyle}>{p.original_docx_path ? "✓" : "未登録"}</td>
                  <td style={tdStyle}>
                    {p.original_checksum
                      ? <span style={{ color: "#1f7a42" }}>✓ {p.original_checksum.keyphrases?.length ?? 0}項目で一致</span>
                      : <span style={{ color: "#c0392b" }}>未照合</span>}
                  </td>
                  <td style={tdStyle}>
                    <Link href={`/admin/plans/${p.id}`} style={linkStyle}>編集 →</Link>
                  </td>
                </tr>
              );
            })}
            {planList.length === 0 && (
              <tr><td colSpan={7} style={emptyTdStyle}>サービスが登録されていません。</td></tr>
            )}
          </tbody>
        </table>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: ".06em", color: "var(--ink-soft)", textTransform: "uppercase", margin: "0 0 8px" }}>{title}</h2>
      <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>{children}</div>
    </section>
  );
}

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "10px 14px", borderBottom: "1px solid var(--line)", background: "var(--line-soft)", fontSize: 12, color: "var(--ink-soft)" };
const tdStyle: React.CSSProperties = { padding: "10px 14px", borderBottom: "1px solid var(--line-soft)" };
const emptyTdStyle: React.CSSProperties = { padding: 20, textAlign: "center", color: "var(--ink-soft)" };
const badgeStyle: React.CSSProperties = { fontSize: 11, padding: "2px 8px", borderRadius: 12, fontWeight: 600 };
const linkStyle: React.CSSProperties = { color: "var(--accent)", textDecoration: "none", fontWeight: 600 };
const btnPrimary: React.CSSProperties = { padding: "8px 14px", background: "var(--accent)", color: "#fff", borderRadius: 7, textDecoration: "none", fontSize: 13, fontWeight: 600 };
const btnGhost: React.CSSProperties = { padding: "8px 14px", background: "#fff", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 7, textDecoration: "none", fontSize: 13, fontWeight: 600 };
