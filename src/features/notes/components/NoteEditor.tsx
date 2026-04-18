import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useEffect, useRef } from 'react';
import type { NoteDoc } from '@/shared/lib/supabase';
import { cn } from '@/shared/lib/cn';

type Props = {
  initialContent: NoteDoc;
  onChange: (doc: NoteDoc, text: string) => void;
};

export function NoteEditor({ initialContent, onChange }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Start writing…  type '/' for commands, select text to format",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: initialContent as unknown as JSONContent,
    editorProps: { attributes: { class: 'tiptap' } },
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getJSON() as unknown as NoteDoc, editor.getText());
    },
  });

  const lastInitialRef = useRef(initialContent);
  useEffect(() => {
    if (editor && initialContent !== lastInitialRef.current) {
      editor.commands.setContent(initialContent as unknown as JSONContent, { emitUpdate: false });
      lastInitialRef.current = initialContent;
    }
  }, [initialContent, editor]);

  if (!editor) return <EditorContent editor={editor} />;

  function handleSetLink() {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', prev ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <>
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 rounded-lg border border-line-default bg-surface-raised shadow-md p-0.5"
      >
        <BubbleButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold" kbd="⌘B">
          <span className="font-bold">B</span>
        </BubbleButton>
        <BubbleButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic" kbd="⌘I">
          <span className="italic">I</span>
        </BubbleButton>
        <BubbleButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} label="Strikethrough">
          <span className="line-through">S</span>
        </BubbleButton>
        <BubbleButton active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} label="Inline code">
          <span className="font-mono text-[12px]">{'<>'}</span>
        </BubbleButton>
        <div className="w-px h-5 bg-line-default mx-0.5" />
        <BubbleButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} label="Heading 1">
          <span className="font-semibold text-[11px]">H1</span>
        </BubbleButton>
        <BubbleButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="Heading 2">
          <span className="font-semibold text-[11px]">H2</span>
        </BubbleButton>
        <BubbleButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list">
          <span className="text-[13px]">•</span>
        </BubbleButton>
        <BubbleButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list">
          <span className="text-[11px]">1.</span>
        </BubbleButton>
        <BubbleButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote">
          <span className="text-[13px]">“</span>
        </BubbleButton>
        <div className="w-px h-5 bg-line-default mx-0.5" />
        <BubbleButton active={editor.isActive('link')} onClick={handleSetLink} label="Link">
          <span className="underline text-[11px]">link</span>
        </BubbleButton>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </>
  );
}

function BubbleButton({
  active,
  onClick,
  children,
  label,
  kbd,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  kbd?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={kbd ? `${label} · ${kbd}` : label}
      className={cn(
        'flex h-7 min-w-[28px] px-1.5 items-center justify-center rounded-md text-[13px] transition-colors duration-150',
        active ? 'bg-surface-active text-ink-strong' : 'text-ink-muted hover:bg-surface-muted hover:text-ink-strong'
      )}
    >
      {children}
    </button>
  );
}
