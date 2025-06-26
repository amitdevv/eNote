import { Note } from '@/types/note';

export interface SearchMatch {
  type: 'title' | 'content' | 'tag';
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface SearchResult {
  note: Note;
  score: number;
  matches: SearchMatch[];
}

// Strip HTML tags from content for searching (currently unused)
// const stripHtml = (html: string): string => {
//   return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
// };

// Search notes with scoring
export const searchNotes = (notes: Note[], query: string): SearchResult[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  const results: SearchResult[] = [];
  
  notes.forEach(note => {
    const titleLower = note.title.toLowerCase();
    const contentLower = note.content.toLowerCase();
    const tagsLower = note.tags.map(tag => tag.toLowerCase()).join(' ');
    
    let score = 0;
    const matches: SearchMatch[] = [];
    
    // Title matches (highest weight)
    if (titleLower.includes(searchTerm)) {
      score += 10;
      const index = titleLower.indexOf(searchTerm);
      matches.push({
        type: 'title',
        text: note.title,
        startIndex: index,
        endIndex: index + searchTerm.length
      });
    }
    
    // Content matches
    if (contentLower.includes(searchTerm)) {
      score += 5;
      const index = contentLower.indexOf(searchTerm);
      const start = Math.max(0, index - 50);
      const end = Math.min(note.content.length, index + searchTerm.length + 50);
      const excerpt = note.content.substring(start, end);
      
      matches.push({
        type: 'content',
        text: excerpt,
        startIndex: index - start,
        endIndex: index - start + searchTerm.length
      });
    }
    
    // Tag matches
    if (tagsLower.includes(searchTerm)) {
      score += 3;
      const matchingTags = note.tags.filter(tag => 
        tag.toLowerCase().includes(searchTerm)
      );
      matchingTags.forEach(tag => {
        matches.push({
          type: 'tag',
          text: tag,
          startIndex: 0,
          endIndex: tag.length
        });
      });
    }
    
    if (score > 0) {
      results.push({
        note,
        score,
        matches
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

  return Array.from(suggestions).slice(0, 5);
};

// Advanced search with filters
export interface SearchFilters {
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  starred?: boolean;
}

export const advancedSearch = (
  notes: Note[], 
  query: string, 
  filters: SearchFilters = {}
): SearchResult[] => {
  let filteredNotes = notes;
  
  // Apply filters
  if (filters.tags && filters.tags.length > 0) {
    filteredNotes = filteredNotes.filter(note => 
      filters.tags!.some(tag => note.tags.includes(tag))
    );
  }
  
  if (filters.dateRange) {
    filteredNotes = filteredNotes.filter(note => {
      const noteDate = new Date(note.updatedAt);
      return noteDate >= filters.dateRange!.start && noteDate <= filters.dateRange!.end;
    });
  }
  
  if (filters.starred !== undefined) {
    filteredNotes = filteredNotes.filter(note => note.starred === filters.starred);
  }
  
  // Perform search on filtered notes
  return searchNotes(filteredNotes, query);
}; 