import { create } from 'zustand';
import { Note } from '@/types/note';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getTitleFromContent } from '@/utils/titleUtils';

interface NotesStore {
  notes: Note[];
  searchQuery: string;
  sortBy: 'recent' | 'alphabetical' | 'priority';
  filterBy: 'all' | 'starred';
  loading: boolean;

  fetchNotes: (userId: string) => Promise<void>;
  addNote: (note: Partial<Note>, userId: string) => Promise<string | null>;
  updateNote: (id: string, updates: Partial<Note>, userId: string) => Promise<void>;
  deleteNote: (id: string, userId: string) => Promise<void>;
  toggleStarred: (id: string, userId: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
  reset: () => void;

  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'recent' | 'alphabetical' | 'priority') => void;
  setFilterBy: (filter: 'all' | 'starred') => void;
}

const dbNoteToNote = (dbNote: any): Note => ({
  id: dbNote.id,
  title: dbNote.title,
  content: dbNote.content,
  createdAt: new Date(dbNote.created_at),
  updatedAt: new Date(dbNote.updated_at),
  tags: dbNote.tags || [],
  starred: dbNote.starred || false,
  priority: dbNote.priority,
  fontFamily: dbNote.font_family || 'Inter',
  fontSize: dbNote.font_size || 16,
});

const noteToDbNote = (note: Partial<Note>, userId: string) => ({
  title: getTitleFromContent(note.content || ''),
  content: note.content || '',
  type: 'markdown',
  tags: note.tags || [],
  starred: note.starred || false,
  priority: note.priority || null,
  font_family: note.fontFamily || 'Inter',
  font_size: note.fontSize || 16,
  user_id: userId,
});

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  searchQuery: '',
  sortBy: 'recent',
  filterBy: 'all',
  loading: false,

  fetchNotes: async (userId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch notes');
      set({ loading: false });
      return;
    }

    set({ notes: data.map(dbNoteToNote), loading: false });
  },

  addNote: async (noteData, userId) => {
    const { data, error } = await supabase
      .from('notes')
      .insert([noteToDbNote(noteData, userId)])
      .select()
      .single();

    if (error) {
      toast.error('Failed to create note');
      return null;
    }

    const newNote = dbNoteToNote(data);
    set(state => ({ notes: [newNote, ...state.notes] }));
    toast.success('Note created successfully');
    return newNote.id;
  },

  updateNote: async (id, updates, userId) => {
    const dbUpdates: any = {};

    if (updates.content !== undefined) {
      dbUpdates.title = getTitleFromContent(updates.content);
      dbUpdates.content = updates.content;
    } else if (updates.title !== undefined) {
      dbUpdates.title = updates.title;
    }

    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.starred !== undefined) dbUpdates.starred = updates.starred;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.fontFamily !== undefined) dbUpdates.font_family = updates.fontFamily;
    if (updates.fontSize !== undefined) dbUpdates.font_size = updates.fontSize;

    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('notes')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update note');
      return;
    }

    set(state => ({
      notes: state.notes.map(note =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
      ),
    }));
  },

  deleteNote: async (id, userId) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to delete note');
      return;
    }

    set(state => ({ notes: state.notes.filter(note => note.id !== id) }));
    toast.success('Note deleted successfully');
  },

  toggleStarred: async (id, userId) => {
    const note = get().notes.find(n => n.id === id);
    if (!note) return;
    await get().updateNote(id, { starred: !note.starred }, userId);
  },

  getNoteById: (id) => get().notes.find(note => note.id === id),

  reset: () => set({ notes: [], searchQuery: '', loading: false }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterBy: (filter) => set({ filterBy: filter }),
}));
