import { Note } from '@/types/note';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

// Helper function to safely convert dates
const ensureDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

// Helper function to safely format dates
const formatDate = (date: Date | string): string => {
  return ensureDate(date).toLocaleDateString();
};

// Convert HTML content to plain text with structure
const htmlToPlainText = (html: string): string => {
  return html
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
    .replace(/<blockquote[^>]*>/gi, '> ')
    .replace(/<\/blockquote>/gi, '\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '$1')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '\n$1\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

// Helper function to wrap text properly with fixed line width
const wrapText = (pdf: jsPDF, text: string, maxWidth: number, fontSize: number = 10): string[] => {
  pdf.setFontSize(fontSize);
  
  // Handle empty or whitespace-only text
  if (!text || !text.trim()) {
    return [''];
  }
  
  // Split by existing line breaks first
  const paragraphs = text.split('\n');
  const wrappedLines: string[] = [];
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      wrappedLines.push(''); // Preserve empty lines
      continue;
    }
    
    // Use jsPDF's splitTextToSize for proper text wrapping
    const lines = pdf.splitTextToSize(paragraph, maxWidth);
    wrappedLines.push(...lines);
  }
  
  return wrappedLines;
};

// Helper function to wrap code with fixed width and preserve formatting
const wrapCodeText = (pdf: jsPDF, code: string, maxWidth: number): string[] => {
  pdf.setFontSize(9);
  pdf.setFont('courier', 'normal');
  
  const lines = code.split('\n');
  const wrappedLines: string[] = [];
  
  for (const line of lines) {
    if (!line) {
      wrappedLines.push(''); // Preserve empty lines in code
      continue;
    }
    
    // For code, we want to preserve indentation and structure
    // Check if line fits within maxWidth
    const lineWidth = pdf.getTextWidth(line);
    const availableWidth = maxWidth - 8; // Account for code block padding
    
    if (lineWidth <= availableWidth) {
      wrappedLines.push(line);
    } else {
      // Split long code lines at reasonable points (spaces, operators, etc.)
      const words = line.split(/(\s+|[{}();,.])/);
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + word;
        const testWidth = pdf.getTextWidth(testLine);
        
        if (testWidth <= availableWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine);
            currentLine = word;
          } else {
            // Single word/token is too long, force break
            wrappedLines.push(word);
            currentLine = '';
          }
        }
      }
      
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    }
  }
  
  return wrappedLines;
};

// Parse content and structure it for PDF
const parseContentForPDF = (content: string) => {
  const elements = [];
  const lines = content.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (!line) {
      i++;
      continue;
    }
    
    // Headers
    if (line.startsWith('# ')) {
      elements.push({ type: 'h1', text: line.substring(2) });
    } else if (line.startsWith('## ')) {
      elements.push({ type: 'h2', text: line.substring(3) });
    } else if (line.startsWith('### ')) {
      elements.push({ type: 'h3', text: line.substring(4) });
    }
    // Code blocks
    else if (line.startsWith('```')) {
      const language = line.substring(3).trim();
      const codeLines = [];
      i++;
      
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      elements.push({ 
        type: 'code', 
        text: codeLines.join('\n'), 
        language: language || 'Code'
      });
    }
    // Lists
    else if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      elements.push({ type: 'list', text: line.substring(2) });
    }
    // Todos (checkboxes)
    else if (line.includes('☐') || line.includes('☑') || line.includes('✓')) {
      const isChecked = line.includes('☑') || line.includes('✓');
      const text = line.replace(/[☐☑✓]/g, '').trim();
      elements.push({ type: 'todo', text: text, checked: isChecked });
    }
    // Blockquotes  
    else if (line.startsWith('> ')) {
      elements.push({ type: 'quote', text: line.substring(2) });
    }
    // Regular paragraphs
    else {
      elements.push({ type: 'paragraph', text: line });
    }
    
    i++;
  }
  
  return elements;
};

// Export single note as PDF with lightweight text-based approach
export const exportNoteAsPDF = async (note: Note, currentTitle?: string, currentContent?: string): Promise<void> => {
  try {
    const title = currentTitle || note.title;
    const content = currentContent || note.content;
    
    // Parse and calculate content height first
    const plainContent = htmlToPlainText(content);
    const elements = parseContentForPDF(plainContent);
    
    // Calculate total height needed
    const margin = 20;
    const pageWidth = 210; // A4 width in mm
    const maxWidth = pageWidth - (margin * 2);
    let totalHeight = margin; // Start with top margin
    
    // Create temporary PDF to measure text heights
    const tempPdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate header height
    tempPdf.setFontSize(20);
    tempPdf.setFont('helvetica', 'bold');
    const titleWrapped = wrapText(tempPdf, title, maxWidth, 20);
    totalHeight += titleWrapped.length * 8; // Title height
    
    totalHeight += 5; // Space after title
    
    // Metadata
    const metaText = `Status: ${note.status} | Workspace: ${note.workspace} | Created: ${formatDate(note.createdAt)} | Updated: ${formatDate(note.updatedAt)}`;
    const metaWrapped = wrapText(tempPdf, metaText, maxWidth, 10);
    totalHeight += metaWrapped.length * 4;
    
    // Tags
    if (note.tags.length > 0) {
      const tagsText = `Tags: ${note.tags.join(', ')}`;
      const tagsWrapped = wrapText(tempPdf, tagsText, maxWidth, 10);
      totalHeight += tagsWrapped.length * 4 + 3;
    }
    
    totalHeight += 15; // Separator line and space
    
    // Calculate content height with proper wrapping
    for (const element of elements) {
      switch (element.type) {
        case 'h1':
          totalHeight += 5; // Top spacing
          const h1Wrapped = wrapText(tempPdf, element.text, maxWidth, 16);
          totalHeight += h1Wrapped.length * 7;
          break;
          
        case 'h2':
          totalHeight += 4;
          const h2Wrapped = wrapText(tempPdf, element.text, maxWidth, 14);
          totalHeight += h2Wrapped.length * 6;
          break;
          
        case 'h3':
          totalHeight += 3;
          const h3Wrapped = wrapText(tempPdf, element.text, maxWidth, 12);
          totalHeight += h3Wrapped.length * 5;
          break;
          
        case 'code':
          totalHeight += 3; // Top spacing
          if (element.language && element.language !== 'Code') {
            totalHeight += 4; // Language label
          }
          const codeWrapped = wrapCodeText(tempPdf, element.text, maxWidth);
          totalHeight += codeWrapped.length * 4 + 6; // Code lines + padding
          totalHeight += 3; // Bottom spacing
          break;
          
        case 'todo':
          const todoWrapped = wrapText(tempPdf, element.text, maxWidth - 15, 10); // Account for checkbox
          totalHeight += todoWrapped.length * 5;
          break;
          
        case 'list':
          const listWrapped = wrapText(tempPdf, element.text, maxWidth - 10, 10); // Account for bullet
          totalHeight += listWrapped.length * 4;
          break;
          
        case 'quote':
          const quoteWrapped = wrapText(tempPdf, element.text, maxWidth - 15, 10); // Account for quote line
          totalHeight += quoteWrapped.length * 4 + 2;
          break;
          
        case 'paragraph':
        default:
          const paraWrapped = wrapText(tempPdf, element.text, maxWidth, 10);
          totalHeight += paraWrapped.length * 4 + 2;
          break;
      }
    }
    
    totalHeight += 30; // Footer space
    
    // Set minimum height (like screen height - around 200mm)
    const minHeight = 200;
    const finalHeight = Math.max(minHeight, totalHeight);
    
    // Create PDF with dynamic height
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageWidth, finalHeight] // Custom page size [width, height]
    });

    // Now render the content with proper line wrapping
    let yPosition = margin;

    // Add header with wrapping
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    const titleLines = wrapText(pdf, title, maxWidth, 20);
    for (const line of titleLines) {
      pdf.text(line, margin, yPosition);
      yPosition += 8;
    }

    // Add metadata line with wrapping
    yPosition += 5;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const metaTextActual = `Status: ${note.status} | Workspace: ${note.workspace} | Created: ${formatDate(note.createdAt)} | Updated: ${formatDate(note.updatedAt)}`;
    const metaLines = wrapText(pdf, metaTextActual, maxWidth, 10);
    for (const line of metaLines) {
      pdf.text(line, margin, yPosition);
      yPosition += 4;
    }

    // Add tags if any with wrapping
    if (note.tags.length > 0) {
      yPosition += 3;
      const tagsText = `Tags: ${note.tags.join(', ')}`;
      const tagsLines = wrapText(pdf, tagsText, maxWidth, 10);
      for (const line of tagsLines) {
        pdf.text(line, margin, yPosition);
        yPosition += 4;
      }
    }

    // Add separator line
    yPosition += 5;
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Add content with proper line wrapping
    for (const element of elements) {
      switch (element.type) {
        case 'h1':
          yPosition += 5;
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          const h1Lines = wrapText(pdf, element.text, maxWidth, 16);
          for (const line of h1Lines) {
            pdf.text(line, margin, yPosition);
            yPosition += 7;
          }
          break;

        case 'h2':
          yPosition += 4;
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          const h2Lines = wrapText(pdf, element.text, maxWidth, 14);
          for (const line of h2Lines) {
            pdf.text(line, margin, yPosition);
            yPosition += 6;
          }
          break;

        case 'h3':
          yPosition += 3;
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          const h3Lines = wrapText(pdf, element.text, maxWidth, 12);
          for (const line of h3Lines) {
            pdf.text(line, margin, yPosition);
            yPosition += 5;
          }
          break;

        case 'code':
          yPosition += 3;
          // Add language label if specified
          if (element.language && element.language !== 'Code') {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'bold');
            pdf.text(element.language, margin, yPosition);
            yPosition += 4;
          }
          
          // Add code block with proper wrapping
          const codeLines = wrapCodeText(pdf, element.text, maxWidth);
          const codeHeight = codeLines.length * 4 + 6;
          pdf.setFillColor(245, 245, 245); // Light gray
          pdf.rect(margin - 2, yPosition - 2, maxWidth + 4, codeHeight, 'F');
          
          // Add code text with wrapping
          pdf.setFontSize(9);
          pdf.setFont('courier', 'normal');
          for (const codeLine of codeLines) {
            pdf.text(codeLine, margin + 2, yPosition + 3);
            yPosition += 4;
          }
          yPosition += 3;
          break;

        case 'todo':
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const checkbox = element.checked ? '☑' : '☐';
          const todoLines = wrapText(pdf, element.text, maxWidth - 15, 10);
          for (let i = 0; i < todoLines.length; i++) {
            const prefix = i === 0 ? `${checkbox} ` : '   '; // Indent continuation lines
            pdf.text(prefix + todoLines[i], margin, yPosition);
            yPosition += 5;
          }
          break;

        case 'list':
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const listLines = wrapText(pdf, element.text, maxWidth - 10, 10);
          for (let i = 0; i < listLines.length; i++) {
            const prefix = i === 0 ? '• ' : '  '; // Indent continuation lines
            pdf.text(prefix + listLines[i], margin + 3, yPosition);
            yPosition += 4;
          }
          break;

        case 'quote':
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'italic');
          const quoteLines = wrapText(pdf, element.text, maxWidth - 15, 10);
          // Add quote line for the entire quote block
          pdf.setLineWidth(2);
          pdf.setDrawColor(180, 180, 180);
          const quoteStartY = yPosition - 2;
          const quoteEndY = yPosition + (quoteLines.length * 4);
          pdf.line(margin, quoteStartY, margin, quoteEndY);
          
          for (const line of quoteLines) {
            pdf.text(line, margin + 5, yPosition);
            yPosition += 4;
          }
          yPosition += 2;
          break;

        case 'paragraph':
        default:
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const paraLines = wrapText(pdf, element.text, maxWidth, 10);
          for (const line of paraLines) {
            pdf.text(line, margin, yPosition);
            yPosition += 4;
          }
          yPosition += 2;
          break;
      }
    }

    // Add footer at the bottom
    const footerY = finalHeight - 15;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated from eNote • ${new Date().toLocaleDateString()}`, margin, footerY);

    // Download PDF
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('PDF export error:', error);
    alert('Failed to export PDF. Please try again.');
  }
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
  const plainTextContent = htmlToPlainText(content);

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

      // Add content
      content += htmlToMarkdown(note.content);

      // Add to zip
      const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      zip.file(fileName, content);
    });

    // Generate and download zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_export_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Markdown export error:', error);
    alert('Failed to export notes as Markdown. Please try again.');
  }
}; 