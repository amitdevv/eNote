import { Note } from '@/types/note';

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
  content += `**Created:** ${note.createdAt.toLocaleDateString()}\n`;
  content += `**Updated:** ${note.updatedAt.toLocaleDateString()}\n`;
  content += `**Status:** ${note.status}\n`;
  content += `**Workspace:** ${note.workspace}\n`;
  if (note.tags.length > 0) {
    content += `**Tags:** ${note.tags.join(', ')}\n`;
  }
  content += '\n---\n\n';

  // Add content based on note type
  if (note.type === 'todo' && note.todos) {
    content += '## Tasks\n\n';
    note.todos.forEach(todo => {
      const checkbox = todo.completed ? '[x]' : '[ ]';
      const priority = todo.priority ? ` (${todo.priority})` : '';
      content += `${checkbox} ${todo.text}${priority}\n`;
    });
  } else if (note.type === 'code') {
    content += `\`\`\`${note.language || 'javascript'}\n${note.content}\n\`\`\`\n`;
  } else {
    // For markdown notes, convert HTML back to markdown
    content += htmlToMarkdown(note.content);
  }

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

// Export single note as PDF
export const exportNoteAsPDF = async (note: Note): Promise<void> => {
  try {
    // Dynamic import for jsPDF to reduce bundle size
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let y = margin;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(note.title, maxWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 10 + 10;

    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Created: ${note.createdAt.toLocaleDateString()}`, margin, y);
    y += 7;
    doc.text(`Updated: ${note.updatedAt.toLocaleDateString()}`, margin, y);
    y += 7;
    doc.text(`Status: ${note.status} | Workspace: ${note.workspace}`, margin, y);
    y += 7;
    if (note.tags.length > 0) {
      doc.text(`Tags: ${note.tags.join(', ')}`, margin, y);
      y += 7;
    }
    y += 10;

    // Content
    doc.setFontSize(12);
    let content = '';
    
    if (note.type === 'todo' && note.todos) {
      content = 'Tasks:\n\n';
      note.todos.forEach(todo => {
        const checkbox = todo.completed ? '[✓]' : '[ ]';
        const priority = todo.priority ? ` (${todo.priority})` : '';
        content += `${checkbox} ${todo.text}${priority}\n`;
      });
    } else if (note.type === 'code') {
      content = `Code (${note.language || 'javascript'}):\n\n${note.content}`;
    } else {
      content = htmlToMarkdown(note.content);
    }

    const contentLines = doc.splitTextToSize(content, maxWidth);
    const pageHeight = doc.internal.pageSize.getHeight();

    contentLines.forEach((line: string) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    });

    doc.save(`${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
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
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      todos: note.todos?.map(todo => ({
        ...todo,
        createdAt: todo.createdAt.toISOString()
      }))
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
      content += `**Created:** ${note.createdAt.toLocaleDateString()}\n`;
      content += `**Updated:** ${note.updatedAt.toLocaleDateString()}\n`;
      content += `**Status:** ${note.status}\n`;
      content += `**Workspace:** ${note.workspace}\n`;
      if (note.tags.length > 0) {
        content += `**Tags:** ${note.tags.join(', ')}\n`;
      }
      content += '\n---\n\n';

      // Add content based on note type
      if (note.type === 'todo' && note.todos) {
        content += '## Tasks\n\n';
        note.todos.forEach(todo => {
          const checkbox = todo.completed ? '[x]' : '[ ]';
          const priority = todo.priority ? ` (${todo.priority})` : '';
          content += `${checkbox} ${todo.text}${priority}\n`;
        });
      } else if (note.type === 'code') {
        content += `\`\`\`${note.language || 'javascript'}\n${note.content}\n\`\`\`\n`;
      } else {
        content += htmlToMarkdown(note.content);
      }

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