-- ============================================================
-- 自動生成シード (DO NOT EDIT BY HAND)
-- 生成元: scripts/generateSeedSql.ts (src/lib/seed/*.ts より)
-- 適用方法: Supabase SQL Editor に全部貼り付けて Run
-- ============================================================

-- ---- 1) 株式会社Men'sRise + VIPプラン ----
insert into public.companies (code, name, seller_info) values (
  'ME01',
  '株式会社Men''sRise',
  $json${"address":"大阪府大阪市中央区南久宝寺町四丁目４−７エムバランス御堂筋本町9 F","corp_name":"株式会社Men'sRise","representative":"高野亮太","tel":"090-8829-7138"}$json$::jsonb
)
on conflict (code) do update set name = excluded.name, seller_info = excluded.seller_info;

insert into public.plans (company_id, name, version, is_active, template_html, variable_fields, constants, original_docx_path)
select
  (select id from public.companies where code = 'ME01'),
  'VIPプラン',
  '20260519',
  true,
  $tpl$<div class="notice-box">本書は、特定商取引法に基づき交付される、お客様（甲）と株式会社Men'sRise（乙）の契約条件を定める重要な書類となりますので、本契約全てのページに記載されている内容を十分にお読みください。</div>

<div class="doc-title">オンラインコミュニティ利用契約書</div>

<div class="article">
  <div class="article-head">第１条(契約の目的)</div>
  <p>{{customer_name}}様（以下、「甲」という）は、株式会社Men'sRise（以下、「乙」という）が提供する、男性の外見・生活習慣・マインドセット等の向上を目的としたオンラインコミュニティサービス「Men's Rise（メンズライズ）」（以下「本サービス」という）に参加し、乙は甲に対し、本サービスに関する各種支援、情報提供および環境の提供を行うことを目的として、本契約を締結する。</p>
</div>

<div class="article">
  <div class="article-head">第２条(本業務の内容)</div>
  <p class="ind">１　コース名：Men's Rise（VIPプラン）</p>
  <p class="ind">２　本業務には以下のサービス（以下「本サービス」という。）が含まれる。</p>
  <p style="font-size:9pt;color:#555;margin-top:4px;">＜本サービスの詳細＞</p>
  <table class="svc-table">
    <tr><th>(1) 専門講師によるオンラインカウンセリング</th><td>本サービス提供開始から6ヶ月間は、乙または乙が指定する講師によるオンライン形式のカウンセリングを月に1回30分受けることができる。</td></tr>
    <tr><th>(2) 講師陣によるチャットサポート</th><td>甲は、乙が指定するコミュニケーションツールを通じて、本サービスに関連する範囲内で質問・相談を行うことができる。ただし、対応時間、回答内容および即時性については保証されないものとする。</td></tr>
    <tr><th>(3) 講義・情報コンテンツの提供</th><td>外見改善、生活習慣、マインド形成等に関するオンライン講義を週1回。振り返り講義を週１回。最新情報の提供を動画、テキストその他、乙の裁量により提供する。</td></tr>
    <tr><th>(4) 動画コンテンツ</th><td>乙が作成した「男磨きルーティン」を解説したコンテンツ（動画+各種テンプレート）の権限の付与</td></tr>
    <tr><th>(5) 月1回のオフ会</th><td>甲は乙の開催する月１回オフ会の参加に参加する権限の付与。</td></tr>
    <tr><th>(6) 商品およびサービスに関する情報提供</th><td>乙は、甲に対し、乙または第三者が提供する商品・サービスに関する情報を提供することがあるが、当該商品の購入は甲の任意とし、購入を強制するものではない。</td></tr>
    <tr><th>(7) 福利厚生および優待情報の提供</th><td>乙は、甲に対し、日用品等の割引購入や提携店舗での優待等の情報を提供する場合がある。ただし、地域・数量・期間等に制限があることを甲はあらかじめ了承する。</td></tr>
  </table>
  <p class="ind">３　受講者は自己負担、自己責任において、当社サービスの利用に関して必要な通信機器、通信回線を本コース受講前に準備することとする。推奨する使用環境は以下である。</p>
  <div class="env-block">
    インターネット接続：10Mbps以上<br>
    使用ソフト：ZOOM<br>
    サポートOS<br>
    　Mac：10.7以降搭載のMac OS X<br>
    　Windows：7〜10<br>
    ブラウザ<br>
    　Mac：Safari5~、Firefox、Chrome<br>
    　Windows：IE7~、Safari5~、Firefox、Chrome
  </div>
</div>

<div class="article">
  <div class="article-head">第３条（本業務の遂行方法と期間）</div>
  <p>本サービスの提供期間は、提供期間は契約締結日より6ヶ月間とする。</p>
</div>

<div class="article">
  <div class="article-head">第４条(受講料と支払時期)</div>
  <p class="ind">１　甲は、乙に対し、本業務の対価として660,000円（税込価格660,000円）を支払うものとする。本業務1か月あたりの受講料は100,000円（税込価格110,000円）とする。</p>
  <p class="ind">２　甲は、乙に対し、本契約締結後3日後以内に以下いずれかの方法で入会金を支払うものとする。</p>
  <p class="ind">３　銀行口座振り込みの場合：以下の銀行口座に振り込んで支払うものとする。但し、振込手数料は甲の負担とする。</p>
  <div class="env-block">銀行名　：三井住友銀行<br>支店名　：トランクNORTH支店(403)<br>口座番号：普通　０５７８９９２<br>名　義　：株式会社Men'sRise</div>
  <table class="pay-table"><tr>
    <td>信販会社（クレジット会社）を利用する場合の支払方法等</td>
    <td>支払方法<br>　デビットカード　　　支払回数（　{{debit_times}}　）回<br>　ショッピングクレジット　支払回数（　{{shop_times}}　）回<br>支払時期<br>　クレジット会社名 ：{{credit_company}}　2026年　{{debit_date}}　引落<br>支払額<br>　銀行振込　{{bank_amount}}　円<br>　初回 (円)　{{first_amount}}　円（税込）<br>　翌月（円）　{{next_amount}}　円（税込）<br>・割賦販売法に基づく抗弁権の接続が適用されます。詳しくは各クレジット会社の契約書をご覧下さい。<br>・前受金保全措置は、行っていません。</td>
  </tr></table>
</div>

<div class="article">
  <div class="article-head">第５条(知的財産の帰属)</div>
  <p>乙が本業務の遂行にあたり作成して甲に提供する書面、データ等（以下「成果物」という。）の著作権、その他の知的財産権は、すべて乙に属するものとする。</p>
</div>

<div class="article">
  <div class="article-head">第６条（禁止事項）</div>
  <p class="ind">１　甲は、乙が提供するノウハウ(類似するものも含む。)を乙の許可なく第三者に提供又は開示してはならない(コンサルティング、売買その他形式を問わない。有償無償を問わない。)。</p>
  <p class="ind">２　甲は、乙の他の顧客に対し、乙が行う事業と同種の事業への勧誘など乙及び乙の顧客が迷惑を被る行為をしてはならない。</p>
  <p class="ind">３　前２項に反する行為が発覚した場合、甲は乙に対し損害賠償金として実損害額又は金30万円のうち高い金額を支払うものとする。</p>
</div>

<div class="article">
  <div class="article-head">第７条(秘密保持)</div>
  <p class="ind">１　甲は、乙が提供するノウハウ等を乙の承諾なく第三者に口外しないことを誓約する。</p>
  <p class="ind">２　甲は、乙が提供するノウハウ等を乙の承諾なくSNS、ブログなどインターネット上に公開しないことを誓約する。</p>
  <p class="ind">３　前２項に反する行為が発覚した場合、甲は乙に対し損害賠償金として実損害額又は金30万円のうち高い金額を支払うものとする。</p>
</div>

<div class="article">
  <div class="article-head">第８条(損害賠償)</div>
  <p>甲又は乙が、本契約に違反して相手方に損害を与えたときは、相手方に対しすみやかにその損害を賠償しなければならない。</p>
</div>

<div class="article">
  <div class="article-head red">第9条　クーリングオフについて</div>
  <p class="red">本規定は、クーリングオフ（一定期間内の解除）に関する規定です。重要な規定ですので、本規定の内容を十分に読んでください。</p>
  <p class="ind red">１　本契約の書面を甲が受領した日から起算して8日を経過するまでは、甲は、書面又は電磁的記録により本申し込みを撤回することができる。</p>
  <p class="ind red">２　前項にかかわらず、乙が不実のことを告げる行為をしたことにより甲が誤認をし、又は乙が威迫したことにより甲が困惑し、これらによって甲が本申し込みの撤回を行わなかった場合には、本申し込みに関して、クーリングオフの権利その他所定の事項を記載した書面を甲が乙から改めて受領し、その内容について説明を受けた日から起算して8日を経過するまでは、甲は、書面又は電磁的記録により申し込みを撤回することができる。</p>
  <p class="ind red">３　第1項及び第2項の申し込みの撤回は、甲が、本申し込みの撤回に係る書面又は電磁的記録を発した時に、その効力を生じる。</p>
  <p class="ind red">４　第1項及び第2項の申し込みの撤回があった場合においては、乙は、甲に対し、その申し込みの撤回に伴う損害賠償又は違約金の支払を請求することができない。</p>
  <p class="ind red">５　第1項及び第2項の申し込みの撤回があった場合には、既に本契約に基づき役務が提供されたときにおいても、乙は、甲に対し、本契約に係る役務の対価その他の金銭の支払を請求することができない。</p>
  <p class="ind red">６　第1項及び第2項の申し込みの撤回があった場合において、本契約に関連して金銭を受領しているときは、乙は、甲に対し、速やかに、その全額を返還する。また、振込手数料は乙の負担とする。</p>
</div>

<div class="article">
  <div class="article-head">第１０条(中途解約)</div>
  <p class="ind">１　甲は、乙に対し、クーリングオフ期間経過後においても、書面又は電磁的記録で通知することにより、本契約を中途解約することができる。</p>
  <p class="ind">２　前項に基づく中途解約の通知が行われた場合、本契約は、当該通知が到達した日が属する月の末日で終了するものとする。</p>
  <p class="ind">３　前項によって本契約が中途解約された場合、乙は、甲に対し、支払済みの受講料から、本契約の残期間分の受講料相当額から以下の費用を差し引いた残額を返金する。</p>
  <p class="ind2">⑴　本業務提供前の場合：契約締結及び登録料として15,000円</p>
  <p class="ind2">⑵　本業務提供後の場合：5万円又は契約残額の20％に相当する額のいずれか低い額</p>
  <p class="ind">４　甲が、乙に対し、本契約に基づく対価の支払いを行わなかった場合、下記各号のとおり、本契約は中途解約されたものとみなす。この場合においても前項の規定は準用されるものとする。</p>
  <p class="ind2">⑴　対価が一括で支払われることが予定されていた場合：乙の甲に対する支払催告が甲に到達してから３０日が経過した日に本契約が中途解約されたものとみなす。</p>
  <p class="ind2">⑵　対価が分割で支払われることが予定されていた場合：連続して２回以上支払いが行われなかった場合、２回目の支払期日が経過した日に本契約が中途解約されたものとみなす。</p>
</div>

<div class="article">
  <div class="article-head">第１１条（成果非保証）</div>
  <p>甲は、本サービスが自己成長および生活改善を支援するものであり、外見の変化、人間関係の向上、恋愛成就、社会的成功その他いかなる成果についても保証されるものではないことを確認し、これに同意する。</p>
</div>

<div class="article">
  <div class="article-head">第１２条（管轄裁判所）</div>
  <p>甲及び乙は、本契約に関して紛争が生じた場合には、乙の本店所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とすることに合意する。</p>
</div>

<div class="article">
  <div class="article-head">第１３条（免責）</div>
  <p>甲は、本サービスに基づく助言、情報、提案の採否およびそれに基づく行動については、すべて自己の判断と責任において行うものとし、その結果について乙は一切の責任を負わないものとする。</p>
</div>

<p style="margin-top:14px;">以上本契約締結の証として本書２通を作成し、記入押印の上、各１通を保有する。</p>

<div class="sign-block">
  <p class="sign-line">締結年月日：{{date:contract_date}}</p>
  <p class="party">【甲】</p>
  <p class="sign-line">住　　所：{{customer_addr}}</p>
  <p class="sign-line name-seal"><span>氏　　名：{{customer_name}}</span><span class="seal">印</span></p>
  <p class="sign-line">電話番号：{{customer_tel}}</p>
  <p class="party">【乙】</p>
  <p class="sign-line">住　　所：大阪府大阪市中央区南久宝寺町四丁目４−７エムバランス御堂筋本町9 F</p>
  <p class="sign-line">法人名　：株式会社Men'sRise</p>
  <p class="sign-line" style="padding-left:5em;">代表取締役　高野亮太</p>
  <p class="sign-line">電話番号：090-8829-7138</p>
  <p class="sign-line">契約担当者氏名：（　{{staff_name}}　）</p>
</div>$tpl$,
  $json$[{"key":"customer_name","label":"氏名","type":"text","required":true,"placeholder":"山田 太郎"},{"key":"customer_addr","label":"住所","type":"textarea","required":false,"placeholder":"東京都〇〇区〇〇 1-2-3","hint":"任意。会社で別途記入する場合は空欄でOK"},{"key":"customer_tel","label":"電話番号","type":"tel","required":true,"hint":"数字とハイフン","placeholder":"090-1234-5678","pattern":"[0-9-]+"},{"key":"contract_date","label":"締結年月日","type":"date","required":true},{"key":"staff_name","label":"契約担当者氏名","type":"text","required":true,"hint":"セールス担当","placeholder":"鈴木 一郎"},{"group":"第4条 支払条件（該当欄のみ入力・併用可・空欄は空欄のまま出力）","description":"銀行振込のみ／分割のみ／両方併用、いずれもOK。使う欄だけ埋めてください。","fields":[{"key":"debit_times","label":"デビットカード 支払回数（回）","type":"number","placeholder":"例：1"},{"key":"shop_times","label":"ショッピングクレジット 支払回数（回）","type":"number","placeholder":"例：12"},{"key":"credit_company","label":"クレジット会社名","type":"text","hint":"Mosh / CBS / Lifety 等・手入力","placeholder":"例：CBS"},{"key":"debit_date","label":"引落 年月日","type":"text","hint":"2026年〇月〇日","placeholder":"例：6月10日"},{"key":"bank_amount","label":"銀行振込額（円）","type":"text","placeholder":"例：660,000"},{"key":"first_amount","label":"初回額（円・税込）","type":"text","placeholder":"例：110,000"},{"key":"next_amount","label":"翌月額（円・税込）","type":"text","placeholder":"例：110,000"}]}]$json$::jsonb,
  $json${"total_amount":"660,000","monthly_amount":"110,000","bank":"三井住友銀行 トランクNORTH支店(403) 普通 ０５７８９９２"}$json$::jsonb,
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
  $json${"address":"東京都千代田区サンプル1-2-3","corp_name":"株式会社サンプル","representative":"山田 花子","tel":"03-0000-0000"}$json$::jsonb
)
on conflict (code) do update set name = excluded.name, seller_info = excluded.seller_info;

insert into public.plans (company_id, name, version, is_active, template_html, variable_fields, constants)
select
  (select id from public.companies where code = 'SMP01'),
  'スタンダードプラン',
  '20260101',
  true,
  $tpl$<div class="notice-box">本書は、特定商取引法に基づき交付される重要書類です。本契約全てのページに記載されている内容を十分にお読みください。</div>

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
</div>$tpl$,
  $json$[{"key":"customer_name","label":"氏名","type":"text","required":true,"placeholder":"山田 太郎"},{"key":"customer_addr","label":"住所","type":"textarea","required":false,"hint":"任意。会社で別途記入する場合は空欄でOK"},{"key":"customer_tel","label":"電話番号","type":"tel","required":true,"pattern":"[0-9-]+"},{"key":"contract_date","label":"締結年月日","type":"date","required":true},{"key":"staff_name","label":"契約担当者氏名","type":"text","required":true},{"group":"第4条 支払条件（該当欄のみ入力・併用可）","fields":[{"key":"shop_times","label":"ショッピングクレジット 支払回数（回）","type":"number"},{"key":"credit_company","label":"クレジット会社名","type":"text"},{"key":"bank_amount","label":"銀行振込額（円）","type":"text"},{"key":"first_amount","label":"初回額（円・税込）","type":"text"},{"key":"next_amount","label":"翌月額（円・税込）","type":"text"}]}]$json$::jsonb,
  $json${"total_amount":"198,000"}$json$::jsonb
on conflict (company_id, name, version) do update set
  template_html = excluded.template_html,
  variable_fields = excluded.variable_fields,
  constants = excluded.constants,
  is_active = excluded.is_active;
