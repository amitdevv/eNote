import React, { createContext, useContext, useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface NotesContextType {
  notes: Note[];
  selectedWorkspace: string;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  sortBy: 'recent' | 'alphabetical' | 'status' | 'workspace';
  filterBy: 'all' | 'idea' | 'draft' | 'review' | 'done';
  fontFamily: string;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  setSelectedWorkspace: React.Dispatch<React.SetStateAction<string>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setViewMode: React.Dispatch<React.SetStateAction<'grid' | 'list'>>;
  setSortBy: React.Dispatch<React.SetStateAction<'recent' | 'alphabetical' | 'status' | 'workspace'>>;
  setFilterBy: React.Dispatch<React.SetStateAction<'all' | 'idea' | 'draft' | 'review' | 'done'>>;
  setFontFamily: React.Dispatch<React.SetStateAction<string>>;
  addNote: (note: Partial<Note>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleStarred: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  exportData: () => string;
  importData: (data: string) => boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

// Helper function to ensure dates are Date objects and migrate legacy note types
const ensureDatesAreObjects = (notes: Note[]): Note[] => {
  return notes.map(note => ({
    ...note,
    // Migrate legacy 'text' notes to 'markdown'
    type: (note.type as any) === 'text' ? 'markdown' : note.type,
    createdAt: typeof note.createdAt === 'string' ? new Date(note.createdAt) : note.createdAt,
    updatedAt: typeof note.updatedAt === 'string' ? new Date(note.updatedAt) : note.updatedAt,
    todos: note.todos?.map(todo => ({
      ...todo,
      createdAt: typeof todo.createdAt === 'string' ? new Date(todo.createdAt) : todo.createdAt,
    }))
  }));
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawNotes, setRawNotes] = useLocalStorage<Note[]>('notes', []);
  const [notes, setNotes] = useState<Note[]>(() => ensureDatesAreObjects(rawNotes));
  const [selectedWorkspace, setSelectedWorkspace] = useLocalStorage<string>('selectedWorkspace', 'inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'list'>('viewMode', 'grid');
  const [sortBy, setSortBy] = useLocalStorage<'recent' | 'alphabetical' | 'status' | 'workspace'>('sortBy', 'recent');
  const [filterBy, setFilterBy] = useLocalStorage<'all' | 'idea' | 'draft' | 'review' | 'done'>('filterBy', 'all');
  const [fontFamily, setFontFamily] = useLocalStorage<string>('fontFamily', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');

  // Sync processed notes when rawNotes change (e.g., from localStorage)
  useEffect(() => {
    setNotes(ensureDatesAreObjects(rawNotes));
  }, [rawNotes]);

  // Update localStorage whenever notes change, but also update the processed notes
  const updateNotes = (newNotes: Note[] | ((prev: Note[]) => Note[])) => {
    const updatedNotes = typeof newNotes === 'function' ? newNotes(notes) : newNotes;
    const processedNotes = ensureDatesAreObjects(updatedNotes);
    setRawNotes(updatedNotes);
    setNotes(processedNotes);
  };

  const addNote = (noteData: Partial<Note>): string => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: noteData.title || 'Untitled',
      content: noteData.content || '',
      type: noteData.type || 'markdown',
      status: noteData.status || 'idea',
      workspace: noteData.workspace || 'Personal',
      tags: noteData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...noteData
    };
    
    updateNotes(prev => [newNote, ...prev]);
    return newNote.id;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    updateNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
    ));
  };

  const deleteNote = (id: string) => {
    updateNotes(prev => prev.filter(note => note.id !== id));
  };

  const toggleStarred = (id: string) => {
    updateNotes(prev => prev.map(note => 
      note.id === id ? { ...note, starred: !note.starred, updatedAt: new Date() } : note
    ));
  };

  const getNoteById = (id: string): Note | undefined => {
    return notes.find(note => note.id === id);
  };

  const exportData = (): string => {
    const exportData = {
      notes,
      settings: {
        selectedWorkspace,
        viewMode
      },
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importData = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.notes && Array.isArray(parsed.notes)) {
        updateNotes(parsed.notes);
        if (parsed.settings) {
          if (parsed.settings.selectedWorkspace) {
            setSelectedWorkspace(parsed.settings.selectedWorkspace);
          }
          if (parsed.settings.viewMode) {
            setViewMode(parsed.settings.viewMode);
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  };

  return (
    <NotesContext.Provider value={{
      notes,
      selectedWorkspace,
      searchQuery,
      viewMode,
      sortBy,
      filterBy,
      fontFamily,
      setNotes: updateNotes,
      setSelectedWorkspace,
      setSearchQuery,
      setViewMode,
      setSortBy,
      setFilterBy,
      setFontFamily,
      addNote,
      updateNote,
      deleteNote,
      toggleStarred,
      getNoteById,
      exportData,
      importData
    }}>
      <div style={{ fontFamily }}>
        {children}
      </div>
    </NotesContext.Provider>
  );
}; 