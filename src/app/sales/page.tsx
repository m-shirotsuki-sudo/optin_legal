import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SalesClient } from "./SalesClient";
import type { Company, Plan } from "@/types/contract";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  // 認証未導入のため、サーバー側fetchは service_role を直接使ってRLSを回避。
  // service_role キーはサーバーコンポーネント内でのみ参照され、クライアントには流れない。
  // 認証導入後は createSupabaseServerClient (anon + cookie) に戻し、RLSで保護する。
  const supabase = createSupabaseAdminClient();

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
