import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 強制改ページノード。
 * - エディタ上では「— ここで改ページ —」というラベル付き赤線として見せる
 * - HTMLへ書き出し時は <div class="page-break"></div> として保存され、
 *   PDF生成時に CSS の break-before:page により改ページが発動する
 */
export const PageBreakNode = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true, // 内容を持たない単一ブロック
  selectable: true,

  parseHTML() {
    return [{ tag: 'div.page-break' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "page-break" })];
  },

  addNodeView() {
    // エディタ上でラベル付きの赤線として表示する
    return () => {
      const dom = document.createElement("div");
      dom.contentEditable = "false";
      dom.style.cssText = [
        "display:flex",
        "align-items:center",
        "gap:8px",
        "margin:12px 0",
        "padding:4px 0",
        "user-select:none",
        "cursor:pointer",
      ].join(";");
      dom.innerHTML = `
        <span style="flex:1;height:0;border-top:2px dashed #ff5050"></span>
        <span style="font-size:11px;color:#ff5050;font-weight:700;letter-spacing:.08em;background:#fff;padding:0 8px">— ここで改ページ —</span>
        <span style="flex:1;height:0;border-top:2px dashed #ff5050"></span>
      `;
      dom.title = "クリックで選択 → Delete で削除";
      return { dom };
    };
  },
});
