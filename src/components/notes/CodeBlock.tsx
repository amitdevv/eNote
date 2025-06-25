import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Badge } from '@/components/ui/badge';

interface CodeBlockProps {
  code: string;
  language?: string;
  theme?: 'light' | 'dark';
  showLineNumbers?: boolean;
  maxLines?: number;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  theme = 'light',
  showLineNumbers = false,
  maxLines = 6,
  className
}) => {
  const displayCode = maxLines ? 
    code.split('\n').slice(0, maxLines).join('\n') : 
    code;
  
  const hasMoreLines = maxLines && code.split('\n').length > maxLines;

  const customStyle = {
    margin: 0,
    padding: '1rem',
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    fontSize: '13px',
    lineHeight: '1.4',
    borderRadius: '0.5rem',
    border: `1px solid ${theme === 'dark' ? '#374151' : '#e2e8f0'}`,
  };

  return (
    <div className={className}>
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={theme === 'dark' ? oneDark : oneLight}
          customStyle={customStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          lineProps={{ style: { wordBreak: 'break-word', whiteSpace: 'pre-wrap' } }}
        >
          {displayCode}
        </SyntaxHighlighter>
        
        {/* Language badge */}
        <span 
          className="absolute top-2 right-2 text-xs bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded text-gray-600 dark:text-gray-300"
        >
          {language}
        </span>
        
        {/* More lines indicator */}
        {hasMoreLines && (
          <div className="text-xs text-gray-500 text-center py-1 bg-gray-50 border-t">
            +{code.split('\n').length - maxLines} more lines
          </div>
        )}
      </div>
    </div>
  );
}; 