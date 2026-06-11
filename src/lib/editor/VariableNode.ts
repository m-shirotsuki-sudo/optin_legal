import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 可変フィールド（{{customer_name}} 等）を「チップ」として表示するインラインノード。
 *
 * - エディタ上：黄色いラベル「氏名」のように見える（label属性を表示）
 * - HTMLへ書き出し：{{key}} という素のテキストに戻す（PDFパイプライン互換）
 * - ロード時：先にHTML中の {{key}} を <span data-variable="key" data-label="..."></span> に
 *   置換しておくと、parseHTML がこのノードとして取り込む。
 */
export const VariableNode = Node.create({
  name: "variable",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      key: { default: "" },
      label: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-variable]",
        getAttrs: (el) => {
          if (typeof el === "string") return false;
          const key = el.getAttribute("data-variable") || "";
          const label = el.getAttribute("data-label") || key;
          return { key, label };
        },
      },
    ];
  },

  // HTMLへ書き出すとき、TipTapは renderHTML を呼ぶが、保存時には
  // `editor.getHTML()` ではなく serializeToTemplate() で「{{key}}」に戻す。
  // renderHTML はコピペやペースト処理のためにそれっぽい形にしておく。
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-variable": HTMLAttributes.key,
        "data-label": HTMLAttributes.label,
        class: "var-chip",
      }),
      `{{${HTMLAttributes.key}}}`,
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      const key = node.attrs.key;
      const label = node.attrs.label || key;
      dom.contentEditable = "false";
      dom.style.cssText = [
        "display:inline-block",
        "background:#fff3a8",
        "border:1px solid #e9c84a",
        "color:#7a5a00",
        "padding:0 6px",
        "border-radius:4px",
        "font-size:.85em",
        "font-weight:600",
        "user-select:none",
        "white-space:nowrap",
        "margin:0 1px",
      ].join(";");
      dom.textContent = label;
      dom.title = `可変フィールド：${key}`;
      return { dom };
    };
  },
});
