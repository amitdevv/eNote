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
        style: `font-family: "${fontFamily}", sans-serif !important; font-display: swap;`,
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

  // Update font family when it changes
  useEffect(() => {
    if (editor && editor.view && editor.view.dom) {
      const editorElement = editor.view.dom as HTMLElement;
      editorElement.style.fontFamily = `"${fontFamily}", sans-serif`;
      editorElement.style.fontDisplay = 'swap';
      
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
      className="bg-white dark:bg-[#1e1e1e] transition-colors duration-200 rounded-lg overflow-hidden"
      style={{ fontFamily }}
    >
      <EditorContent 
        editor={editor} 
        style={{ fontFamily }}
      />
    </div>
  );
};

export default TipTapEditor; 