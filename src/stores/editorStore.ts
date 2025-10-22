import { create } from 'zustand';
import { Note } from '@/types/note';
import { getTitleFromContent } from '@/utils/titleUtils';

interface EditorStore {
  // Current note being edited
  currentNoteId: string | null;
  
  // Editor state
  content: string;
  contentType: 'markdown' | 'html';
  tags: string[];
  fontFamily: string;
  fontSize: number;
  
  // UI state
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Actions
  setCurrentNote: (note: Note | null) => void;
  setContent: (content: string) => void;
  setContentType: (type: 'markdown' | 'html') => void;
  setTags: (tags: string[]) => void;
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: number) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  
  // Editor lifecycle
  resetEditor: () => void;
  markDirty: () => void;
  markClean: () => void;
  
  // Computed getters
  getTitle: () => string;
}

export const useEditorStore = create<EditorStore>((set, get) => {
  // Get default settings from localStorage for initial state
  const settingsStore = JSON.parse(localStorage.getItem('eNote-settings') || '{}');
  const defaultFont = settingsStore.state?.defaultFont || 'Fira Code';
  const defaultFontSize = settingsStore.state?.defaultFontSize || 20;

  return {
    currentNoteId: null,
    content: '',
    contentType: 'markdown',
    tags: [],
    fontFamily: defaultFont,
    fontSize: defaultFontSize,
    isDirty: false,
    lastSaved: null,

  setCurrentNote: (note) => {
    if (note) {
      set({
        currentNoteId: note.id,
        content: note.content,
        contentType: note.type || 'markdown',
        tags: note.tags || [],
        fontFamily: note.fontFamily || 'Fira Code',
        fontSize: note.fontSize || 20,
        isDirty: false,
        lastSaved: note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt),
      });
    } else {
      // New note - get default settings from localStorage
      const settingsStore = JSON.parse(localStorage.getItem('eNote-settings') || '{}');
      const defaultFont = settingsStore.state?.defaultFont || 'Fira Code';
      const defaultFontSize = settingsStore.state?.defaultFontSize || 20;
      
      set({
        currentNoteId: null,
        content: '',
        contentType: 'markdown',
        tags: [],
        fontFamily: defaultFont,
        fontSize: defaultFontSize,
        isDirty: false,
        lastSaved: null,
      });
    }
  },

  setContent: (content) => {
    set({ content, isDirty: true });
  },

  setContentType: (contentType) => {
    set({ contentType, isDirty: true });
  },

  setTags: (tags) => {
    set({ tags, isDirty: true });
  },

  setFontFamily: (fontFamily) => {
    set({ fontFamily, isDirty: true });
  },

  setFontSize: (fontSize) => {
    set({ fontSize, isDirty: true });
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
    // Get default settings from localStorage
    const settingsStore = JSON.parse(localStorage.getItem('eNote-settings') || '{}');
    const defaultFont = settingsStore.state?.defaultFont || 'Fira Code';
    const defaultFontSize = settingsStore.state?.defaultFontSize || 20;
    
    set({
      currentNoteId: null,
      content: '',
      contentType: 'markdown',
      tags: [],
      fontFamily: defaultFont,
      fontSize: defaultFontSize,
      isDirty: false,
      lastSaved: null,
    });
  },

  markDirty: () => set({ isDirty: true }),
  
  markClean: () => set({ isDirty: false, lastSaved: new Date() }),
  
  getTitle: () => {
    const state = get();
    return getTitleFromContent(state.content);
  },
  };
}); 