import { create } from 'zustand';
import { Note } from '@/types/note';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface NotesStore {
  notes: Note[];
  searchQuery: string;
  sortBy: 'recent' | 'alphabetical' | 'priority';
  filterBy: 'all' | 'starred';
  loading: boolean;
  
  // Actions
  fetchNotes: () => Promise<void>;
  addNote: (note: Partial<Note>) => Promise<string | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleStarred: (id: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
  
  // UI State
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'recent' | 'alphabetical' | 'priority') => void;
  setFilterBy: (filter: 'all' | 'starred') => void;
}

// Helper function to convert database note to app note
const dbNoteToNote = (dbNote: any): Note => ({
  id: dbNote.id,
  title: dbNote.title,
  content: dbNote.content,
  type: 'markdown', // Always markdown in the new schema
  folderId: dbNote.folder_id,
  createdAt: new Date(dbNote.created_at),
  updatedAt: new Date(dbNote.updated_at),
  tags: dbNote.tags || [],
  starred: dbNote.starred || false,
  priority: dbNote.priority,
  fontFamily: dbNote.font_family || 'Inter',
  fontSize: dbNote.font_size || 16,
});

// Helper function to convert app note to database note
const noteToDbNote = (note: Partial<Note>, userId: string) => ({
  title: note.title || 'Untitled',
  content: note.content || '',
  type: 'markdown',
  folder_id: note.folderId || null,
  tags: note.tags || [],
  starred: note.starred || false,
  priority: note.priority || null,
  font_family: note.fontFamily || 'Inter',
  font_size: note.fontSize || 16,
  user_id: userId,
});

// No auto-folder creation - users can only create notes in predefined folders

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  searchQuery: '',
  sortBy: 'recent',
  filterBy: 'all',
  loading: false,

  fetchNotes: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ notes: [], loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to fetch notes');
        set({ loading: false });
        return;
      }

      const notes = data.map(dbNoteToNote);
      set({ notes, loading: false });
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
      set({ loading: false });
    }
  },

  addNote: async (noteData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create notes');
        return null;
      }

      const dbNote = noteToDbNote(noteData, user.id);
      
      const { data, error } = await supabase
        .from('notes')
        .insert([dbNote])
        .select()
        .single();

      if (error) {
        console.error('Error creating note:', error);
        toast.error('Failed to create note');
        return null;
      }

      const newNote = dbNoteToNote(data);
      set(state => ({ 
        notes: [newNote, ...state.notes] 
      }));
      
      toast.success('Note created successfully');
      return newNote.id;
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
      return null;
    }
  },

  updateNote: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to update notes');
        return;
      }

      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.folderId !== undefined) dbUpdates.folder_id = updates.folderId;
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
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating note:', error);
        toast.error('Failed to update note');
        return;
      }

      set(state => ({
        notes: state.notes.map(note => 
          note.id === id 
            ? { ...note, ...updates, updatedAt: new Date() } 
            : note
        )
      }));
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  },

  deleteNote: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to delete notes');
        return;
      }

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting note:', error);
        toast.error('Failed to delete note');
        return;
      }

      set(state => ({
        notes: state.notes.filter(note => note.id !== id)
      }));
      
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  },

  toggleStarred: async (id) => {
    try {
      const note = get().notes.find(n => n.id === id);
      if (!note) return;

      await get().updateNote(id, { starred: !note.starred });
    } catch (error) {
      console.error('Error toggling starred:', error);
      toast.error('Failed to update note');
    }
  },

  getNoteById: (id) => {
    return get().notes.find(note => note.id === id);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterBy: (filter) => set({ filterBy: filter }),
})); 