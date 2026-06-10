import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SalesClient } from "./SalesClient";
import type { Company, Plan } from "@/types/contract";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const supabase = createSupabaseServerClient();

  const { data: companies, error: ce } = await supabase
    .from("companies")
    .select("id, code, name, seller_info, created_at")
    .order("name");

  const { data: plans, error: pe } = await supabase
    .from("plans")
    .select(
      "id, company_id, name, version, is_active, template_html, constants, variable_fields, original_docx_path, original_checksum, created_at"
    )
    .eq("is_active", true)
    .order("name");

  if (ce || pe) {
    return (
      <div style={{ padding: 40 }}>
        <h1>データ取得エラー</h1>
        <p style={{ color: "#c0392b" }}>{(ce ?? pe)?.message}</p>
        <p style={{ color: "var(--ink-soft)" }}>
          Supabaseの接続情報（.env.local）と、マイグレーション／シードの適用状況を確認してください。
        </p>
      </div>
    );
  }

  return (
    <SalesClient
      companies={(companies ?? []) as Company[]}
      plans={(plans ?? []) as Plan[]}
    />
  );
}
