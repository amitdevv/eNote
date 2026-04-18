import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import type { NoteDoc } from '@/shared/lib/supabase';

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
      Placeholder.configure({ placeholder: 'Start writing…' }),
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

  return <EditorContent editor={editor} />;
}
