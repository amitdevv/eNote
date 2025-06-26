import { Note } from '@/types/note';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// Helper function to safely convert dates
const ensureDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

// Helper function to safely format dates
const formatDate = (date: Date | string): string => {
  return ensureDate(date).toLocaleDateString();
};

// Convert HTML content to Markdown (basic conversion)
const htmlToMarkdown = (html: string): string => {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '1. $1\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

const createCodeBlockHTML = (code: string, language: string = '') => {
  // Try to detect language if not specified
  let detectedLanguage = language;
  if (!language) {
    const result = hljs.highlightAuto(code);
    detectedLanguage = result.language || '';
  }

  // Apply syntax highlighting
  let highlightedCode;
  try {
    if (detectedLanguage && hljs.getLanguage(detectedLanguage)) {
      highlightedCode = hljs.highlight(code, { language: detectedLanguage }).value;
    } else {
      highlightedCode = hljs.highlightAuto(code).value;
    }
  } catch (error) {
    // Fallback to plain text if highlighting fails
    highlightedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Language display name mapping
  const languageNames = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'csharp': 'C#',
    'php': 'PHP',
    'ruby': 'Ruby',
    'go': 'Go',
    'rust': 'Rust',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'dart': 'Dart',
    'scala': 'Scala',
    'r': 'R',
    'matlab': 'MATLAB',
    'sql': 'SQL',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'less': 'Less',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML',
    'toml': 'TOML',
    'ini': 'INI',
    'bash': 'Bash',
    'shell': 'Shell',
    'powershell': 'PowerShell',
    'batch': 'Batch',
    'dockerfile': 'Dockerfile',
    'makefile': 'Makefile',
    'markdown': 'Markdown',
    'latex': 'LaTeX',
    'plaintext': 'Plain Text'
  };

  const displayName = languageNames[detectedLanguage.toLowerCase()] || 
                     (detectedLanguage ? detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1) : 'Code');

  return `
    <div style="
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      margin: 16px 0;
      overflow: hidden;
      font-family: 'Courier New', Consolas, Monaco, monospace;
    ">
      ${detectedLanguage ? `
        <div style="
          background-color: #e9ecef;
          padding: 8px 16px;
          border-bottom: 1px solid #dee2e6;
          font-size: 12px;
          font-weight: 600;
          color: #6c757d;
        ">
          ${displayName}
        </div>
      ` : ''}
      <div style="
        padding: 16px;
        background-color: #f8f9fa;
        overflow-x: auto;
        line-height: 1.5;
        font-size: 14px;
      ">
        <pre style="
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          color: #212529;
        "><code>${highlightedCode}</code></pre>
      </div>
    </div>
  `;
};

const processMarkdownForPDF = (content: string): string => {
  // Enhanced code block processing with syntax highlighting
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  let processedContent = content.replace(codeBlockRegex, (match, language, code) => {
    return createCodeBlockHTML(code.trim(), language || '');
  });

  // Process inline code with background
  processedContent = processedContent.replace(/`([^`]+)`/g, 
    '<code style="background-color: #f1f3f4; padding: 2px 4px; border-radius: 4px; font-family: \'Courier New\', monospace; color: #d73a49;">$1</code>'
  );

  // Process other markdown elements (enhanced styling)
  processedContent = processedContent
    // Headers with better spacing and colors
    .replace(/^### (.*$)/gm, '<h3 style="color: #2c3e50; font-size: 18px; font-weight: 600; margin: 20px 0 10px 0; border-bottom: 2px solid #3498db; padding-bottom: 5px;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="color: #2c3e50; font-size: 22px; font-weight: 700; margin: 24px 0 12px 0; border-bottom: 3px solid #3498db; padding-bottom: 8px;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="color: #2c3e50; font-size: 28px; font-weight: 800; margin: 30px 0 15px 0; border-bottom: 4px solid #3498db; padding-bottom: 10px;">$1</h1>')
    
    // Lists with better spacing
    .replace(/^\* (.*$)/gm, '<li style="margin: 5px 0; color: #2c3e50;">$1</li>')
    .replace(/^- (.*$)/gm, '<li style="margin: 5px 0; color: #2c3e50;">$1</li>')
    .replace(/^\+ (.*$)/gm, '<li style="margin: 5px 0; color: #2c3e50;">$1</li>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #2c3e50; font-weight: 600;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color: #34495e; font-style: italic;">$1</em>')
    
    // Links with better styling
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #3498db; text-decoration: underline;">$1</a>')
    
    // Blockquotes with background
    .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #3498db; background-color: #ecf0f1; margin: 16px 0; padding: 12px 16px; font-style: italic; color: #2c3e50;">$1</blockquote>')
    
    // Horizontal rules
    .replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid #bdc3c7; margin: 20px 0;">')
    
    // Line breaks
    .replace(/\n/g, '<br>');

  // Wrap list items in ul tags
  processedContent = processedContent.replace(/(<li.*?<\/li>)/g, (match) => {
    if (!match.includes('<ul>')) {
      return `<ul style="margin: 10px 0; padding-left: 20px;">${match}</ul>`;
    }
    return match;
  });

  return processedContent;
};

// Export single note as Markdown
export const exportNoteAsMarkdown = (note: Note): void => {
  let content = `# ${note.title}\n\n`;
  
  // Add metadata
  content += `**Created:** ${formatDate(note.createdAt)}\n`;
  content += `**Updated:** ${formatDate(note.updatedAt)}\n`;
  content += `**Status:** ${note.status}\n`;
  content += `**Workspace:** ${note.workspace}\n`;
  if (note.tags.length > 0) {
    content += `**Tags:** ${note.tags.join(', ')}\n`;
  }
  content += '\n---\n\n';

  // Add content - always markdown now
  content += htmlToMarkdown(note.content);

  // Download file
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Export single note as plain text
export const exportNoteAsText = (note: Note, currentTitle?: string, currentContent?: string): void => {
  // Use current content if provided, otherwise use saved content
  const title = currentTitle || note.title;
  const content = currentContent || note.content;
  
  // Convert HTML to plain text for clean export
  const plainTextContent = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<h[1-6][^>]*>/gi, '')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '$1')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<blockquote[^>]*>/gi, '')
    .replace(/<\/blockquote>/gi, '')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '$1')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  let textContent = `${title}\n\n`;
  textContent += plainTextContent;

  // Download file
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Export single note as PDF with current content
export const exportNoteAsPDF = async (note: Note, currentTitle?: string, currentContent?: string): Promise<void> => {
  try {
    const title = currentTitle || note.title;
    const content = currentContent || note.content;
    
    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px';
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';
    container.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    container.style.lineHeight = '1.6';
    container.style.color = '#2c3e50';

    // Process markdown content with enhanced styling and syntax highlighting
    const processedContent = processMarkdownForPDF(content);

    container.innerHTML = `
      <div style="
        max-width: 720px;
        margin: 0 auto;
        background: white;
        padding: 0;
      ">
        <!-- Header Section -->
        <div style="
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #3498db;
          padding-bottom: 20px;
        ">
          <h1 style="
            color: #2c3e50;
            font-size: 32px;
            font-weight: 800;
            margin: 0 0 10px 0;
            text-align: center;
          ">${title}</h1>
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            font-size: 14px;
            color: #7f8c8d;
            margin-top: 15px;
          ">
            <div>
              <strong>Status:</strong> 
              <span style="
                background-color: #3498db;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
              ">${note.status}</span>
            </div>
            <div>
              <strong>Workspace:</strong> 
              <span style="
                background-color: #95a5a6;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
              ">${note.workspace}</span>
            </div>
            <div><strong>Created:</strong> ${formatDate(note.createdAt)}</div>
            <div><strong>Updated:</strong> ${formatDate(note.updatedAt)}</div>
          </div>
          ${note.tags.length > 0 ? `
            <div style="margin-top: 15px;">
              <strong style="color: #7f8c8d;">Tags:</strong>
              ${note.tags.map(tag => `
                <span style="
                  background-color: #e74c3c;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: 600;
                  margin-left: 5px;
                ">${tag}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Content Section -->
        <div style="
          font-size: 16px;
          line-height: 1.8;
          color: #2c3e50;
          text-align: justify;
        ">
          ${processedContent}
        </div>

        <!-- Footer -->
        <div style="
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #ecf0f1;
          text-align: center;
          font-size: 12px;
          color: #95a5a6;
        ">
          <p>Generated from eNote • ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Convert to canvas with higher quality
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 800,
      windowWidth: 800,
      scrollX: 0,
      scrollY: 0
    });

    document.body.removeChild(container);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const heightLeft = imgHeight;

    let position = 0;
    const margin = 10;

    // Add image to PDF (first page)
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    let currentHeight = heightLeft;

    // Add additional pages if needed
    while (currentHeight >= pageHeight) {
      position = currentHeight - pageHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -position, imgWidth, imgHeight);
      currentHeight -= pageHeight;
    }

    // Download PDF
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('PDF export error:', error);
    alert('Failed to export PDF. Please try again.');
  }
};

// Export notes as JSON
export const exportNotesAsJSON = (notes: Note[]): void => {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    notes: notes.map(note => ({
      ...note,
      createdAt: ensureDate(note.createdAt).toISOString(),
      updatedAt: ensureDate(note.updatedAt).toISOString(),
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notes_export_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Export all notes as individual Markdown files in a ZIP
export const exportAllNotesAsMarkdown = async (notes: Note[]): Promise<void> => {
  try {
    // Dynamic import for JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    notes.forEach(note => {
      let content = `# ${note.title}\n\n`;
      
      // Add metadata
      content += `**Created:** ${formatDate(note.createdAt)}\n`;
      content += `**Updated:** ${formatDate(note.updatedAt)}\n`;
      content += `**Status:** ${note.status}\n`;
      content += `**Workspace:** ${note.workspace}\n`;
      if (note.tags.length > 0) {
        content += `**Tags:** ${note.tags.join(', ')}\n`;
      }
      content += '\n---\n\n';

      // Add content - always markdown now
      content += htmlToMarkdown(note.content);

      const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      zip.file(fileName, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_export_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    alert('Failed to export notes as ZIP. Please try again.');
  }
}; 