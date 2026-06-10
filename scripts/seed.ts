/**
 * 初期データ投入スクリプト。
 *   pnpm tsx scripts/seed.ts
 *
 * 必要なenv:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * 投入内容:
 *   1) 株式会社Men'sRise + VIPプラン(20260519)
 *   2) 株式会社サンプル + スタンダードプラン(20260101) ← 2社目検証用
 */
import { createClient } from "@supabase/supabase-js";
import {
  MENSRISE_VIP_TEMPLATE_HTML,
  MENSRISE_VIP_VARIABLE_FIELDS,
} from "../src/lib/seed/mensriseVipTemplate";
import {
  SAMPLE_STANDARD_TEMPLATE_HTML,
  SAMPLE_STANDARD_VARIABLE_FIELDS,
} from "../src/lib/seed/sampleStandardTemplate";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。");
    process.exit(1);
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ---- 1) Men's Rise / VIP ----
  const { data: company1, error: e1 } = await supabase
    .from("companies")
    .upsert(
      {
        code: "ME01",
        name: "株式会社Men'sRise",
        seller_info: {
          address: "大阪府大阪市中央区南久宝寺町四丁目４−７エムバランス御堂筋本町9 F",
          corp_name: "株式会社Men'sRise",
          representative: "高野亮太",
          tel: "090-8829-7138",
        },
      },
      { onConflict: "code" }
    )
    .select()
    .single();
  if (e1) throw e1;
  console.log("[seed] companies:", company1!.name);

  const { error: e2 } = await supabase.from("plans").upsert(
    {
      company_id: company1!.id,
      name: "VIPプラン",
      version: "20260519",
      is_active: true,
      template_html: MENSRISE_VIP_TEMPLATE_HTML,
      variable_fields: MENSRISE_VIP_VARIABLE_FIELDS,
      constants: {
        total_amount: "660,000",
        monthly_amount: "110,000",
        bank: "三井住友銀行 トランクNORTH支店(403) 普通 ０５７８９９２",
      },
      original_docx_path: "samples/MensRise_20260519.docx",
    },
    { onConflict: "company_id,name,version" }
  );
  if (e2) throw e2;
  console.log("[seed] plans: Men's Rise VIPプラン 20260519 投入完了");

  // ---- 2) 株式会社サンプル / スタンダード ----
  const { data: company2, error: e3 } = await supabase
    .from("companies")
    .upsert(
      {
        code: "SMP01",
        name: "株式会社サンプル",
        seller_info: {
          address: "東京都千代田区サンプル1-2-3",
          corp_name: "株式会社サンプル",
          representative: "山田 花子",
          tel: "03-0000-0000",
        },
      },
      { onConflict: "code" }
    )
    .select()
    .single();
  if (e3) throw e3;
  console.log("[seed] companies:", company2!.name);

  const { error: e4 } = await supabase.from("plans").upsert(
    {
      company_id: company2!.id,
      name: "スタンダードプラン",
      version: "20260101",
      is_active: true,
      template_html: SAMPLE_STANDARD_TEMPLATE_HTML,
      variable_fields: SAMPLE_STANDARD_VARIABLE_FIELDS,
      constants: { total_amount: "198,000" },
    },
    { onConflict: "company_id,name,version" }
  );
  if (e4) throw e4;
  console.log("[seed] plans: サンプル スタンダードプラン 20260101 投入完了");

  console.log("\n✅ シード完了。/sales 画面で会社／プランを切り替えて動作確認してください。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
