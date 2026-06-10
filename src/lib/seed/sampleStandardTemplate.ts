/**
 * KICKOFF §11.6「2社目・2プラン目を追加し、マスタに行を足すだけで増えること」を
 * 検証するためのデモ用テンプレ。
 *
 * このプランは Men's Rise とは別会社・別契約の例として用意。
 * 本文・金額・条数は別物だが、可変項目（顧客名・住所・電話・締結日・担当者）は共通。
 * → 同じセールス画面・同じレンダラ・同じPDFパイプラインで動くことを示す。
 */
export const SAMPLE_STANDARD_TEMPLATE_HTML = `
<div class="notice-box">本書は、特定商取引法に基づき交付される重要書類です。本契約全てのページに記載されている内容を十分にお読みください。</div>

<div class="doc-title">サービス利用契約書</div>

<div class="article">
  <div class="article-head">第１条(契約の目的)</div>
  <p>{{customer_name}}様（以下「甲」という）は、株式会社サンプル（以下「乙」という）が提供する「サンプル スタンダードプラン」（以下「本サービス」という）を利用し、乙はこれを甲に提供することを目的として本契約を締結する。</p>
</div>

<div class="article">
  <div class="article-head">第２条(本業務の内容)</div>
  <p class="ind">１　コース名：スタンダードプラン</p>
  <p class="ind">２　本サービスにはオンラインサポート（月2回／各60分）と教材コンテンツの提供を含む。</p>
</div>

<div class="article">
  <div class="article-head">第３条（本業務の遂行方法と期間）</div>
  <p>本サービスの提供期間は、契約締結日より3ヶ月間とする。</p>
</div>

<div class="article">
  <div class="article-head">第４条(受講料と支払時期)</div>
  <p class="ind">１　甲は、乙に対し、本業務の対価として198,000円（税込）を支払うものとする。</p>
  <p class="ind">２　甲は、乙に対し、本契約締結後3日以内に下記いずれかの方法で支払うものとする。</p>
  <table class="pay-table"><tr>
    <td>信販会社（クレジット会社）を利用する場合の支払方法等</td>
    <td>支払方法<br>　ショッピングクレジット　支払回数（　{{shop_times}}　）回<br>クレジット会社名 ：{{credit_company}}<br>銀行振込　{{bank_amount}}　円<br>初回 (円)　{{first_amount}}　円（税込）<br>翌月（円）　{{next_amount}}　円（税込）</td>
  </tr></table>
</div>

<div class="article">
  <div class="article-head red">第５条　クーリングオフについて</div>
  <p class="ind red">本契約の書面を甲が受領した日から起算して8日を経過するまでは、甲は、書面又は電磁的記録により本申し込みを撤回することができる。</p>
</div>

<div class="article">
  <div class="article-head">第６条（管轄裁判所）</div>
  <p>甲及び乙は、本契約に関して紛争が生じた場合には、乙の本店所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とすることに合意する。</p>
</div>

<p style="margin-top:14px;">以上本契約締結の証として本書２通を作成し、各１通を保有する。</p>

<div class="sign-block">
  <p class="sign-line">締結年月日：{{date:contract_date}}</p>
  <p class="party">【甲】</p>
  <p class="sign-line">住　　所：{{customer_addr}}</p>
  <p class="sign-line name-seal"><span>氏　　名：{{customer_name}}</span><span class="seal">印</span></p>
  <p class="sign-line">電話番号：{{customer_tel}}</p>
  <p class="party">【乙】</p>
  <p class="sign-line">住　　所：東京都千代田区サンプル1-2-3</p>
  <p class="sign-line">法人名　：株式会社サンプル</p>
  <p class="sign-line" style="padding-left:5em;">代表取締役　山田 花子</p>
  <p class="sign-line">電話番号：03-0000-0000</p>
  <p class="sign-line">契約担当者氏名：（　{{staff_name}}　）</p>
</div>
`.trim();

export const SAMPLE_STANDARD_VARIABLE_FIELDS = [
  { key: "customer_name", label: "氏名", type: "text", required: true, placeholder: "山田 太郎" },
  { key: "customer_addr", label: "住所", type: "textarea", required: false, hint: "任意。会社で別途記入する場合は空欄でOK" },
  { key: "customer_tel", label: "電話番号", type: "tel", required: true, pattern: "[0-9-]+" },
  { key: "contract_date", label: "締結年月日", type: "date", required: true },
  { key: "staff_name", label: "契約担当者氏名", type: "text", required: true },
  {
    group: "第4条 支払条件（該当欄のみ入力・併用可）",
    fields: [
      { key: "shop_times", label: "ショッピングクレジット 支払回数（回）", type: "number" },
      { key: "credit_company", label: "クレジット会社名", type: "text" },
      { key: "bank_amount", label: "銀行振込額（円）", type: "text" },
      { key: "first_amount", label: "初回額（円・税込）", type: "text" },
      { key: "next_amount", label: "翌月額（円・税込）", type: "text" },
    ],
  },
] as const;
