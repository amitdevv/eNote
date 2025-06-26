import { create } from 'zustand';
import { persist } from 'zustand/middleware';  
import { Note } from '@/types/note';
import { sampleNotes } from '@/lib/data';

interface NotesStore {
  notes: Note[];
  searchQuery: string;
  sortBy: 'recent' | 'alphabetical' | 'status';
  filterBy: 'all' | 'ideas' | 'drafts' | 'review' | 'done';
  
  // Actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Partial<Note>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleStarred: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  
  // UI State
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'recent' | 'alphabetical' | 'status') => void;
  setFilterBy: (filter: 'all' | 'ideas' | 'drafts' | 'review' | 'done') => void;
}

// Helper function to ensure dates are Date objects
const ensureDatesAreObjects = (notes: Note[]): Note[] => {
  return notes.map(note => ({
    ...note,
    type: (note.type as any) === 'text' ? 'markdown' : note.type,
    createdAt: note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt),
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt),
  }));
};

// Check for data version to force migration if needed
const DATA_VERSION = '2.0';

export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: sampleNotes,
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
          folderId: noteData.folderId,
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

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setFilterBy: (filter) => set({ filterBy: filter }),
    }),
    {
      name: 'notes-storage',
      version: 1,
      partialize: (state) => ({ 
        notes: state.notes,
        sortBy: state.sortBy,
        filterBy: state.filterBy
      }),
      // Add custom serialization/deserialization for dates
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const data = JSON.parse(str);
            
            // Check for version mismatch or corrupted data
            const storedVersion = localStorage.getItem('notes-storage-version');
            if (storedVersion !== DATA_VERSION) {
              console.log('Data version mismatch, clearing storage for fresh start');
              localStorage.removeItem(name);
              localStorage.setItem('notes-storage-version', DATA_VERSION);
              return null;
            }
            
            // Convert date strings back to Date objects
            if (data.state?.notes) {
              try {
                data.state.notes = ensureDatesAreObjects(data.state.notes);
              } catch (error) {
                console.error('Error converting dates, clearing storage:', error);
                localStorage.removeItem(name);
                return null;
              }
            }
            return data;
          } catch (error) {
            console.error('Error parsing stored notes, clearing storage:', error);
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
          localStorage.setItem('notes-storage-version', DATA_VERSION);
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          localStorage.removeItem('notes-storage-version');
        },
      },
    }
  )
); 