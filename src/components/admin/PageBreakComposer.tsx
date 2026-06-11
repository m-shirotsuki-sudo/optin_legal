"use client";

import React, { useEffect, useState } from "react";

interface Props {
  /** 保存形式の本文HTML */
  value: string;
  /** 改ページの挿入／削除を反映した本文HTMLを返す */
  onChange: (next: string) => void;
}

/**
 * 本文HTML中の **どこにでも** クリック1つで改ページを挿入・解除できるコンポーザ。
 *
 * トップレベルだけでなく、`<div class="article">` の中の段落の前・表の前など、
 * あらゆる兄弟要素の間に「＋ ここで改ページ」ボタンを置く。
 * `<p>` `<table>` `<h1>` 等の "原子要素" は内側に分け入らず、丸ごと描画。
 * `<div>` `<section>` のようなコンテナは React で再帰描画して、内側の兄弟関係も
 * 編集可能にする。
 *
 * 仕組み：
 * - 状態管理しない。`value` を毎レンダ DOMParser で再パース → ツリー描画。
 * - 挿入／削除は parse → 変更 → innerHTML 再シリアライズ → onChange に渡す。
 * - これにより `{{key}}` や独自CSSクラスを一切壊さない。
 */

// 「原子要素」：内側に分け入らず丸ごと表示する（=その中に改ページを入れる必要が薄い）
const ATOMIC_TAGS = new Set([
  "p", "table", "h1", "h2", "h3", "h4", "h5", "h6",
  "pre", "blockquote", "img", "hr", "ul", "ol", "figure",
]);

export function PageBreakComposer({ value, onChange }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div style={{ padding: 30, textAlign: "center", color: "#9aa1ad", fontSize: 12 }}>
        プレビューを準備中…
      </div>
    );
  }

  const doc = parseHtml(value);
  const root = doc.body;
  if (root.children.length === 0) {
    return (
      <div style={{ padding: 30, textAlign: "center", color: "#9aa1ad", fontSize: 12 }}>
        本文HTMLが空です。docx取込か、HTML直接編集で本文を入れてください。
      </div>
    );
  }

  function mutateAndSave(mutator: (root: HTMLElement) => void) {
    const fresh = parseHtml(value);
    mutator(fresh.body);
    onChange(fresh.body.innerHTML);
  }

  // path = [0番目の子, さらにその中の N番目の子, ...] の配列
  function insertBreakAt(path: number[]) {
    mutateAndSave((rootEl) => {
      const parent = navigatePath(rootEl, path.slice(0, -1));
      const idx = path[path.length - 1];
      const newBreak = parent.ownerDocument!.createElement("div");
      newBreak.className = "page-break";
      const before = parent.children[idx];
      if (before) parent.insertBefore(newBreak, before);
      else parent.appendChild(newBreak);
    });
  }

  function removeAt(path: number[]) {
    mutateAndSave((rootEl) => {
      const parent = navigatePath(rootEl, path.slice(0, -1));
      const idx = path[path.length - 1];
      const el = parent.children[idx];
      if (el) el.remove();
    });
  }

  // 強制改ページの数からページ数を算出（最低1ページ）
  const breakCount = countPageBreaks(root);
  const totalPages = breakCount + 1;

  return (
    <div>
      <div style={overallHeaderStyle}>
        📄 全 <b style={{ color: "#2f6dd1", fontSize: 14 }}>{totalPages}</b> ページ構成
        <span style={{ marginLeft: 12, color: "#9aa1ad", fontWeight: 400, fontSize: 11 }}>
          ※ 自然改ページ（Puppeteer 側で自動）を含むと実際はもう少し多くなる可能性あり。「📄 PDFで実物プレビュー」で正確に確認。
        </span>
      </div>
      <div className="contract-page" style={composerPageStyle}>
        <PageHeader pageNum={1} />
        <Tree
          parent={root}
          path={[]}
          onInsert={insertBreakAt}
          onRemove={removeAt}
          pageState={{ current: 1, total: totalPages }}
        />
      </div>
    </div>
  );
}

function countPageBreaks(root: Element): number {
  return root.querySelectorAll("div.page-break").length;
}

function PageHeader({ pageNum }: { pageNum: number }) {
  return (
    <div style={pageHeaderStyle} contentEditable={false}>
      <span style={pageHeaderBadgeStyle}>📄 ページ {pageNum}</span>
      <span style={{ flex: 1, borderTop: "1px solid #cfe0f1" }} />
    </div>
  );
}

function PageDivider({ fromPage, toPage }: { fromPage: number; toPage: number }) {
  return (
    <div style={pageDividerStyle} contentEditable={false}>
      <div style={pageDividerEndStyle}>
        <span style={{ flex: 1, borderTop: "2px solid #c0392b" }} />
        <span style={pageDividerEndLabelStyle}>↑ ここまで ページ {fromPage}</span>
        <span style={{ flex: 1, borderTop: "2px solid #c0392b" }} />
      </div>
      <div style={pageGapStyle}>
        <span style={{ color: "#9aa1ad", fontSize: 11, letterSpacing: ".1em" }}>━ ✂ 改ページ ✂ ━</span>
      </div>
      <div style={pageDividerStartStyle}>
        <span style={{ flex: 1, borderTop: "2px solid #1f7a42" }} />
        <span style={pageDividerStartLabelStyle}>↓ ここから ページ {toPage}</span>
        <span style={{ flex: 1, borderTop: "2px solid #1f7a42" }} />
      </div>
    </div>
  );
}

interface PageState {
  current: number;
  total: number;
}

function Tree({
  parent,
  path,
  onInsert,
  onRemove,
  pageState,
}: {
  parent: Element;
  path: number[];
  onInsert: (p: number[]) => void;
  onRemove: (p: number[]) => void;
  pageState: PageState;
}) {
  const children = Array.from(parent.children);
  const depth = path.length;
  return (
    <>
      <Inserter depth={depth} onClick={() => onInsert([...path, 0])} />
      {children.map((child, idx) => {
        const childPath = [...path, idx];
        // 改ページバッジ：ページ境界を視覚化、+ ページ番号を進める
        if (child.classList.contains("page-break")) {
          const from = pageState.current;
          const to = pageState.current + 1;
          pageState.current = to;
          return (
            <React.Fragment key={idx}>
              <PageDivider fromPage={from} toPage={to} />
              <RemoveBreakBar onRemove={() => onRemove(childPath)} />
              <PageHeader pageNum={to} />
              <Inserter depth={depth} onClick={() => onInsert([...path, idx + 1])} />
            </React.Fragment>
          );
        }
        const tag = child.tagName.toLowerCase();
        const isAtomic = ATOMIC_TAGS.has(tag) || child.children.length === 0;
        if (isAtomic) {
          return (
            <React.Fragment key={idx}>
              <div className="composer-block" dangerouslySetInnerHTML={{ __html: child.outerHTML }} />
              <Inserter depth={depth} onClick={() => onInsert([...path, idx + 1])} />
            </React.Fragment>
          );
        }
        // コンテナ：React で再帰描画
        const className = child.getAttribute("class") || undefined;
        return (
          <React.Fragment key={idx}>
            {React.createElement(
              tag,
              { className, "data-composer-container": "true" },
              <Tree parent={child} path={childPath} onInsert={onInsert} onRemove={onRemove} pageState={pageState} />
            )}
            <Inserter depth={depth} onClick={() => onInsert([...path, idx + 1])} />
          </React.Fragment>
        );
      })}
    </>
  );
}

function RemoveBreakBar({ onRemove }: { onRemove: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "2px 0 6px" }} contentEditable={false}>
      <button
        type="button"
        onClick={onRemove}
        title="この改ページを解除"
        style={{
          background: "#fff",
          border: "1px solid #ff5050",
          color: "#ff5050",
          fontSize: 11,
          padding: "2px 10px",
          borderRadius: 12,
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        × この改ページを解除
      </button>
    </div>
  );
}

function Inserter({ depth, onClick }: { depth: number; onClick: () => void }) {
  // 深いネストの中の+は控えめに、トップレベルの+は目立つように
  const isTop = depth === 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="composer-inserter"
      title="ここに改ページを挿入"
      style={{
        ...inserterStyle,
        margin: isTop ? "6px 0" : "2px 0",
        padding: isTop ? "6px 0" : "2px 0",
        opacity: isTop ? 0.85 : 0.45,
      }}
    >
      <span style={inserterLineStyle} />
      <span
        style={{
          ...inserterLabelStyle,
          fontSize: isTop ? 13 : 10,
          padding: isTop ? "5px 14px" : "1px 8px",
        }}
      >
        ＋ ここで改ページ
      </span>
      <span style={inserterLineStyle} />
    </button>
  );
}

function parseHtml(html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(`<html><body>${html}</body></html>`, "text/html");
}

function navigatePath(root: HTMLElement, path: number[]): HTMLElement {
  let current: Element = root;
  for (const idx of path) {
    current = current.children[idx];
  }
  return current as HTMLElement;
}

const composerPageStyle: React.CSSProperties = {
  // A4 境界線（297mm刻みの薄い赤線）
  backgroundImage:
    "repeating-linear-gradient(to bottom, transparent 0, transparent calc(297mm - 1px), rgba(255,80,80,.35) calc(297mm - 1px), rgba(255,80,80,.35) 297mm)",
  // PDF生成側 (buildPrintableHtml) と一致させる：余白・フォント・サイズ・行高
  padding: "14mm 16mm",
  fontFamily: '"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", "MS Mincho", serif',
  fontSize: "9.8pt",
  lineHeight: 1.72,
  boxShadow: "0 1px 6px rgba(0,0,0,.08)",
  backgroundOrigin: "border-box",
};

const inserterStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  transition: "opacity .15s, transform .1s",
};

const inserterLineStyle: React.CSSProperties = {
  flex: 1,
  height: 0,
  borderTop: "2px dashed #2f6dd1",
};

const inserterLabelStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#fff",
  background: "#2f6dd1",
  borderRadius: 14,
  letterSpacing: ".05em",
  border: "1px solid #2f6dd1",
  whiteSpace: "nowrap",
  boxShadow: "0 1px 3px rgba(47,109,209,.2)",
};

const overallHeaderStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "#14171d",
  background: "#fff",
  border: "1px solid var(--line)",
  borderBottom: "none",
  borderRadius: "6px 6px 0 0",
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
};

const pageHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "0 0 12px",
};

const pageHeaderBadgeStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#2f6dd1",
  background: "#eef5ff",
  border: "1px solid #cfe0f1",
  padding: "3px 12px",
  borderRadius: 12,
  letterSpacing: ".05em",
};

const pageDividerStyle: React.CSSProperties = {
  margin: "20px 0",
  padding: "0",
  userSelect: "none",
};

const pageDividerEndStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: 0,
};

const pageDividerStartStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: 0,
};

const pageDividerEndLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#fff",
  background: "#c0392b",
  padding: "3px 10px",
  borderRadius: 12,
  letterSpacing: ".05em",
  whiteSpace: "nowrap",
};

const pageDividerStartLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#fff",
  background: "#1f7a42",
  padding: "3px 10px",
  borderRadius: 12,
  letterSpacing: ".05em",
  whiteSpace: "nowrap",
};

const pageGapStyle: React.CSSProperties = {
  height: 28,
  margin: "4px -16mm",
  background:
    "repeating-linear-gradient(45deg, #f5f5f7, #f5f5f7 6px, #e2e7ef 6px, #e2e7ef 12px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderTop: "1px solid #d8dde7",
  borderBottom: "1px solid #d8dde7",
};
