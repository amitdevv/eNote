import { Note } from '@/types/note';

// Parse markdown content to extract metadata and content
const parseMarkdownFile = (content: string, fileName: string): Partial<Note> => {
  let title = fileName.replace(/\.md$/, '').replace(/_/g, ' ');
  let noteContent = content;
  const tags: string[] = [];
  let workspace = 'Personal';
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
    
    // Extract workspace
    const workspaceMatch = content.match(/\*\*Workspace:\*\*\s*(.+)/);
    if (workspaceMatch) {
      workspace = workspaceMatch[1].trim();
    }

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
    workspace,
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
export const importFromMarkdown = (file: File): Promise<Partial<Note>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const note = parseMarkdownFile(content, file.name);
        resolve(note);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Import from multiple Markdown files (ZIP)
export const importFromMarkdownZip = async (file: File): Promise<Partial<Note>[]> => {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const notes: Partial<Note>[] = [];

    for (const [fileName, fileData] of Object.entries(contents.files)) {
      if (!fileData.dir && fileName.endsWith('.md')) {
        const content = await fileData.async('text');
        const note = parseMarkdownFile(content, fileName);
        notes.push(note);
      }
    }

    return notes;
  } catch (error) {
    throw new Error('Failed to read ZIP file');
  }
};

// Import from plain text
export const importFromText = (file: File): Promise<Partial<Note>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const title = file.name.replace(/\.(txt|md)$/, '').replace(/_/g, ' ');
        
        resolve({
          title,
          content: content.replace(/\n/g, '<br>'),
          type: 'markdown',
          status: 'idea',
          workspace: 'Personal',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}; 