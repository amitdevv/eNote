import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = "" 
}) => {
  const renderMarkdown = (text: string) => {
    // First, split content into sections by double line breaks for better paragraph handling
    const sections = text.split(/\n\s*\n/);
    const elements: React.ReactNode[] = [];

    sections.forEach((section, sectionIndex) => {
      if (!section.trim()) return;

      const lines = section.split('\n');
      let currentList: string[] = [];
      let listType: 'ul' | 'ol' | null = null;

      const flushList = () => {
        if (currentList.length > 0) {
          const ListComponent = listType === 'ol' ? 'ol' : 'ul';
          elements.push(
            <ListComponent key={`list-${sectionIndex}-${elements.length}`} className={listType === 'ol' ? "list-decimal list-inside space-y-1 ml-4 mb-4" : "list-disc list-inside space-y-1 ml-4 mb-4"}>
              {currentList.map((item, index) => (
                <li key={index} className="text-sm leading-relaxed">
                  {renderInlineMarkdown(item)}
                </li>
              ))}
            </ListComponent>
          );
          currentList = [];
          listType = null;
        }
      };

      lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Handle headings
        if (trimmedLine.match(/^#{1,6}\s/)) {
          flushList();
          const level = trimmedLine.match(/^(#{1,6})/)?.[1]?.length || 1;
          const text = trimmedLine.replace(/^#{1,6}\s*/, '');
          
          const HeadingComponent = `h${level}` as keyof JSX.IntrinsicElements;
          const className = level === 1 
            ? "text-lg font-bold text-gray-900 dark:text-gray-100 mt-4 mb-3"
            : level === 2
            ? "text-base font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2" 
            : "text-sm font-semibold text-gray-900 dark:text-gray-100 mt-3 mb-2";
            
          elements.push(
            React.createElement(HeadingComponent, {
              key: `heading-${sectionIndex}-${lineIndex}`,
              className
            }, renderInlineMarkdown(text))
          );
        }
        // Handle unordered lists  
        else if (trimmedLine.match(/^[-*+]\s/)) {
          if (listType !== 'ul') {
            flushList();
            listType = 'ul';
          }
          currentList.push(trimmedLine.replace(/^[-*+]\s/, ''));
        }
        // Handle ordered lists
        else if (trimmedLine.match(/^\d+\.\s/)) {
          if (listType !== 'ol') {
            flushList();
            listType = 'ol';
          }
          currentList.push(trimmedLine.replace(/^\d+\.\s/, ''));
        }
        // Handle code blocks
        else if (trimmedLine.startsWith('```')) {
          flushList();
          elements.push(
            <div key={`code-${sectionIndex}-${lineIndex}`} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4 font-mono text-sm overflow-x-auto">
              <code className="text-gray-800 dark:text-gray-200">
                {trimmedLine.substring(3)}
              </code>
            </div>
          );
        }
        // Handle horizontal rules
        else if (trimmedLine.match(/^(-{3,}|\*{3,})$/)) {
          flushList();
          elements.push(
            <hr key={`hr-${sectionIndex}-${lineIndex}`} className="border-gray-300 dark:border-gray-600 my-4" />
          );
        }
        // Handle regular paragraphs
        else {
          flushList();
          elements.push(
            <p key={`p-${sectionIndex}-${lineIndex}`} className="text-sm leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
              {renderInlineMarkdown(trimmedLine)}
            </p>
          );
        }
      });

      // Flush any remaining list items
      flushList();
      
      // Add spacing between sections
      if (sectionIndex < sections.length - 1) {
        elements.push(<div key={`spacer-${sectionIndex}`} className="mb-4" />);
      }
    });

    return elements;
  };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    if (!text) return text;

    // Split text by various markdown patterns while preserving the matches
    const parts: React.ReactNode[] = [];
    let remainingText = text;
    let keyCounter = 0;

    // Process in order: bold, italic, code
    // This regex captures bold (**text**), italic (*text*), and code (`text`)
    const markdownRegex = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|`[^`\n]+?`)/g;
    const segments = remainingText.split(markdownRegex);

    segments.forEach((segment) => {
      if (!segment) return;

      // Check if this segment is a markdown pattern
      if (segment.startsWith('**') && segment.endsWith('**')) {
        // Bold text
        const content = segment.slice(2, -2);
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-semibold text-gray-900 dark:text-gray-100">
            {content}
          </strong>
        );
      } else if (segment.startsWith('*') && segment.endsWith('*') && !segment.startsWith('**')) {
        // Italic text (but not bold)
        const content = segment.slice(1, -1);
        parts.push(
          <em key={`italic-${keyCounter++}`} className="italic">
            {content}
          </em>
        );
      } else if (segment.startsWith('`') && segment.endsWith('`')) {
        // Inline code
        const content = segment.slice(1, -1);
        parts.push(
          <code key={`code-${keyCounter++}`} className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
            {content}
          </code>
        );
      } else {
        // Regular text
        parts.push(segment);
      }
    });

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={className}>
      {renderMarkdown(content)}
    </div>
  );
}; 