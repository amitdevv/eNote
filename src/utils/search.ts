import { Note } from '@/types/note';

export interface SearchResult {
  note: Note;
  score: number;
}

// Strip HTML tags from content for searching
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};



// Search notes with scoring
export const searchNotes = (notes: Note[], query: string): SearchResult[] => {
  if (!query.trim()) return [];

  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
  const results: SearchResult[] = [];

  notes.forEach(note => {
    let score = 0;
    let hasMatch = false;

    // Search in title
    const titleText = note.title.toLowerCase();
    searchTerms.forEach(term => {
      if (titleText.includes(term)) {
        score += 10; // Higher score for title matches
        hasMatch = true;
      }
    });

    // Search in content
    const contentText = note.type === 'todo' && note.todos 
      ? note.todos.map(todo => todo.text).join(' ')
      : stripHtml(note.content);
    
    const contentLower = contentText.toLowerCase();
    searchTerms.forEach(term => {
      if (contentLower.includes(term)) {
        score += 5; // Medium score for content matches
        hasMatch = true;
      }
    });

    // Search in tags
    note.tags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      searchTerms.forEach(term => {
        if (tagLower.includes(term)) {
          score += 3; // Lower score for tag matches
          hasMatch = true;
        }
      });
    });

    // Search in workspace
    const workspaceLower = note.workspace.toLowerCase();
    searchTerms.forEach(term => {
      if (workspaceLower.includes(term)) {
        score += 2; // Lower score for workspace matches
        hasMatch = true;
      }
    });

    // Search in status
    const statusLower = note.status.toLowerCase();
    searchTerms.forEach(term => {
      if (statusLower.includes(term)) {
        score += 1; // Lowest score for status matches
        hasMatch = true;
      }
    });

    // Boost score for exact phrase matches
    const fullQuery = query.toLowerCase();
    if (titleText.includes(fullQuery)) score += 20;
    if (contentLower.includes(fullQuery)) score += 15;

    // Boost score for recent notes
    const daysSinceUpdate = (Date.now() - note.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) score += 5;
    if (daysSinceUpdate < 1) score += 10;

    if (hasMatch) {
      results.push({
        note,
        score
      });
    }
  });

  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
};

// Get search suggestions based on existing notes
export const getSearchSuggestions = (notes: Note[], query: string): string[] => {
  if (!query.trim()) return [];

  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();

  // Suggest from titles
  notes.forEach(note => {
    if (note.title.toLowerCase().includes(queryLower)) {
      suggestions.add(note.title);
    }
  });

  // Suggest from tags
  notes.forEach(note => {
    note.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    });
  });

  // Suggest from workspaces
  notes.forEach(note => {
    if (note.workspace.toLowerCase().includes(queryLower)) {
      suggestions.add(note.workspace);
    }
  });

  return Array.from(suggestions).slice(0, 5);
};

// Advanced search with filters
export interface SearchFilters {
  workspace?: string;
  status?: Note['status'];
  type?: Note['type'];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachments?: boolean;
}

export const searchNotesWithFilters = (
  notes: Note[], 
  query: string, 
  filters: SearchFilters = {}
): SearchResult[] => {
  let filteredNotes = notes;

  // Apply filters first
  if (filters.workspace) {
    filteredNotes = filteredNotes.filter(note => 
      note.workspace.toLowerCase() === filters.workspace!.toLowerCase()
    );
  }

  if (filters.status) {
    filteredNotes = filteredNotes.filter(note => note.status === filters.status);
  }

  if (filters.type) {
    filteredNotes = filteredNotes.filter(note => note.type === filters.type);
  }

  if (filters.tags && filters.tags.length > 0) {
    filteredNotes = filteredNotes.filter(note =>
      filters.tags!.some(filterTag =>
        note.tags.some(noteTag => 
          noteTag.toLowerCase().includes(filterTag.toLowerCase())
        )
      )
    );
  }

  if (filters.dateFrom) {
    filteredNotes = filteredNotes.filter(note => note.updatedAt >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    filteredNotes = filteredNotes.filter(note => note.updatedAt <= filters.dateTo!);
  }

  // Then search within filtered results
  return searchNotes(filteredNotes, query);
}; 