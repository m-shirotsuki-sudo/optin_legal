import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OPT-IN · 契約書作成ツール",
  description: "可変箇所だけを入力すれば、本文が固定された契約書PDFが発行できます。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
