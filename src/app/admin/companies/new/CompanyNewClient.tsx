"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function CompanyNewClient() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    address: "",
    corp_name: "",
    representative: "",
    tel: "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    if (!form.code || !form.name) {
      alert("コード／会社名は必須です。");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          seller_info: {
            address: form.address,
            corp_name: form.corp_name || form.name,
            representative: form.representative,
            tel: form.tel,
          },
        }),
      });
      if (!res.ok) {
        alert("作成に失敗しました：" + (await res.text()));
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" }}>
      <Link href="/admin" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13 }}>← 管理画面に戻る</Link>
      <h1 style={{ fontSize: 22, margin: "8px 0 20px" }}>会社を追加</h1>

      <Field label="コード（一意・例 ME01, GH02）">
        <input style={input} value={form.code} onChange={(e) => set("code", e.target.value)} />
      </Field>
      <Field label="会社名（表示名）">
        <input style={input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="株式会社○○" />
      </Field>
      <Field label="法人名（契約書に記載する正式名称）">
        <input style={input} value={form.corp_name} onChange={(e) => set("corp_name", e.target.value)} placeholder="未入力なら会社名と同じ" />
      </Field>
      <Field label="所在地">
        <input style={input} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="大阪府大阪市中央区..." />
      </Field>
      <Field label="代表者">
        <input style={input} value={form.representative} onChange={(e) => set("representative", e.target.value)} placeholder="高野亮太" />
      </Field>
      <Field label="代表電話">
        <input style={input} value={form.tel} onChange={(e) => set("tel", e.target.value)} placeholder="090-1234-5678" />
      </Field>

      <button onClick={submit} disabled={busy} style={btn}>
        {busy ? "作成中…" : "作成する"}
      </button>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{label}</span>
      {children}
    </label>
  );
}

const input: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 7, fontSize: 13.5, fontFamily: "inherit", background: "#fff" };
const btn: React.CSSProperties = { padding: "10px 18px", background: "var(--accent)", color: "#fff", borderRadius: 7, border: "none", fontWeight: 700, cursor: "pointer", fontSize: 14 };
