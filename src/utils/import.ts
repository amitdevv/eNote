import { Note } from '@/types/note';

// Parse markdown content to extract metadata and content
const parseMarkdownFile = (content: string, fileName: string): Partial<Note> => {
  let title = fileName.replace(/\.md$/, '').replace(/_/g, ' ');
  let noteContent = content;
  const tags: string[] = [];
  let status: Note['status'] = 'idea';

  // Look for title (first # heading)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Look for metadata section
  const metadataMatch = content.match(/\*\*Created:\*\*.*?\n\*\*Updated:\*\*.*?\n.*?\n---\n\n([\s\S]*)/);
  if (metadataMatch) {
    noteContent = metadataMatch[1];
    
    // Extract status
    const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/);
    if (statusMatch) {
      const extractedStatus = statusMatch[1].trim().toLowerCase();
      if (['idea', 'research', 'outline', 'draft', 'review', 'done'].includes(extractedStatus)) {
        status = extractedStatus as Note['status'];
      }
    }

    // Extract tags
    const tagsMatch = content.match(/\*\*Tags:\*\*\s*(.+)/);
    if (tagsMatch) {
      tags.push(...tagsMatch[1].split(',').map(tag => tag.trim()));
    }
  }

  // Convert markdown to HTML (basic conversion)
  const htmlContent = noteContent
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\n/gim, '<br>');

  // Always use markdown type since we only support markdown now
  let noteType: Note['type'] = 'markdown';

  return {
    title,
    content: htmlContent,
    type: noteType,
    status,
    tags,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Import from JSON (exported notes)
export const importFromJSON = (file: File): Promise<Partial<Note>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.notes && Array.isArray(data.notes)) {
          const importedNotes = data.notes.map((note: any) => ({
            ...note,
            type: 'markdown', // Force all imported notes to be markdown
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          }));
          resolve(importedNotes);
        } else {
          reject(new Error('Invalid JSON format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Import from Markdown file
export const importFromMarkdown = async (file: File): Promise<Partial<Note>> => {
  const content = await file.text();
  const lines = content.split('\n');
  
  let title = '';
  let tags: string[] = [];
  let noteContent = '';
  let contentStartIndex = 0;

  // Extract title (first # heading)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# ')) {
      title = line.substring(2).trim();
      break;
    }
  }

  // Extract metadata
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('**Tags:**')) {
      const tagsText = line.replace('**Tags:**', '').trim();
      if (tagsText && tagsText !== 'None') {
        tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }
    
    if (line === '---') {
      contentStartIndex = i + 1;
      break;
    }
  }

  // Extract content (everything after metadata)
  if (contentStartIndex > 0) {
    noteContent = lines.slice(contentStartIndex).join('\n').trim();
  } else {
    // If no metadata separator found, use everything after title
    const titleLineIndex = lines.findIndex(line => line.trim().startsWith('# '));
    if (titleLineIndex >= 0) {
      noteContent = lines.slice(titleLineIndex + 1).join('\n').trim();
    } else {
      noteContent = content;
    }
  }

  return {
    title: title || file.name.replace('.md', ''),
    content: noteContent,
    tags,
    type: 'markdown',
  };
};

// Import from multiple Markdown files (ZIP)
export const importFromMarkdownZip = async (file: File): Promise<Partial<Note>[]> => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  const zipContent = await zip.loadAsync(file);
  const notes: Partial<Note>[] = [];

  for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
    if (!zipEntry.dir && filename.endsWith('.md')) {
      const content = await zipEntry.async('string');
      const lines = content.split('\n');
      
      let title = '';
      let tags: string[] = [];
      let noteContent = '';

      // Extract title from filename or first heading
      title = filename.replace('.md', '').replace(/_/g, ' ');
      
      // Look for title in content
      for (const line of lines) {
        if (line.trim().startsWith('# ')) {
          title = line.substring(2).trim();
          break;
        }
      }

      // Extract tags from metadata
      for (const line of lines) {
        if (line.trim().startsWith('**Tags:**')) {
          const tagsText = line.replace('**Tags:**', '').trim();
          if (tagsText && tagsText !== 'None') {
            tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
          }
          break;
        }
      }

      // Extract content (everything after metadata separator or title)
      const separatorIndex = lines.findIndex(line => line.trim() === '---');
      if (separatorIndex >= 0) {
        noteContent = lines.slice(separatorIndex + 1).join('\n').trim();
      } else {
        const titleIndex = lines.findIndex(line => line.trim().startsWith('# '));
        noteContent = lines.slice(titleIndex + 1).join('\n').trim();
      }

      notes.push({
        title: title || 'Untitled',
        content: noteContent,
        tags,
        type: 'markdown',
      });
    }
  }

  return notes;
};

// Import from plain text
export const importFromText = async (file: File): Promise<Partial<Note>> => {
  const content = await file.text();
  const lines = content.split('\n');
  const title = lines[0]?.trim() || file.name.replace('.txt', '');
  const noteContent = lines.slice(1).join('\n').trim();

  return {
    title,
    content: noteContent,
    tags: [],
    type: 'markdown',
  };
}; 