import { Extension } from "@tiptap/core";

/**
 * TipTap の各ノードに `class` 属性の保持を許可する拡張。
 * これがないと StarterKit は <p class="article-head"> のクラスを剥がしてしまい、
 * 契約書テンプレの .notice-box / .doc-title / .article-head / .red 等の指定が消える。
 *
 * 対象ノード：paragraph / heading / table / tableCell / tableHeader / tableRow / bulletList / orderedList / listItem
 * インラインの class（.red 等）は Span ノード（別途追加）で扱う。
 */
export const PreserveClasses = Extension.create({
  name: "preserveClasses",

  addGlobalAttributes() {
    return [
      {
        types: [
          "paragraph",
          "heading",
          "table",
          "tableCell",
          "tableHeader",
          "tableRow",
          "bulletList",
          "orderedList",
          "listItem",
        ],
        attributes: {
          class: {
            default: null,
            parseHTML: (el) => el.getAttribute("class"),
            renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
          },
        },
      },
    ];
  },
});
