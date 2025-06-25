import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Placeholder from '@tiptap/extension-placeholder';
import { SlashCommandExtension } from './SlashCommandExtension';
import './tiptap.css';
import { Link } from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import language syntaxes
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';

import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
  CheckSquare,
  Minus
} from 'lucide-react';

// Create lowlight instance and register languages
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('sql', sql);
lowlight.register('json', json);
lowlight.register('yaml', yaml);
lowlight.register('markdown', markdown);

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
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline cursor-pointer',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 rounded-md p-4 font-mono text-sm border border-gray-200 dark:border-gray-700',
        },
      }),
      TaskList.configure({
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
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'horizontal-rule',
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
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-w-none',
          'dark:prose-invert',
          'prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
          'prose-p:text-gray-700 dark:prose-p:text-gray-300',
          'prose-a:text-blue-600 dark:prose-a:text-blue-400',
          'prose-strong:text-gray-900 dark:prose-strong:text-gray-100',
          'prose-code:text-pink-600 dark:prose-code:text-pink-400',
          'prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800',
          'prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600',
          'prose-hr:border-gray-300 dark:prose-hr:border-gray-600',
          'prose-ul:text-gray-700 dark:prose-ul:text-gray-300',
          'prose-ol:text-gray-700 dark:prose-ol:text-gray-300',
          'prose-li:text-gray-700 dark:prose-li:text-gray-300',
          'min-h-[400px] p-4'
        ),
        style: `font-family: ${fontFamily}`,
        'data-placeholder': placeholder,
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

  const ToolbarButton = ({ 
    isActive, 
    onClick, 
    children, 
    disabled = false 
  }: { 
    isActive?: boolean; 
    onClick: () => void; 
    children: React.ReactNode; 
    disabled?: boolean;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0",
        isActive 
          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
      )}
    >
      {children}
    </Button>
  );

  if (!editor) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <ToolbarButton
              isActive={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor.isActive('code')}
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <ToolbarButton
              isActive={editor.isActive('heading', { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor.isActive('heading', { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <ToolbarButton
              isActive={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              isActive={editor.isActive('blockquote')}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-gray-900 transition-colors duration-200">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapEditor; 