import React, { useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
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
import { ColorPicker } from '@/components/ui/color-picker';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Underline as UnderlineIcon,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Code,
  Link as LinkIcon
} from 'lucide-react';
import './tiptap.css';
import { Link } from '@tiptap/extension-link';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  fontFamily?: string;
  fontSize?: number;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  fontFamily = "Inter",
  fontSize = 16
}) => {
  const [shouldShowBubbleMenu, setShouldShowBubbleMenu] = React.useState(false);

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
        onReadOnlyChecked: (_, checked) => {
          return checked;
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
        class: 'tiptap-editor focus:outline-none h-full min-h-screen p-6',
        style: `font-family: "${fontFamily}", sans-serif; font-size: ${fontSize}px;`,
        'data-placeholder': placeholder,
        spellcheck: 'true',
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
        
        // Handle Backspace in task lists
        if (event.key === 'Backspace' && editor?.isActive('taskItem')) {
          const { selection } = editor.state;
          const { $from } = selection;
          const currentText = $from.parent.textContent;
          
          // If the task item is empty or cursor is at the beginning
          if (!currentText.trim() || $from.parentOffset === 0) {
            event.preventDefault();
            event.stopPropagation();
            
            // Try to lift the task item (convert to paragraph)
            const canLift = editor.can().liftListItem('taskItem');
            if (canLift) {
              editor.chain().liftListItem('taskItem').run();
            } else {
              // If can't lift, try to delete the task item
              editor.chain().deleteCurrentNode().run();
            }
            return true;
          }
        }
        
        // Handle Enter in empty task items
        if (event.key === 'Enter' && editor?.isActive('taskItem')) {
          const { selection } = editor.state;
          const { $from } = selection;
          const currentText = $from.parent.textContent;
          
          // If the task item is empty, exit the task list
          if (!currentText.trim()) {
            event.preventDefault();
            event.stopPropagation();
            
            // Exit the task list and create a new paragraph
            editor.chain()
              .liftListItem('taskItem')
              .setParagraph()
              .run();
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
    onCreate: () => {
      // Enable bubble menu after editor is created
      setShouldShowBubbleMenu(true);
    },
    onDestroy: () => {
      // Disable bubble menu when editor is destroyed
      setShouldShowBubbleMenu(false);
    },
  }, []);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update font family and size when they change
  useEffect(() => {
    if (editor && editor.view && editor.view.dom) {
      const editorElement = editor.view.dom as HTMLElement;
      editorElement.style.fontFamily = `"${fontFamily}", sans-serif`;
      editorElement.style.fontSize = `${fontSize}px`;
      
      // Also apply to all child elements with high specificity
      const style = document.createElement('style');
      style.textContent = `
        .ProseMirror, .ProseMirror * {
          font-family: "${fontFamily}", sans-serif !important;
          font-size: ${fontSize}px !important;
          font-display: swap !important;
        }

        .ProseMirror strong {
          font-weight: bold !important;
        }
        .ProseMirror u {
          text-decoration: underline !important;
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
  }, [fontFamily, fontSize, editor]);

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
      className="bg-white dark:bg-[#171717] transition-colors duration-200 w-full h-full relative"
      style={{ fontFamily, fontSize: `${fontSize}px` }}
    >
      {/* Top Toolbar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#171717]/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
        <div className="flex items-center gap-1 p-2">
          {/* Bold */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 px-2 ${editor.isActive('bold') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>

          {/* Italic */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 px-2 ${editor.isActive('italic') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>

          {/* Underline */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-8 px-2 ${editor.isActive('underline') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Headings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-8 px-2 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-8 px-2 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Lists */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 px-2 ${editor.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 px-2 ${editor.isActive('orderedList') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Blockquote */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-8 px-2 ${editor.isActive('blockquote') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </Button>

          {/* Code Block */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`h-8 px-2 ${editor.isActive('codeBlock') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Link */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run();
                return;
              }
              const previousUrl = editor.getAttributes('link').href as string | undefined;
              const url = window.prompt('Enter URL', previousUrl || 'https://');
              if (url && url.trim()) {
                editor.chain().focus().setLink({ href: url.trim() }).run();
              }
            }}
            className={`h-8 px-2 ${editor.isActive('link') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title={editor.isActive('link') ? 'Remove Link' : 'Insert Link'}
          >
            <LinkIcon className="w-4 h-4" />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Color Picker */}
          <ColorPicker
            currentColor={editor.getAttributes('textStyle').color || ''}
            onColorChange={(color) => {
              if (color) {
                editor.chain().focus().setColor(color).run();
              } else {
                editor.chain().focus().unsetColor().run();
              }
            }}
          />
        </div>
      </div>
      {/* Editor Mode */}
      <EditorContent 
        editor={editor} 
        style={{ fontFamily, fontSize: `${fontSize}px` }}
        className="w-full h-full"
      />
      
      {/* Bubble Menu for text selection */}
      {editor && shouldShowBubbleMenu && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ 
            duration: 100,
            placement: 'top',
            hideOnClick: false,
            interactive: true
          }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center gap-1"
        >
          {/* Bold */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>

          {/* Underline */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Color Picker */}
          <ColorPicker
            currentColor={editor.getAttributes('textStyle').color || ''}
            onColorChange={(color) => {
              if (color) {
                editor.chain().focus().setColor(color).run();
              } else {
                editor.chain().focus().unsetColor().run();
              }
            }}
          />
        </BubbleMenu>
      )}
    </div>
  );
};

export default TipTapEditor; 