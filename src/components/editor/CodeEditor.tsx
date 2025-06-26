import React, { useRef, useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-react';

// Custom dark theme for better visibility
const customDarkTheme = {
  ...oneDark,
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    color: '#d4d4d4',
    background: 'transparent',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: '"JetBrains Mono", "Fira Code", Consolas, Monaco, "Courier New", monospace',
  },
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    color: '#d4d4d4',
    background: 'transparent',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: '"JetBrains Mono", "Fira Code", Consolas, Monaco, "Courier New", monospace',
    padding: '0',
    margin: '0',
  },
  'token.comment': { color: '#6a9955', fontStyle: 'italic' },
  'token.prolog': { color: '#6a9955' },
  'token.doctype': { color: '#6a9955' },
  'token.cdata': { color: '#6a9955' },
  'token.punctuation': { color: '#d4d4d4' },
  'token.property': { color: '#9cdcfe' },
  'token.tag': { color: '#569cd6' },
  'token.constant': { color: '#9cdcfe' },
  'token.symbol': { color: '#9cdcfe' },
  'token.deleted': { color: '#f44747' },
  'token.boolean': { color: '#569cd6' },
  'token.number': { color: '#b5cea8' },
  'token.selector': { color: '#d7ba7d' },
  'token.attr-name': { color: '#9cdcfe' },
  'token.string': { color: '#ce9178' },
  'token.char': { color: '#ce9178' },
  'token.builtin': { color: '#dcdcaa' },
  'token.inserted': { color: '#6a9955' },
  'token.operator': { color: '#d4d4d4' },
  'token.entity': { color: '#569cd6' },
  'token.url': { color: '#569cd6' },
  'token.variable': { color: '#9cdcfe' },
  'token.atrule': { color: '#ce9178' },
  'token.attr-value': { color: '#ce9178' },
  'token.function': { color: '#dcdcaa' },
  'token.class-name': { color: '#4ec9b0' },
  'token.keyword': { color: '#569cd6', fontWeight: 'normal' },
  'token.regex': { color: '#d16969' },
  'token.important': { color: '#569cd6', fontWeight: 'bold' },
  'token.bold': { fontWeight: 'bold' },
  'token.italic': { fontStyle: 'italic' },
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
  fontFamily?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  placeholder,
  className,
  fontFamily = 'JetBrains Mono'
}) => {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleScroll = () => {
    if (textareaRef.current && highlighterRef.current) {
      highlighterRef.current.scrollTop = textareaRef.current.scrollTop;
      highlighterRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        target.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  // Adjust textarea height to match content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(400, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  const copyToClipboard = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const customStyle = {
    margin: 0,
    padding: '1rem',
    background: 'transparent',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: fontFamily || '"JetBrains Mono", "Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
    minHeight: '400px',
    color: theme === 'dark' ? '#d4d4d4' : '#24292f',
  };

  return (
    <div className={cn(
      "relative rounded-lg border overflow-hidden transition-colors duration-200",
      "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e]",
      "shadow-sm",
      isFullscreen && "fixed inset-4 z-50 h-auto",
      className
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-[#333333] border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {language.toUpperCase()}
          </span>
          {value && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {value.split('\n').length} lines
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 w-7 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={!value}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-7 w-7 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Syntax Highlighter (Background) */}
        <div 
          ref={highlighterRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <SyntaxHighlighter
            language={language}
            style={theme === 'dark' ? customDarkTheme : oneLight}
            customStyle={customStyle}
            showLineNumbers={true}
            lineNumberStyle={{
              color: theme === 'dark' ? '#6e6e6e' : '#999',
              backgroundColor: 'transparent',
              paddingRight: '1rem',
              minWidth: '2.5rem',
              textAlign: 'right',
              userSelect: 'none',
              fontSize: '12px',
            }}
            wrapLines={false}
          >
            {value || ' '}
          </SyntaxHighlighter>
        </div>

        {/* Textarea (Foreground - Transparent) */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "absolute inset-0 w-full h-full p-4 text-sm font-mono resize-none outline-none z-10",
            "bg-transparent text-gray-800 dark:text-gray-200 caret-gray-800 dark:caret-white",
            "selection:bg-blue-200 dark:selection:bg-blue-800",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            // Make text visible when syntax highlighter is not working
            value ? "text-transparent" : "",
            className
          )}
          style={{ 
            fontFamily: fontFamily === 'JetBrains Mono' ? '"JetBrains Mono", Consolas, Monaco, "Courier New", monospace' : fontFamily,
            lineHeight: '1.5',
            fontSize: '14px'
          }}
          spellCheck={false}
        />
      </div>


    </div>
  );
}; 