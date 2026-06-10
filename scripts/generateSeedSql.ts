/**
 * シードTSから直接 INSERT SQL を生成する。
 * 環境のネットワーク allowlist で Supabase に到達できないときの代替手段。
 *
 *   npx tsx scripts/generateSeedSql.ts > supabase/seed.sql
 *
 * 生成された SQL を Supabase SQL Editor に貼り付けて Run すれば、
 * scripts/seed.ts と同じ結果になる。
 */
import {
  MENSRISE_VIP_TEMPLATE_HTML,
  MENSRISE_VIP_VARIABLE_FIELDS,
} from "../src/lib/seed/mensriseVipTemplate";
import {
  SAMPLE_STANDARD_TEMPLATE_HTML,
  SAMPLE_STANDARD_VARIABLE_FIELDS,
} from "../src/lib/seed/sampleStandardTemplate";

function dollarQuote(s: string): string {
  // 巨大文字列でも安全な PostgreSQL のドル引用符。$tpl$ がぶつからない限り無加工で埋め込める。
  if (s.includes("$tpl$")) throw new Error("template literal contains delimiter; pick another tag");
  return `$tpl$${s}$tpl$`;
}

function jsonQuote(v: unknown): string {
  const json = JSON.stringify(v);
  if (json.includes("$json$")) throw new Error("json literal contains delimiter; pick another tag");
  return `$json$${json}$json$::jsonb`;
}

const sql = `
-- ============================================================
-- 自動生成シード (DO NOT EDIT BY HAND)
-- 生成元: scripts/generateSeedSql.ts (src/lib/seed/*.ts より)
-- 適用方法: Supabase SQL Editor に全部貼り付けて Run
-- ============================================================

-- ---- 1) 株式会社Men'sRise + VIPプラン ----
insert into public.companies (code, name, seller_info) values (
  'ME01',
  '株式会社Men''sRise',
  ${jsonQuote({
    address: "大阪府大阪市中央区南久宝寺町四丁目４−７エムバランス御堂筋本町9 F",
    corp_name: "株式会社Men'sRise",
    representative: "高野亮太",
    tel: "090-8829-7138",
  })}
)
on conflict (code) do update set name = excluded.name, seller_info = excluded.seller_info;

insert into public.plans (company_id, name, version, is_active, template_html, variable_fields, constants, original_docx_path)
select
  (select id from public.companies where code = 'ME01'),
  'VIPプラン',
  '20260519',
  true,
  ${dollarQuote(MENSRISE_VIP_TEMPLATE_HTML)},
  ${jsonQuote(MENSRISE_VIP_VARIABLE_FIELDS)},
  ${jsonQuote({
    total_amount: "660,000",
    monthly_amount: "110,000",
    bank: "三井住友銀行 トランクNORTH支店(403) 普通 ０５７８９９２",
  })},
  'samples/MensRise_20260519.docx'
on conflict (company_id, name, version) do update set
  template_html = excluded.template_html,
  variable_fields = excluded.variable_fields,
  constants = excluded.constants,
  is_active = excluded.is_active;

-- ---- 2) 株式会社サンプル + スタンダードプラン ----
insert into public.companies (code, name, seller_info) values (
  'SMP01',
  '株式会社サンプル',
  ${jsonQuote({
    address: "東京都千代田区サンプル1-2-3",
    corp_name: "株式会社サンプル",
    representative: "山田 花子",
    tel: "03-0000-0000",
  })}
)
on conflict (code) do update set name = excluded.name, seller_info = excluded.seller_info;

insert into public.plans (company_id, name, version, is_active, template_html, variable_fields, constants)
select
  (select id from public.companies where code = 'SMP01'),
  'スタンダードプラン',
  '20260101',
  true,
  ${dollarQuote(SAMPLE_STANDARD_TEMPLATE_HTML)},
  ${jsonQuote(SAMPLE_STANDARD_VARIABLE_FIELDS)},
  ${jsonQuote({ total_amount: "198,000" })}
on conflict (company_id, name, version) do update set
  template_html = excluded.template_html,
  variable_fields = excluded.variable_fields,
  constants = excluded.constants,
  is_active = excluded.is_active;
`;

console.log(sql.trim());
