import React, { useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

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

  const customStyle = {
    margin: 0,
    padding: '1rem',
    background: 'transparent',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: fontFamily || '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
    minHeight: '400px',
  };

  return (
    <div className={cn(
      "relative rounded-lg border overflow-hidden transition-colors duration-200",
      "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
      className
    )}>
      <div className="relative">
        {/* Syntax Highlighter (Background) */}
        <div 
          ref={highlighterRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <SyntaxHighlighter
            language={language}
            style={theme === 'dark' ? oneDark : oneLight}
            customStyle={customStyle}
            showLineNumbers={false}
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
            "absolute inset-0 w-full h-full p-4 text-sm font-mono bg-transparent resize-none outline-none z-10",
            "text-transparent caret-gray-800 dark:caret-gray-200 selection:bg-blue-200 dark:selection:bg-blue-800",
            className
          )}
          style={{ 
            fontFamily: fontFamily === 'JetBrains Mono' ? 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace' : fontFamily,
            lineHeight: '1.5'
          }}
          spellCheck={false}
        />
      </div>

      {/* Language indicator */}
      <div className="absolute top-2 right-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs font-medium border border-gray-200 dark:border-gray-700">
        {language}
      </div>
    </div>
  );
}; 