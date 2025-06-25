import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { SlashCommandExtension } from './SlashCommandExtension';
import './tiptap.css';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable rich text features for plain text editing
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        heading: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing... Type "/" for commands',
        emptyEditorClass: 'is-editor-empty',
      }),
      SlashCommandExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      // Get plain text content without HTML formatting
      const htmlContent = editor.getHTML();
      // Convert HTML to plain text while preserving line breaks
      const textContent = htmlContent
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
        .replace(/\n$/, ''); // Remove trailing newline
      
      onChange(textContent);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[600px] px-4 py-4 text-gray-900 leading-relaxed',
        style: 'font-family: inherit; font-size: inherit;',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getText()) {
      // Convert plain text to HTML for editor
      const htmlContent = content
        .split('\n')
        .map(line => `<p>${line || '<br>'}</p>`)
        .join('');
      editor.commands.setContent(htmlContent);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="min-h-[600px] px-4 py-4 text-gray-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="h-full">
      <EditorContent 
        editor={editor} 
        className="h-full"
      />
    </div>
  );
};

export default TextEditor; 