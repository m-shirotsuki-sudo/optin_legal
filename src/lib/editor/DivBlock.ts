import { Node, mergeAttributes } from "@tiptap/core";

/**
 * <div class="..."> をブロックレベルのコンテナとして保持するノード。
 * StarterKitには div の概念がなく、`<div class="notice-box">` 等が
 * 取り込み時に消えてしまうため、最低限の汎用 Div を追加する。
 *
 * - parseHTML: クラス指定のある div を拾う（無印のdivは段落になる、よりノイズが少ない）
 * - renderHTML: <div class="…"> として書き出し
 * - content: ブロック要素を内包可
 */
export const DivBlock = Node.create({
  name: "divBlock",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (el) => el.getAttribute("class"),
        renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
      },
    };
  },

  parseHTML() {
    // page-break は専用Nodeで拾うので除外
    return [
      {
        tag: "div",
        getAttrs: (el) => {
          if (typeof el === "string") return false;
          if (el.classList.contains("page-break")) return false;
          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },
});
