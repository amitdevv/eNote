import { create } from 'zustand';
import { Note } from '@/types/note';

interface EditorStore {
  currentNoteId: string | null;
  content: string;
  tags: string[];
  fontFamily: string;
  fontSize: number;

  setCurrentNote: (note: Note | null) => void;
  setContent: (content: string) => void;
  setTags: (tags: string[]) => void;
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: number) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  resetEditor: () => void;
}

const getDefaults = () => {
  try {
    const settings = JSON.parse(localStorage.getItem('eNote-settings') || '{}');
    return {
      fontFamily: settings.state?.defaultFont || 'Fira Code',
      fontSize: settings.state?.defaultFontSize || 20,
    };
  } catch {
    return { fontFamily: 'Fira Code', fontSize: 20 };
  }
};

const emptyState = () => ({
  currentNoteId: null,
  content: '',
  tags: [] as string[],
  ...getDefaults(),
});

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...emptyState(),

  setCurrentNote: (note) => {
    if (note) {
      set({
        currentNoteId: note.id,
        content: note.content,
        tags: note.tags || [],
        fontFamily: note.fontFamily || 'Fira Code',
        fontSize: note.fontSize || 20,
      });
    } else {
      set(emptyState());
    }
  },

  setContent: (content) => set({ content }),
  setTags: (tags) => set({ tags }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize }),

  addTag: (tag) => {
    const trimmed = tag.trim();
    const { tags } = get();
    if (trimmed && !tags.includes(trimmed)) {
      set({ tags: [...tags, trimmed] });
    }
  },

  removeTag: (tagToRemove) => {
    set({ tags: get().tags.filter(tag => tag !== tagToRemove) });
  },

  resetEditor: () => set(emptyState()),
}));
