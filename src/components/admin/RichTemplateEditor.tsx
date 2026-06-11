"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import { PageBreakNode } from "@/lib/editor/PageBreakNode";
import { VariableNode } from "@/lib/editor/VariableNode";
import {
  templateToEditorHtml,
  editorHtmlToTemplate,
  flatVariableKeys,
} from "@/lib/editor/serialize";

interface Props {
  /** 保存形式の本文HTML（{{key}} と <div class="page-break"></div> を含む） */
  value: string;
  /** 保存形式で更新を返す */
  onChange: (next: string) => void;
  /** 可変フィールド定義（チップ表示用ラベルマップ・挿入メニュー用） */
  variableFields: any[];
}

export function RichTemplateEditor({ value, onChange, variableFields }: Props) {
  const [ready, setReady] = useState(false);
  const editorInitialHtml = useMemo(
    () => templateToEditorHtml(value, variableFields),
    // initialContent は1回だけセット。以降はエディタ内で編集する。
    // valueが外部で変わった時（docx取込など）は useEffect で setContent する。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // page break と被るので horizontalRule は無効化
        horizontalRule: false,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      PageBreakNode,
      VariableNode,
    ],
    content: editorInitialHtml,
    immediatelyRender: false,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(editorHtmlToTemplate(html));
    },
    editorProps: {
      attributes: {
        style:
          "min-height:360px;outline:none;padding:14px 16px;background:#fff;border:1px solid #d8dde7;border-radius:6px;font-family:'Yu Mincho','Hiragino Mincho ProN','MS Mincho',serif;font-size:13px;line-height:1.75;",
      },
    },
  });

  // 外部で value が大きく変わった時（docx取込）にエディタ内容を差し替える
  useEffect(() => {
    if (!editor) return;
    setReady(true);
    const currentSaved = editorHtmlToTemplate(editor.getHTML());
    if (currentSaved !== value) {
      editor.commands.setContent(templateToEditorHtml(value, variableFields));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) {
    return (
      <div style={{ padding: 20, fontSize: 12, color: "#9aa1ad" }}>エディタを準備中…</div>
    );
  }

  return (
    <div style={{ border: "1px solid #d8dde7", borderRadius: 8, background: "#fafbfd", overflow: "hidden" }}>
      <Toolbar editor={editor} variableFields={variableFields} />
      <div style={{ padding: 8 }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor, variableFields }: { editor: any; variableFields: any[] }) {
  const [showVarMenu, setShowVarMenu] = useState(false);
  const vars = useMemo(() => flatVariableKeys(variableFields || []), [variableFields]);

  const btn = (label: string, onClick: () => void, active = false, title = "") => (
    <button
      type="button"
      onClick={onClick}
      title={title || label}
      style={{
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 600,
        border: "1px solid #d8dde7",
        borderRadius: 5,
        background: active ? "#2f6dd1" : "#fff",
        color: active ? "#fff" : "#14171d",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: 8,
        borderBottom: "1px solid #e2e7ef",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 2,
      }}
    >
      {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "太字")}
      {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "斜体")}
      {btn(
        "H見出し",
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        editor.isActive("heading", { level: 2 }),
        "見出し"
      )}
      {btn("・箇条書き", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
      {btn("1.番号", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
      <span style={{ width: 1, background: "#e2e7ef", margin: "0 4px" }} />
      {btn(
        "📑 表を挿入",
        () =>
          editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run(),
        false,
        "簡易表を挿入"
      )}
      <span style={{ width: 1, background: "#e2e7ef", margin: "0 4px" }} />
      {btn(
        "✂️ ここで改ページ",
        () => editor.chain().focus().insertContent({ type: "pageBreak" }).run(),
        false,
        "カーソル位置に改ページを挿入"
      )}
      <div style={{ position: "relative" }}>
        {btn(
          "🟡 可変フィールド挿入 ▾",
          () => setShowVarMenu((v) => !v),
          showVarMenu,
          "{{key}} 形式の可変箇所を挿入"
        )}
        {showVarMenu && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              background: "#fff",
              border: "1px solid #d8dde7",
              borderRadius: 6,
              boxShadow: "0 4px 14px rgba(0,0,0,.08)",
              padding: 6,
              minWidth: 200,
              maxHeight: 260,
              overflowY: "auto",
              zIndex: 10,
            }}
          >
            {vars.length === 0 && (
              <div style={{ fontSize: 11, color: "#9aa1ad", padding: 6 }}>
                可変フィールドが未定義です。下の「可変フィールド定義」JSONに追加してください。
              </div>
            )}
            {vars.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .insertContent({
                      type: "variable",
                      attrs: { key: v.key, label: v.label },
                    })
                    .run();
                  setShowVarMenu(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "5px 8px",
                  fontSize: 12,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                <span style={{ background: "#fff3a8", padding: "1px 5px", borderRadius: 3, marginRight: 6, fontSize: 11 }}>
                  {v.label}
                </span>
                <code style={{ fontSize: 11, color: "#9aa1ad" }}>{`{{${v.key}}}`}</code>
              </button>
            ))}
          </div>
        )}
      </div>
      <span style={{ width: 1, background: "#e2e7ef", margin: "0 4px" }} />
      {btn("↶ 取消", () => editor.chain().focus().undo().run(), false, "Ctrl/Cmd+Z")}
      {btn("↷ やり直し", () => editor.chain().focus().redo().run(), false, "Ctrl/Cmd+Shift+Z")}
    </div>
  );
}
