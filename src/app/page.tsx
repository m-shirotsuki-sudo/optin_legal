import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "60px 24px", maxWidth: 760, margin: "0 auto" }}>
      <p style={{ fontSize: 12, letterSpacing: ".14em", color: "var(--accent)", fontWeight: 700 }}>
        OPT-IN · 契約書作成ツール
      </p>
      <h1 style={{ fontSize: 26, margin: "6px 0 8px" }}>OPT-IN 契約書作成ツール</h1>
      <p style={{ color: "var(--ink-soft)" }}>
        セールスは可変箇所だけを入力し、本文が固定された契約書PDFを発行できます。本文・金額・口座・条文はすべて管理者が事前に整備したテンプレを使います。
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 28 }}>
        <Link
          href="/sales"
          style={{
            display: "block",
            padding: 20,
            background: "var(--accent)",
            color: "#fff",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16 }}>セールス画面へ</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            会社→サービス選択 → 可変項目入力 → PDF発行
          </div>
        </Link>
        <Link
          href="/admin"
          style={{
            display: "block",
            padding: 20,
            background: "#fff",
            border: "1px solid var(--line)",
            color: "var(--ink)",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16 }}>管理画面へ</div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
            会社・サービス・原本docx・テンプレ・原本照合
          </div>
        </Link>
      </div>
    </main>
  );
}
