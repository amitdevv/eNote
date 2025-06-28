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
        codeBlock: false, // We use CodeBlockLowlight instead
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'prose-ul list-disc',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'prose-ol list-decimal',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'prose-li',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'text-wrap break-words',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline cursor-pointer break-all',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 rounded-md p-4 font-mono text-sm border border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-pre-wrap break-words',
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
          class: 'task-item break-words',
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
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
          'dark:prose-invert',
          'prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
          'prose-p:text-gray-700 dark:prose-p:text-gray-300',
          'prose-a:text-blue-600 dark:prose-a:text-blue-400',
          'prose-strong:text-gray-900 dark:prose-strong:text-gray-100',
          'prose-code:text-pink-600 dark:prose-code:text-pink-400',
          'prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800',
          'prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600',
          'prose-hr:border-gray-300 dark:prose-hr:border-gray-600',
          'prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ul:list-disc prose-ul:pl-6',
          'prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-ol:list-decimal prose-ol:pl-6',
          'prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:list-item',
          'min-h-[400px] w-full max-w-full box-border break-words text-wrap'
        ),
        style: `font-family: "${fontFamily}", sans-serif !important; font-display: swap; max-width: 100% !important; width: 100% !important; overflow-x: hidden !important; word-wrap: break-word !important; overflow-wrap: break-word !important;`,
        'data-placeholder': placeholder,
        spellcheck: 'false',
      },
      handlePaste: () => {
        // Handle pasted content to ensure it respects word wrapping
        return false; // Let TipTap handle the paste normally
      },
      handleTextInput: () => {
        // Allow normal text input behavior
        return false;
      },
      transformPastedText: (text) => {
        // Ensure pasted text doesn't break word wrapping
        return text;
      },
      transformPastedHTML: (html) => {
        // Clean up pasted HTML to remove any conflicting styles
        return html.replace(/style="[^"]*"/g, '').replace(/white-space:\s*[^;]*;?/gi, '');
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