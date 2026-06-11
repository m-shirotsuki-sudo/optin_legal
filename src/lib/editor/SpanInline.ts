import { Mark, mergeAttributes } from "@tiptap/core";

/**
 * <span class="red"> 等のインラインクラスを保持するMark。
 * data-variable は VariableNode の方が拾うので、無印class付きspanだけ対象。
 */
export const SpanInline = Mark.create({
  name: "spanInline",

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
    return [
      {
        tag: "span",
        getAttrs: (el) => {
          if (typeof el === "string") return false;
          // data-variable があるならVariableNodeに任せる
          if (el.hasAttribute("data-variable")) return false;
          // class が無いなら拾わない（普通のテキスト扱い）
          if (!el.className) return false;
          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
});
