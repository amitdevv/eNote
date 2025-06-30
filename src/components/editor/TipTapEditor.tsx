import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import { Iframe } from './IframeExtension';
import { SlashCommandExtension } from './SlashCommandExtension';
import './tiptap.css';
import { Link } from '@tiptap/extension-link';



interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  fontFamily?: string;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  fontFamily = "Inter"
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'editor-table-row',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'editor-table-header',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'editor-table-cell',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'youtube-embed',
        },
      }),
      Iframe.configure({
        allowFullScreen: true,
        HTMLAttributes: {
          class: 'iframe-embed',
        },
      }),
      TaskList.configure({
        itemTypeName: 'taskItem',
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing... Type "/" for commands',
        emptyEditorClass: 'is-editor-empty',
      }),
      SlashCommandExtension,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none min-h-[400px] p-4',
        style: `font-family: "${fontFamily}", sans-serif;`,
        'data-placeholder': placeholder,
        spellcheck: 'false',
      },
      handleKeyDown: (_, event) => {
        // Handle keyboard shortcuts for text formatting
        if (event.ctrlKey || event.metaKey) {
          // Bold - Ctrl+B
          if (event.key === 'b') {
            event.preventDefault();
            editor?.chain().focus().toggleBold().run();
            return true;
          }
          
          // Italic - Ctrl+I
          if (event.key === 'i') {
            event.preventDefault();
            editor?.chain().focus().toggleItalic().run();
            return true;
          }
          
          // Underline - Ctrl+U
          if (event.key === 'u') {
            event.preventDefault();
            editor?.chain().focus().toggleUnderline().run();
            return true;
          }
        }
        
        // Handle Ctrl+Enter or Cmd+Enter to exit code block
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          if (editor?.isActive('codeBlock')) {
            event.preventDefault();
            event.stopPropagation();
            editor.commands.exitCode();
            return true;
          }
        }
        
        // Handle Escape to exit code block (prevent global ESC handler)
        if (event.key === 'Escape') {
          if (editor?.isActive('codeBlock')) {
            event.preventDefault();
            event.stopPropagation();
            editor.commands.exitCode();
            return true;
          }
        }
        
        // Handle Shift+Enter to exit lists and create new paragraph
        if (event.shiftKey && event.key === 'Enter') {
          if (editor?.isActive('taskList')) {
            event.preventDefault();
            event.stopPropagation();
            
            // Exit the task list and create a new paragraph
            editor.chain()
              .liftListItem('taskItem')
              .insertContent('\n')
              .setParagraph()
              .run();
            return true;
          }
          
          if (editor?.isActive('bulletList') || editor?.isActive('orderedList')) {
            event.preventDefault();
            event.stopPropagation();
            
            // Exit the list and create a new paragraph
            editor.chain()
              .liftListItem('listItem')
              .insertContent('\n')
              .setParagraph()
              .run();
            return true;
          }
        }
        
        // Handle double Enter to exit code block (when on empty line)
        if (event.key === 'Enter' && editor?.isActive('codeBlock')) {
          const { selection } = editor.state;
          const { $from } = selection;
          const currentLine = $from.parent.textContent;
          
          // If current line is empty or just whitespace
          if (!currentLine.trim()) {
            // Check if previous line is also empty
            const pos = $from.pos;
            const doc = editor.state.doc;
            const linesBefore = doc.textBetween(Math.max(0, pos - 50), pos, '\n').split('\n');
            
            if (linesBefore.length > 1 && !linesBefore[linesBefore.length - 2]?.trim()) {
              event.preventDefault();
              event.stopPropagation();
              editor.commands.exitCode();
              return true;
            }
          }
        }
        
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  }, []);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update font family when it changes
  useEffect(() => {
    if (editor && editor.view && editor.view.dom) {
      const editorElement = editor.view.dom as HTMLElement;
      editorElement.style.fontFamily = `"${fontFamily}", sans-serif`;
      
      // Also apply to all child elements with high specificity
      const style = document.createElement('style');
      style.textContent = `
        .ProseMirror, .ProseMirror * {
          font-family: "${fontFamily}", sans-serif !important;
          font-display: swap !important;
        }
      `;
      
      // Remove previous font style if exists
      const prevStyle = document.getElementById('tiptap-font-override');
      if (prevStyle) {
        prevStyle.remove();
      }
      
      style.id = 'tiptap-font-override';
      document.head.appendChild(style);
      
      // Cleanup function
      return () => {
        const styleToRemove = document.getElementById('tiptap-font-override');
        if (styleToRemove) {
          styleToRemove.remove();
        }
      };
    }
  }, [fontFamily, editor]);



  if (!editor) {
    return (
      <div className="bg-white dark:bg-[#1e1e1e] rounded-lg p-4">
        <div className="animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div 
      className="bg-white dark:bg-[#1e1e1e] transition-colors duration-200 rounded-lg w-full max-w-full"
      style={{ fontFamily }}
    >
      <div className="w-full max-w-full">
        <EditorContent 
          editor={editor} 
          style={{ fontFamily }}
          className="w-full max-w-full"
        />
      </div>
    </div>
  );
};

export default TipTapEditor; 