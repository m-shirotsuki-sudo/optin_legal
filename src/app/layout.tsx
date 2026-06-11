import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OPT-IN · 契約書作成ツール",
  description: "可変箇所だけを入力すれば、本文が固定された契約書PDFが発行できます。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* PDF生成時と同じフォントをプレビューでも使うため、Noto Serif JP を読み込む */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
