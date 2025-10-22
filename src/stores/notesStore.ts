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
  lastFetchedUserId: string | null;
  lastFetchTime: number | null;
  
  // Actions
  fetchNotes: (userId: string, forceRefresh?: boolean) => Promise<void>;
  addNote: (note: Partial<Note>, userId: string) => Promise<string | null>;
  updateNote: (id: string, updates: Partial<Note>, userId: string) => Promise<void>;
  deleteNote: (id: string, userId: string) => Promise<void>;
  toggleStarred: (id: string, userId: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
  
  // Cache management
  clearCache: () => void;
  loadFromCache: (userId: string) => boolean;
  saveToCache: (userId: string, notes: Note[]) => void;
  
  // UI State
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'recent' | 'alphabetical' | 'priority') => void;
  setFilterBy: (filter: 'all' | 'starred') => void;
}

// Cache configuration
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = 'enote-notes-cache';

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
  title: getTitleFromContent(note.content || ''),
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

// Cache utility functions
const getCacheKey = (userId: string) => `${CACHE_KEY_PREFIX}-${userId}`;

const loadNotesFromCache = (userId: string): { notes: Note[]; timestamp: number } | null => {
  try {
    const cached = localStorage.getItem(getCacheKey(userId));
    if (cached) {
      const parsed = JSON.parse(cached);
      // Convert date strings back to Date objects
      const notes = parsed.notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      return { notes, timestamp: parsed.timestamp };
    }
  } catch (error) {
    console.warn('Failed to load notes from cache:', error);
  }
  return null;
};

const saveNotesToCache = (userId: string, notes: Note[]) => {
  try {
    const cacheData = {
      notes,
      timestamp: Date.now(),
    };
    localStorage.setItem(getCacheKey(userId), JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save notes to cache:', error);
  }
};

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  searchQuery: '',
  sortBy: 'recent',
  filterBy: 'all',
  loading: false,
  lastFetchedUserId: null,
  lastFetchTime: null,

  fetchNotes: async (userId: string, forceRefresh = false) => {
    const state = get();
    
    // Check if we already have fresh data for this user
    if (!forceRefresh && 
        state.lastFetchedUserId === userId && 
        state.lastFetchTime && 
        Date.now() - state.lastFetchTime < CACHE_EXPIRY_TIME &&
        state.notes.length > 0) {
      return; // Skip fetch, data is still fresh
    }

    // Try to load from cache first (if not forcing refresh)
    if (!forceRefresh) {
      const cached = loadNotesFromCache(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_TIME) {
        set({ 
          notes: cached.notes, 
          lastFetchedUserId: userId,
          lastFetchTime: cached.timestamp,
          loading: false 
        });
        return;
      }
    }

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to fetch notes');
        set({ loading: false });
        return;
      }

      const notes = data.map(dbNoteToNote);
      const now = Date.now();
      
      set({ 
        notes, 
        loading: false,
        lastFetchedUserId: userId,
        lastFetchTime: now
      });
      
      // Save to cache
      saveNotesToCache(userId, notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
      set({ loading: false });
    }
  },

  addNote: async (noteData, userId) => {
    try {
      const dbNote = noteToDbNote(noteData, userId);
      
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
      
      // Update cache
      const state = get();
      saveNotesToCache(userId, state.notes);
      
      toast.success('Note created successfully');
      return newNote.id;
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
      return null;
    }
  },

  updateNote: async (id, updates, userId) => {
    try {
      const dbUpdates: any = {};
      
      // If content is being updated, generate title from content
      if (updates.content !== undefined) {
        dbUpdates.title = getTitleFromContent(updates.content);
        dbUpdates.content = updates.content;
      } else if (updates.title !== undefined) {
        // If only title is being updated (shouldn't happen in new system, but keeping for compatibility)
        dbUpdates.title = updates.title;
      }
      
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
        .eq('user_id', userId);

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
      
      // Update cache
      const state = get();
      saveNotesToCache(userId, state.notes);
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  },

  deleteNote: async (id, userId) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting note:', error);
        toast.error('Failed to delete note');
        return;
      }

      set(state => ({
        notes: state.notes.filter(note => note.id !== id)
      }));
      
      // Update cache
      const state = get();
      saveNotesToCache(userId, state.notes);
      
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  },

  toggleStarred: async (id, userId) => {
    try {
      const note = get().notes.find(n => n.id === id);
      if (!note) return;

      await get().updateNote(id, { starred: !note.starred }, userId);
    } catch (error) {
      console.error('Error toggling starred:', error);
      toast.error('Failed to update note');
    }
  },

  getNoteById: (id) => {
    return get().notes.find(note => note.id === id);
  },

  // Cache management methods
  clearCache: () => {
    const state = get();
    if (state.lastFetchedUserId) {
      try {
        localStorage.removeItem(getCacheKey(state.lastFetchedUserId));
      } catch (error) {
        console.warn('Failed to clear cache:', error);
      }
    }
    set({ 
      notes: [], 
      lastFetchedUserId: null, 
      lastFetchTime: null 
    });
  },

  loadFromCache: (userId: string) => {
    const cached = loadNotesFromCache(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_TIME) {
      set({ 
        notes: cached.notes, 
        lastFetchedUserId: userId,
        lastFetchTime: cached.timestamp,
        loading: false 
      });
      return true;
    }
    return false;
  },

  saveToCache: (userId: string, notes: Note[]) => {
    saveNotesToCache(userId, notes);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterBy: (filter) => set({ filterBy: filter }),
})); 