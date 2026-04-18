import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect, useRef } from 'react';
import type { NoteDoc } from '@/shared/lib/supabase';
import { cn } from '@/shared/lib/cn';
import {
  HugeiconsIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
  Link01Icon,
  Heading01Icon,
  Heading02Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  CheckmarkSquare01Icon,
  QuoteUpIcon,
  SourceCodeCircleIcon,
} from '@/shared/lib/icons';

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
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: "Start writing…  select text to format",
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
        className="flex items-center gap-0.5 rounded-lg border border-line-default bg-surface-panel shadow-md p-1"
      >
        <BtnIcon
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={TextBoldIcon}
          label="Bold"
          kbd="⌘B"
        />
        <BtnIcon
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={TextItalicIcon}
          label="Italic"
          kbd="⌘I"
        />
        <BtnIcon
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={TextUnderlineIcon}
          label="Underline"
          kbd="⌘U"
        />
        <BtnIcon
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={TextStrikethroughIcon}
          label="Strikethrough"
        />
        <Divider />
        <BtnIcon
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          icon={Heading01Icon}
          label="Heading 1"
        />
        <BtnIcon
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={Heading02Icon}
          label="Heading 2"
        />
        <Divider />
        <BtnIcon
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={LeftToRightListBulletIcon}
          label="Bullet list"
        />
        <BtnIcon
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={LeftToRightListNumberIcon}
          label="Numbered list"
        />
        <BtnIcon
          active={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          icon={CheckmarkSquare01Icon}
          label="Task list"
        />
        <Divider />
        <BtnIcon
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={QuoteUpIcon}
          label="Quote"
        />
        <BtnIcon
          active={editor.isActive('code') || editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          icon={SourceCodeCircleIcon}
          label="Code"
        />
        <BtnIcon
          active={editor.isActive('link')}
          onClick={handleSetLink}
          icon={Link01Icon}
          label="Link"
        />
      </BubbleMenu>

      <EditorContent editor={editor} />
    </>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-line-default mx-0.5" aria-hidden />;
}

function BtnIcon({
  active,
  onClick,
  icon,
  label,
  kbd,
}: {
  active: boolean;
  onClick: () => void;
  icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
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
        'flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150',
        active
          ? 'bg-surface-active text-ink-strong'
          : 'text-ink-muted hover:bg-surface-muted hover:text-ink-strong'
      )}
    >
      <HugeiconsIcon icon={icon} size={16} />
    </button>
  );
}
