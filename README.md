# OPT-IN 契約書作成ツール

セールス担当が「会社」と「サービス（プラン）」を選び、案件ごとの可変項目だけを入力すると、本文が固定された契約書PDFが発行されるWebツール。

詳細仕様は [`docs/KICKOFF.md`](docs/KICKOFF.md) を参照。動作デモは [`samples/contractdemo.html`](samples/contractdemo.html)（ブラウザで直接開ける）。

## 技術スタック

- Next.js 14（App Router）
- Supabase（Postgres + Auth + Storage）
- Puppeteer + @sparticuz/chromium（PDF生成）
- TypeScript / Tailwind

## ディレクトリ

```
src/
├── app/
│   ├── sales/               セールス画面（会社→サービス→入力→プレビュー→PDF）
│   ├── admin/               管理画面（会社・サービスCRUD、原本照合）
│   └── api/                 PDF生成・admin操作
├── lib/
│   ├── render.ts            {{key}} 置換 → <span class="var"> ラップ
│   ├── docxExtract.ts       docx の word/document.xml 直読み（テキストボックスも拾う）
│   ├── checksum.ts          原本キーフレーズ抽出と差分検出
│   ├── pdf.ts               Puppeteer ラッパー
│   └── seed/                Men's Rise VIP + 2社目検証テンプレ
├── types/contract.ts
supabase/
└── migrations/0001_init.sql 初期スキーマ + RLS
scripts/
├── seed.ts                  会社・サービスを初期投入
└── verifyOriginal.ts        原本docx ⇆ テンプレ本文の整合チェック
samples/                     contractdemo.html, MensRise_20260519.docx
docs/KICKOFF.md
```

## セットアップ

```bash
# 1. 依存をインストール
pnpm install      # または npm install / yarn

# 2. .env.local を作成
cp .env.local.example .env.local
# NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY を埋める

# 3. Supabase にスキーマを適用（Supabase CLI 利用想定）
supabase db push
# もしくは Supabase Studio の SQL Editor で supabase/migrations/0001_init.sql を実行

# 4. シード投入（Men's Rise VIP + 2社目検証用）
pnpm tsx scripts/seed.ts

# 5. 原本docx との整合確認（任意・テンプレ刷新時の必須ゲート）
pnpm verify:original

# 6. 開発サーバー
pnpm dev
```

## 画面

- `/` — ランディング
- `/sales` — セールス画面（会社／サービス選択 → 可変入力 → リアルタイムプレビュー → PDF発行）
- `/admin` — 管理画面（会社一覧・サービス一覧）
- `/admin/companies/new` — 会社追加
- `/admin/plans/new` — サービス追加（本文テンプレ + 原本docxアップロード + 照合）
- `/admin/plans/[id]` — サービス編集

## 原本照合の仕組み（重要）

KICKOFF §7 の刷新事故防止ロジック。管理画面の「原本docx」をアップロードすると：

1. サーバーで `word/document.xml` を直接読み、`<w:t>` を連結（`<w:txbxContent>` 内の図形テキストも拾う）
2. 句点単位で 10文字以上のフレーズに分解 → キーフレーズ集合
3. 本文テンプレからHTMLタグと `{{...}}` を除いた素テキストに、各キーフレーズが含まれるか照合
4. 欠落があれば一覧表示。0件なら `original_checksum` に保存して保存ボタンを解放

**コマンドラインからも実行可能：**

```bash
pnpm verify:original
# → 原本キーフレーズ数: 128 / 欠落フレーズ数: 0 ✅
```

## デプロイ（Vercel）

- 環境変数：`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- PDF生成は `@sparticuz/chromium` を自動利用（Serverless Function 上で動作）
- `/api/pdf` の `maxDuration` を 60s に設定済み

## フェーズ計画（KICKOFF §10, §11）

- **フェーズ1（今回）**：PDFをDL → 人がクラウドサインにアップ
- **フェーズ2（後付け）**：クラウドサインAPI 連携。`contracts` テーブルに送信ステータスを持たせる
