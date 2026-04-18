import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, {
  type SuggestionProps,
  type SuggestionKeyDownProps,
} from '@tiptap/suggestion';
import type { Editor, Range } from '@tiptap/core';
import type { IconSvgElement } from '@hugeicons/react';
import {
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  CheckmarkSquare01Icon,
  QuoteUpIcon,
  SourceCodeCircleIcon,
  MinusSignIcon,
} from '@/shared/lib/icons';
import { SlashMenu, type SlashMenuHandle } from './components/SlashMenu';

export type SlashCommandItem = {
  title: string;
  description: string;
  icon: IconSvgElement;
  keywords: string[];
  command: (args: { editor: Editor; range: Range }) => void;
};

export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: Heading01Icon,
    keywords: ['h1', 'heading', 'title'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading02Icon,
    keywords: ['h2', 'heading', 'subtitle'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: Heading03Icon,
    keywords: ['h3', 'heading'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run(),
  },
  {
    title: 'Bullet list',
    description: 'Simple bulleted list',
    icon: LeftToRightListBulletIcon,
    keywords: ['bullet', 'list', 'ul'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Numbered list',
    description: 'Ordered list with numbers',
    icon: LeftToRightListNumberIcon,
    keywords: ['numbered', 'list', 'ol', 'ordered'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'To-do list',
    description: 'Checkable task list',
    icon: CheckmarkSquare01Icon,
    keywords: ['todo', 'task', 'checklist', 'checkbox'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: 'Quote',
    description: 'Block quote',
    icon: QuoteUpIcon,
    keywords: ['quote', 'blockquote'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: 'Code block',
    description: 'Syntax-highlighted code',
    icon: SourceCodeCircleIcon,
    keywords: ['code', 'codeblock', 'snippet'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    title: 'Divider',
    description: 'Horizontal rule',
    icon: MinusSignIcon,
    keywords: ['divider', 'hr', 'rule', 'separator'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

function filterItems(query: string): SlashCommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter((item) => {
    if (item.title.toLowerCase().includes(q)) return true;
    return item.keywords.some((k) => k.includes(q));
  });
}

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        allowSpaces: false,
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: SlashCommandItem;
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => filterItems(query),
        render: () => {
          let component: ReactRenderer<SlashMenuHandle> | null = null;

          return {
            onStart: (props: SuggestionProps<SlashCommandItem>) => {
              component = new ReactRenderer(SlashMenu, {
                props,
                editor: props.editor,
              });
              const el = component.element as HTMLElement | null;
              if (el) positionElement(el, props.clientRect);
            },
            onUpdate(props: SuggestionProps<SlashCommandItem>) {
              component?.updateProps(props);
              const el = component?.element as HTMLElement | null;
              if (el) positionElement(el, props.clientRect);
            },
            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === 'Escape') {
                component?.destroy();
                component = null;
                return true;
              }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit() {
              component?.destroy();
              component = null;
            },
          };
        },
      }),
    ];
  },
});

function positionElement(
  el: HTMLElement,
  getRect: (() => DOMRect | null) | null | undefined,
) {
  if (!getRect) return;
  const rect = getRect();
  if (!rect) return;
  // Parent is document.body (TipTap's ReactRenderer default). Use fixed positioning
  // with viewport coordinates. Prefer below the caret; flip above if no room.
  el.style.position = 'fixed';
  el.style.zIndex = '60';

  const menuHeight = el.offsetHeight || 320;
  const menuWidth = el.offsetWidth || 280;
  const viewportH = window.innerHeight;
  const viewportW = window.innerWidth;

  let top = rect.bottom + 6;
  if (top + menuHeight > viewportH - 8) {
    top = Math.max(8, rect.top - menuHeight - 6);
  }
  let left = rect.left;
  if (left + menuWidth > viewportW - 8) {
    left = Math.max(8, viewportW - menuWidth - 8);
  }

  el.style.top = `${top}px`;
  el.style.left = `${left}px`;
}
