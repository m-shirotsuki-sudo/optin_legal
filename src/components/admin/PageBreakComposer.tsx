"use client";

import React, { useEffect, useState } from "react";

interface Props {
  /** 保存形式の本文HTML */
  value: string;
  /** 改ページの挿入／削除を反映した本文HTMLを返す */
  onChange: (next: string) => void;
}

interface Block {
  html: string;
  isPageBreak: boolean;
}

/**
 * 本文HTMLを「トップレベル要素のリスト」に分解して描画し、
 * 各要素の間に「＋ ここで改ページ」をクリックできるホットゾーンを置く。
 * 既存の <div class="page-break"></div> は「× 改ページを解除」のバッジとして表示し、
 * クリック1つで取り消せる。
 *
 * ※ HTML編集も WYSIWYG も触らない。`{{key}}` や class 等は完全にそのまま保持される。
 *    DOMParser で構文木にしてから outerHTML で素直に再結合するだけ。
 */
export function PageBreakComposer({ value, onChange }: Props) {
  // SSR時にはDOMParserが使えないので、マウント後にだけパースする
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBlocks(parseBlocks(value));
  }, [value]);

  function updateBlocks(next: Block[]) {
    setBlocks(next);
    onChange(next.map((b) => b.html).join("\n"));
  }

  function insertBreakAt(idx: number) {
    const next = [...blocks];
    next.splice(idx, 0, {
      html: '<div class="page-break"></div>',
      isPageBreak: true,
    });
    updateBlocks(next);
  }

  function removeBreak(idx: number) {
    updateBlocks(blocks.filter((_, i) => i !== idx));
  }

  if (!mounted) {
    return (
      <div style={{ padding: 30, textAlign: "center", color: "#9aa1ad", fontSize: 12 }}>
        プレビューを準備中…
      </div>
    );
  }
  if (blocks.length === 0) {
    return (
      <div style={{ padding: 30, textAlign: "center", color: "#9aa1ad", fontSize: 12 }}>
        本文HTMLが空です。docx取込か、HTML直接編集で本文を入れてください。
      </div>
    );
  }

  return (
    <div className="contract-page" style={composerPageStyle}>
      <Inserter onClick={() => insertBreakAt(0)} />
      {blocks.map((b, idx) => (
        <React.Fragment key={idx}>
          {b.isPageBreak ? (
            <BreakBadge onRemove={() => removeBreak(idx)} />
          ) : (
            <div
              className="composer-block"
              style={blockStyle}
              dangerouslySetInnerHTML={{ __html: b.html }}
            />
          )}
          <Inserter onClick={() => insertBreakAt(idx + 1)} />
        </React.Fragment>
      ))}
    </div>
  );
}

function Inserter({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="composer-inserter"
      title="ここに改ページを挿入"
      style={inserterStyle}
    >
      <span style={inserterLineStyle} />
      <span style={inserterLabelStyle}>＋ ここで改ページ</span>
      <span style={inserterLineStyle} />
    </button>
  );
}

function BreakBadge({ onRemove }: { onRemove: () => void }) {
  return (
    <div style={breakBadgeStyle}>
      <span style={{ flex: 1, height: 0, borderTop: "2px solid #ff5050" }} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          background: "#ff5050",
          padding: "3px 10px",
          borderRadius: 12,
          letterSpacing: ".08em",
        }}
      >
        ✂ ここで改ページ
      </span>
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: "transparent",
          border: "1px solid #ff5050",
          color: "#ff5050",
          fontSize: 11,
          padding: "2px 8px",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: 700,
        }}
        title="この改ページを解除"
      >
        × 解除
      </button>
      <span style={{ flex: 1, height: 0, borderTop: "2px solid #ff5050" }} />
    </div>
  );
}

function parseBlocks(html: string): Block[] {
  if (typeof window === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__root__">${html}</div>`, "text/html");
  const root = doc.getElementById("__root__");
  if (!root) return [];
  const blocks: Block[] = [];
  Array.from(root.children).forEach((el) => {
    blocks.push({
      html: el.outerHTML,
      isPageBreak: el.classList.contains("page-break"),
    });
  });
  return blocks;
}

const composerPageStyle: React.CSSProperties = {
  // .contract-page のスタイルは globals.css 側で width:210mm 等が適用される。
  // A4の改ページ位置目印として薄い赤い水平線を 297mm 刻みで描画。
  backgroundImage:
    "repeating-linear-gradient(to bottom, transparent 0, transparent calc(297mm - 1px), rgba(255,80,80,.35) calc(297mm - 1px), rgba(255,80,80,.35) 297mm)",
  // ↓ PDF実物（buildPrintableHtml）と完全一致させて、ルーラー位置を信用できるようにする
  padding: "14mm 16mm",
  fontFamily: '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", "MS Mincho", serif',
  fontSize: "9.8pt",
  lineHeight: 1.72,
  boxShadow: "0 1px 6px rgba(0,0,0,.08)",
  // 余白による境界線の起算点ズレを防ぐためにbackground-originを設定
  backgroundOrigin: "border-box",
};

const blockStyle: React.CSSProperties = {
  // ブロックがエディタ上で識別できるように、ホバー時に薄い枠を出す
  borderRadius: 4,
  transition: "background .15s",
};

const inserterStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  padding: "8px 0",
  margin: "4px 0",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  opacity: 0.85, // ← 常時はっきり見える
  transition: "opacity .15s, transform .1s",
};

const inserterLineStyle: React.CSSProperties = {
  flex: 1,
  height: 0,
  borderTop: "2px dashed #2f6dd1",
};

const inserterLabelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#fff",
  background: "#2f6dd1",
  padding: "5px 14px",
  borderRadius: 14,
  letterSpacing: ".05em",
  border: "1px solid #2f6dd1",
  whiteSpace: "nowrap",
  boxShadow: "0 1px 3px rgba(47,109,209,.2)",
};

const breakBadgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "10px 0",
  padding: "4px 0",
};
