import { create } from 'zustand';
import { Note } from '@/types/note';

interface EditorStore {
  // Current note being edited
  currentNoteId: string | null;
  
  // Editor state
  title: string;
  content: string;
  status: Note['status'];
  folderId: string;
  tags: string[];
  fontFamily: string;
  
  // UI state
  isDirty: boolean;
  lastSaved: Date | null;
  autoSaveTimer: NodeJS.Timeout | null;
  
  // Actions
  setCurrentNote: (note: Note | null) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setStatus: (status: Note['status']) => void;
  setFolderId: (folderId: string) => void;
  setTags: (tags: string[]) => void;
  setFontFamily: (fontFamily: string) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  
  // Editor lifecycle
  resetEditor: () => void;
  markDirty: () => void;
  markClean: () => void;
  setAutoSaveTimer: (timer: NodeJS.Timeout | null) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentNoteId: null,
  title: '',
  content: '',
  status: 'idea',
  folderId: '',
  tags: [],
  fontFamily: 'Inter',
  isDirty: false,
  lastSaved: null,
  autoSaveTimer: null,

  setCurrentNote: (note) => {
    if (note) {
      set({
        currentNoteId: note.id,
        title: note.title,
        content: note.content,
        status: note.status,
        folderId: note.folderId || '',
        tags: note.tags,
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
        status: 'idea',
        folderId: '',
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

  setStatus: (status) => {
    set({ status, isDirty: true });
  },

  setFolderId: (folderId) => {
    set({ folderId, isDirty: true });
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
      set({ 
        tags: [...state.tags, trimmedTag], 
        isDirty: true 
      });
    }
  },

  removeTag: (tagToRemove) => {
    const state = get();
    set({ 
      tags: state.tags.filter(tag => tag !== tagToRemove), 
      isDirty: true 
    });
  },

  resetEditor: () => {
    const state = get();
    if (state.autoSaveTimer) {
      clearTimeout(state.autoSaveTimer);
    }
    set({
      currentNoteId: null,
      title: '',
      content: '',
      status: 'idea',
      folderId: '',
      tags: [],
      fontFamily: 'Inter',
      isDirty: false,
      lastSaved: null,
      autoSaveTimer: null,
    });
  },

  markDirty: () => set({ isDirty: true }),
  
  markClean: () => set({ isDirty: false, lastSaved: new Date() }),

  setAutoSaveTimer: (timer) => {
    const state = get();
    if (state.autoSaveTimer) {
      clearTimeout(state.autoSaveTimer);
    }
    set({ autoSaveTimer: timer });
  },
})); 