import { Note } from '@/types/note';
import jsPDF from 'jspdf';

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

// Export single note as PDF
export const exportNoteAsPDF = async (note: Note, currentTitle?: string, currentContent?: string): Promise<void> => {
  try {
    const title = currentTitle || note.title;
    const content = currentContent || note.content;
    const plainTextContent = htmlToPlainText(content);

    const pdf = new jsPDF();
    let yPosition = 20;

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 20, yPosition);
    yPosition += 15;

    // Add metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const metaText = `Created: ${formatDate(note.createdAt)} | Updated: ${formatDate(note.updatedAt)}`;
    if (note.tags.length > 0) {
      const tagsText = ` | Tags: ${note.tags.join(', ')}`;
      pdf.text(metaText + tagsText, 20, yPosition);
    } else {
      pdf.text(metaText, 20, yPosition);
    }
    yPosition += 15;

    // Add separator line
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    // Add content
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(plainTextContent, 170);
    
    for (const line of lines) {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 6;
    }

    // Download PDF
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('PDF export error:', error);
    alert('Failed to export PDF. Please try again.');
  }
};

// Convert HTML content to Markdown
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
export const exportNoteAsMarkdown = (note: Note) => {
  let content = `# ${note.title}\n\n`;
  
  // Add metadata
  content += `**Created:** ${formatDate(note.createdAt)}\n`;
  content += `**Updated:** ${formatDate(note.updatedAt)}\n`;
  if (note.tags.length > 0) {
    content += `**Tags:** ${note.tags.join(', ')}\n`;
  }
  content += `\n---\n\n`;
  
  // Add content
  content += htmlToMarkdown(note.content);
  
  // Create and download file
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
export const exportNoteAsText = (note: Note, currentTitle?: string, currentContent?: string) => {
  const title = currentTitle || note.title;
  const content = currentContent || note.content;
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
export const exportNotesAsJSON = (notes: Note[]) => {
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
export const exportAllNotesAsMarkdown = async (notes: Note[]) => {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    notes.forEach((note) => {
      let content = `# ${note.title}\n\n`;
      
      // Add metadata
      content += `**Created:** ${formatDate(note.createdAt)}\n`;
      content += `**Updated:** ${formatDate(note.updatedAt)}\n`;
      if (note.tags.length > 0) {
        content += `**Tags:** ${note.tags.join(', ')}\n`;
      }
      content += `\n---\n\n`;
      
      // Add content
      content += htmlToMarkdown(note.content);
      
      // Add to zip with safe filename
      const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      zip.file(filename, content);
    });
    
    // Generate and download zip
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes_export.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Markdown export error:', error);
    alert('Failed to export notes as Markdown. Please try again.');
  }
}; 