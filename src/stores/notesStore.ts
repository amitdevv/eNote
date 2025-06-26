import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from '@/types/note';

interface NotesStore {
  notes: Note[];
  selectedWorkspace: string;
  searchQuery: string;
  sortBy: 'recent' | 'alphabetical' | 'status' | 'workspace';
  filterBy: 'all' | 'ideas' | 'drafts' | 'review' | 'done';
  
  // Actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Partial<Note>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleStarred: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  
  // UI State
  setSelectedWorkspace: (workspace: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'recent' | 'alphabetical' | 'status' | 'workspace') => void;
  setFilterBy: (filter: 'all' | 'ideas' | 'drafts' | 'review' | 'done') => void;
}

// Helper function to ensure dates are Date objects
const ensureDatesAreObjects = (notes: Note[]): Note[] => {
  return notes.map(note => ({
    ...note,
    type: (note.type as any) === 'text' ? 'markdown' : note.type,
    createdAt: typeof note.createdAt === 'string' ? new Date(note.createdAt) : note.createdAt,
    updatedAt: typeof note.updatedAt === 'string' ? new Date(note.updatedAt) : note.updatedAt,
  }));
};

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      selectedWorkspace: 'all',
      searchQuery: '',
      sortBy: 'recent',
      filterBy: 'all',

      setNotes: (notes) => set({ notes: ensureDatesAreObjects(notes) }),

      addNote: (noteData) => {
        const newNote: Note = {
          id: Date.now().toString(),
          title: noteData.title || 'Untitled',
          content: noteData.content || '',
          type: 'markdown',
          status: noteData.status || 'idea',
          workspace: noteData.workspace || 'Personal',
          tags: noteData.tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          fontFamily: noteData.fontFamily || 'Inter',
          ...noteData
        };
        
        set(state => ({ 
          notes: [newNote, ...state.notes] 
        }));
        
        return newNote.id;
      },

      updateNote: (id, updates) => {
        set(state => ({
          notes: state.notes.map(note => 
            note.id === id 
              ? { ...note, ...updates, updatedAt: new Date() } 
              : note
          )
        }));
      },

      deleteNote: (id) => {
        set(state => ({
          notes: state.notes.filter(note => note.id !== id)
        }));
      },

      toggleStarred: (id) => {
        set(state => ({
          notes: state.notes.map(note => 
            note.id === id 
              ? { ...note, starred: !note.starred, updatedAt: new Date() } 
              : note
          )
        }));
      },

      getNoteById: (id) => {
        return get().notes.find(note => note.id === id);
      },

      setSelectedWorkspace: (workspace) => set({ selectedWorkspace: workspace }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setFilterBy: (filter) => set({ filterBy: filter }),
    }),
    {
      name: 'notes-storage',
      partialize: (state) => ({ 
        notes: state.notes,
        selectedWorkspace: state.selectedWorkspace,
        sortBy: state.sortBy,
        filterBy: state.filterBy
      }),
    }
  )
); 