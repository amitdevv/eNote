import { create } from 'zustand';
import { Note } from '@/types/note';

interface EditorStore {
  // Current note being edited
  currentNoteId: string | null;
  
  // Editor state
  title: string;
  content: string;
  tags: string[];
  fontFamily: string;
  
  // UI state
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Actions
  setCurrentNote: (note: Note | null) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setTags: (tags: string[]) => void;
  setFontFamily: (fontFamily: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  
  // Editor lifecycle
  resetEditor: () => void;
  markDirty: () => void;
  markClean: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentNoteId: null,
  title: '',
  content: '',
  tags: [],
  fontFamily: 'Inter',
  isDirty: false,
  lastSaved: null,

  setCurrentNote: (note) => {
    if (note) {
      set({
        currentNoteId: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        fontFamily: note.fontFamily || 'Inter',
        isDirty: false,
        lastSaved: note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt),
      });
    } else {
      // New note
      set({
        currentNoteId: null,
        title: '',
        content: '',
        tags: [],
        fontFamily: 'Inter',
        isDirty: false,
        lastSaved: null,
      });
    }
  },

  setTitle: (title) => {
    set({ title, isDirty: true });
  },

  setContent: (content) => {
    set({ content, isDirty: true });
  },

  setTags: (tags) => {
    set({ tags, isDirty: true });
  },

  setFontFamily: (fontFamily) => {
    set({ fontFamily, isDirty: true });
  },

  addTag: (tag) => {
    const state = get();
    const trimmedTag = tag.trim();
    
    if (trimmedTag && !state.tags.includes(trimmedTag)) {
      const newTags = [...state.tags, trimmedTag];
      set({ 
        tags: newTags, 
        isDirty: true 
      });
    }
  },

  removeTag: (tagToRemove) => {
    const state = get();
    const newTags = state.tags.filter(tag => tag !== tagToRemove);
    
    set({ 
      tags: newTags, 
      isDirty: true 
    });
  },

  resetEditor: () => {
    set({
      currentNoteId: null,
      title: '',
      content: '',
      tags: [],
      fontFamily: 'Inter',
      isDirty: false,
      lastSaved: null,
    });
  },

  markDirty: () => set({ isDirty: true }),
  
  markClean: () => set({ isDirty: false, lastSaved: new Date() }),
})); 