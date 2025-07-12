import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Type,
  FileText,
  Video,
  Globe,
  Table
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { YouTubeDialog, EmbedDialog } from './MediaDialogs';

interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ElementType;
  command: (editor: Editor) => void;
  textCommand?: (editor: Editor) => void; // For plain text editors
  keywords: string[];
}

interface SlashCommandProps {
  editor: Editor;
  range: any;
}

interface SlashCommandRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

const SlashCommand = forwardRef<SlashCommandRef, SlashCommandProps>(
  ({ editor, range }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [query, setQuery] = useState('');
    const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
    const [embedDialogOpen, setEmbedDialogOpen] = useState(false);

    // Check if editor supports rich formatting by checking available commands
    const isRichTextEditor = (() => {
      try {
        return editor.can().toggleBold?.() !== undefined || 
               editor.can().toggleItalic?.() !== undefined ||
               editor.can().setHeading?.({ level: 1 }) !== undefined;
      } catch {
        return false;
      }
    })();

    const items: SlashCommandItem[] = [
      {
        title: 'Text',
        description: 'Just start writing with plain text.',
        icon: Type,
        keywords: ['text', 'paragraph', 'p'],
        command: (editor) => {
          editor.chain().focus().deleteRange(range).setParagraph().run();
        },
        textCommand: (editor) => {
          editor.chain().focus().deleteRange(range).insertContent('\n').run();
        },
      },
      {
        title: 'Heading 1',
        description: 'Big section heading.',
        icon: Heading1,
        keywords: ['heading', 'h1', 'title'],
        command: (editor) => {
          editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
        },
        textCommand: (editor) => {
          editor.chain().focus().deleteRange(range).insertContent('# ').run();
        },
      },
      {
        title: 'Heading 2',
        description: 'Medium section heading.',
        icon: Heading2,
        keywords: ['heading', 'h2', 'subtitle'],
        command: (editor) => {
          editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
        },
        textCommand: (editor) => {
          editor.chain().focus().deleteRange(range).insertContent('## ').run();
        },
      },
      {
        title: 'Heading 3',
        description: 'Small section heading.',
        icon: Heading3,
        keywords: ['heading', 'h3', 'subheading'],
        command: (editor) => {
          editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
        },
        textCommand: (editor) => {
          editor.chain().focus().deleteRange(range).insertContent('### ').run();
        },
      },
      {
        title: 'Bullet List',
        description: 'Create a simple bullet list.',
        icon: List,
        keywords: ['list', 'bullet', 'ul', 'unordered'],
        command: (editor) => {
          editor.chain().focus().deleteRange(range).run();
          
          // If we're in a list, exit it first
          if (editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')) {
            editor.chain().liftListItem('listItem').run();
          }
          
          // Create new bullet list
          editor.chain().toggleBulletList().run();
        },
        textCommand: (editor) => {
          editor.chain().focus().deleteRange(range).insertContent('• ').run();
        },
      },
      {
        title: 'Numbered List',
        description: 'Create a list with numbering.',
        icon: ListOrdered,
        keywords: ['list', 'numbered', 'ol', 'ordered'],
        command: (editor) => {
          editor.chain().focus().deleteRange(range).run();
          
          // If we're in a list, exit it first
          if (editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')) {
            editor.chain().liftListItem('listItem').run();
          }
          
          // Create new numbered list
          editor.chain().toggleOrderedList().run();
        },
        textCommand: (editor) => {
          editor.chain().focus().deleteRange(range).insertContent('1. ').run();
        },
      },
      {
        title: 'To-do List',
        description: 'Track tasks with a to-do list.',
        icon: CheckSquare,
        keywords: ['todo', 'task', 'checklist', 'check'],
        command: (editor) => {
          try {
            if (editor.can().toggleTaskList?.()) {
              editor.chain().focus().deleteRange(range).run();
              
              // If we're in a list, exit it first
              if (editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')) {
                editor.chain().liftListItem('listItem').run();
              }
              
              // Create new task list
              editor.chain().toggleTaskList().run();
            } else {
              editor.chain().focus().deleteRange(range).insertContent('☐ ').run();
            }
          } catch {
            editor.chain().focus().deleteRange(range).insertContent('☐ ').run();
          }
        },
        textCommand: (editor) => {
          editor.chain().focus().deleteRange(range).insertContent('☐ ').run();
        },
      },
      {
        title: 'Quote',
        description: 'Capture a quote.',
        icon: Quote,
        keywords: ['quote', 'blockquote', 'citation'],
        command: (editor) => {
          try {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
          } catch {
            editor.chain().focus().deleteRange(range).insertContent('> ').run();
          }
        },
        textCommand: (editor) => {
          editor.chain().focus().deleteRange(range).insertContent('> ').run();
        },
      },
      {
        title: 'Code Block',
        description: 'Capture a code snippet.',
        icon: FileText,
        keywords: ['code', 'codeblock', 'snippet', 'terminal'],
        command: (editor) => {
          try {
            if (editor.can().toggleCodeBlock?.()) {
              editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
            } else {
              editor.chain().focus().deleteRange(range).insertContent('```\n\n```').run();
            }
          } catch {
            editor.chain().focus().deleteRange(range).insertContent('```\n\n```').run();
          }
        },
        textCommand: (editor) => {
          editor.chain().focus().deleteRange(range).insertContent('```\n\n```').run();
        },
      },
      {
        title: 'YouTube Video',
        description: 'Embed a YouTube video.',
        icon: Video,
        keywords: ['youtube', 'video', 'embed', 'media'],
        command: (_editor) => {
          setYoutubeDialogOpen(true);
        },
        textCommand: (_editor) => {
          setYoutubeDialogOpen(true);
        },
      },
      {
        title: 'Embed',
        description: 'Embed content from any website.',
        icon: Globe,
        keywords: ['embed', 'iframe', 'vimeo', 'codepen', 'figma', 'twitter'],
        command: (_editor) => {
          setEmbedDialogOpen(true);
        },
        textCommand: (_editor) => {
          setEmbedDialogOpen(true);
        },
      },
      {
        title: 'Table',
        description: 'Create a table to organize data.',
        icon: Table,
        keywords: ['table', 'grid', 'data', 'rows', 'columns'],
        command: (editor) => {
          try {
            editor.chain()
              .focus()
              .deleteRange(range)
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run();
          } catch {
            // Fallback: insert basic table markdown
            editor.chain()
              .focus()
              .deleteRange(range)
              .insertContent(`
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`)
              .run();
          }
        },
        textCommand: (editor) => {
          editor.chain()
            .focus()
            .deleteRange(range)
            .insertContent(`
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`)
            .run();
        },
      },

      {
        title: 'Divider',
        description: 'Visually divide blocks.',
        icon: Minus,
        keywords: ['divider', 'separator', 'hr', 'horizontal'],
        command: (editor) => {
          try {
            if (editor.can().setHorizontalRule?.()) {
              editor.chain().focus().deleteRange(range).setHorizontalRule().run();
            } else {
              editor.chain().focus().deleteRange(range).insertContent('\n---\n').run();
            }
          } catch {
            editor.chain().focus().deleteRange(range).insertContent('\n---\n').run();
          }
        },
        textCommand: (editor) => {
          editor.chain().focus().deleteRange(range).insertContent('\n---\n').run();
        },
      },
    ];

    const filteredItems = items.filter((item) => {
      if (!query) return true;
      
      const searchQuery = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        item.keywords.some(keyword => keyword.includes(searchQuery))
      );
    });

    const updateQuery = () => {
      const { from, to } = range;
      const text = editor.state.doc.textBetween(from, to, '');
      setQuery(text.slice(1)); // Remove the "/"
    };

    useEffect(() => {
      updateQuery();
    }, [range]);

    useEffect(() => {
      setSelectedIndex(0);
    }, [filteredItems.length]);

    const selectItem = (index: number) => {
      const item = filteredItems[index];
      if (item) {
        // Use textCommand for plain text editors, command for rich text editors
        if (!isRichTextEditor && item.textCommand) {
          item.textCommand(editor);
        } else {
          item.command(editor);
        }
      }
    };

    const handleYouTubeConfirm = (url: string) => {
      try {
        editor.chain().focus().deleteRange(range).setYoutubeVideo({ src: url }).run();
      } catch {
        // Fallback: insert as link
        editor.chain().focus().deleteRange(range).insertContent(`\n[YouTube Video](${url})\n`).run();
      }
    };

    const handleEmbedConfirm = (url: string, displayText?: string, _openInNewTab?: boolean) => {
      try {
        editor.chain().focus().deleteRange(range).setIframe({ src: url }).run();
      } catch {
        // Fallback: insert as link
        const linkText = displayText || url;
        editor.chain().focus().deleteRange(range).insertContent(`\n[${linkText}](${url})\n`).run();
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + filteredItems.length - 1) % filteredItems.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % filteredItems.length);
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    const getItemDescription = (item: SlashCommandItem) => {
      if (!isRichTextEditor && item.textCommand) {
        // Show appropriate description for plain text mode
        switch (item.title) {
          case 'Heading 1':
            return 'Insert "# " for a heading.';
          case 'Heading 2':
            return 'Insert "## " for a subheading.';
          case 'Heading 3':
            return 'Insert "### " for a smaller heading.';
          case 'Bullet List':
            return 'Insert "• " for a bullet point.';
          case 'Numbered List':
            return 'Insert "1. " for numbered list.';
          case 'To-do List':
            return 'Insert "☐ " for a checkbox.';
          case 'Quote':
            return 'Insert "> " for a quote.';
          case 'Code Block':
            return 'Insert code block markers.';
          case 'YouTube Video':
            return 'Paste YouTube URL to embed video.';
          case 'Embed':
            return 'Paste iframe URL to embed content.';
          case 'Table':
            return 'Insert a 3x3 table with headers.';
          case 'Divider':
            return 'Insert "---" as a divider.';
          default:
            return item.description;
        }
      }
      return item.description;
    };

    return (
      <>
        <div className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#333333] p-1 shadow-lg">
          <div className="mb-2 px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
            {isRichTextEditor ? 'Rich text blocks' : 'Text formatting'}
          </div>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <button
                key={index}
                className={cn(
                  'flex w-full items-center space-x-3 rounded-md px-2 py-2 text-left text-sm transition-colors',
                  index === selectedIndex
                    ? 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e1e1e]'
                )}
                onClick={() => selectItem(index)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1e1e1e]">
                  <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{getItemDescription(item)}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No results found
            </div>
          )}
        </div>

        {/* YouTube Dialog */}
        <YouTubeDialog
          open={youtubeDialogOpen}
          onOpenChange={setYoutubeDialogOpen}
          onConfirm={handleYouTubeConfirm}
        />

        {/* Embed Dialog */}
        <EmbedDialog
          open={embedDialogOpen}
          onOpenChange={setEmbedDialogOpen}
          onConfirm={handleEmbedConfirm}
        />
      </>
    );
  }
);

SlashCommand.displayName = 'SlashCommand';

export { SlashCommand };
export type { SlashCommandRef }; 