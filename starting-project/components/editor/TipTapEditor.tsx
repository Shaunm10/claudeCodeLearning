"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type TipTapEditorProps = {
  onUpdate: (json: object) => void;
};

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  label: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, isActive, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
        isActive
          ? "bg-foreground text-background"
          : "hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"
      }`}
    >
      {children}
    </button>
  );
}

export function TipTapEditor({ onUpdate }: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        strike: false,
        heading: { levels: [1, 2, 3] },
      }),
    ],
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col rounded-lg border border-black/[0.12] dark:border-white/[0.12]">
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap gap-1 border-b border-black/[0.08] p-2 dark:border-white/[0.08]"
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          label="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          label="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        <span className="mx-1 w-px self-stretch bg-black/[0.1] dark:bg-white/[0.1]" aria-hidden />
        {([1, 2, 3] as const).map((level) => (
          <ToolbarButton
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            isActive={editor.isActive("heading", { level })}
            label={`Heading ${level}`}
          >
            H{level}
          </ToolbarButton>
        ))}
        <span className="mx-1 w-px self-stretch bg-black/[0.1] dark:bg-white/[0.1]" aria-hidden />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          label="Bullet list"
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          label="Horizontal rule"
        >
          —
        </ToolbarButton>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert min-h-[200px] max-w-none px-4 py-3 focus-within:outline-none [&_.tiptap]:outline-none"
      />
    </div>
  );
}
