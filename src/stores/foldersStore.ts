import { create } from 'zustand';
import { Folder } from '@/types/note';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FoldersStore {
  folders: Folder[];
  expandedFolders: Set<string>;
  loading: boolean;
  
  // Actions
  fetchFolders: () => Promise<void>;
  createDefaultFolders: () => Promise<void>;
  cleanupDuplicateFolders: () => Promise<void>;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  getFolderById: (id: string) => Folder | undefined;
  getFoldersByParent: (parentId?: string) => Folder[];
  getFolderPath: (folderId: string) => Folder[];
  updateFolderNoteCounts: (noteCounts: Record<string, number>) => void;
  canDeleteFolder: (folderId: string) => boolean;
  
  // UI State
  toggleFolderExpanded: (folderId: string) => void;
  isExpanded: (folderId: string) => boolean;
}

// Predefined folders that every user should have
const DEFAULT_FOLDERS = [
  { name: 'Personal', color: 'bg-blue-500' },
  { name: 'College', color: 'bg-green-500' },
  { name: 'Coding', color: 'bg-purple-500' },
  { name: 'Projects', color: 'bg-orange-500' },
];

// Helper function to convert database folder to app folder
const dbFolderToFolder = (dbFolder: any): Folder => ({
  id: dbFolder.id,
  name: dbFolder.name,
  color: dbFolder.color,
  parentId: dbFolder.parent_id,
  createdAt: new Date(dbFolder.created_at),
  updatedAt: new Date(dbFolder.updated_at),
});

// Helper function to convert app folder to database folder
const folderToDbFolder = (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => ({
  name: folder.name,
  color: folder.color,
  parent_id: folder.parentId || null,
  user_id: userId,
});

export const useFoldersStore = create<FoldersStore>((set, get) => ({
  folders: [],
  expandedFolders: new Set(),
  loading: false,

  createDefaultFolders: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for creating default folders');
        return;
      }

      console.log('Creating default folders for user:', user.email);

      // Check if any of the default folders already exist to prevent duplicates
      const { data: existingFolders, error: checkError } = await supabase
        .from('folders')
        .select('name')
        .eq('user_id', user.id)
        .in('name', DEFAULT_FOLDERS.map(f => f.name));

      if (checkError) {
        console.error('Error checking existing folders:', checkError);
        return;
      }

      if (existingFolders && existingFolders.length > 0) {
        console.log('Some default folders already exist, skipping creation:', existingFolders);
        return;
      }

      // Create default folders in a single transaction
      const foldersToCreate = DEFAULT_FOLDERS.map(folder => ({
        name: folder.name,
        color: folder.color,
        parent_id: null,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('folders')
        .insert(foldersToCreate)
        .select();

      if (error) {
        console.error('Error creating default folders:', error);
        return;
      }

      console.log('Default folders created successfully:', data.length, 'folders');
      
      // Update local state
      const newFolders = data.map(dbFolderToFolder);
      set({
        folders: newFolders,
        loading: false
      });

    } catch (error) {
      console.error('Error in createDefaultFolders:', error);
    }
  },

  cleanupDuplicateFolders: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for cleanup');
        return;
      }

      console.log('Starting cleanup of duplicate folders...');

      // Get all folders for this user
      const { data: allFolders, error: fetchError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching folders for cleanup:', fetchError);
        return;
      }

      if (!allFolders || allFolders.length === 0) {
        console.log('No folders to cleanup');
        return;
      }

      // Group folders by name
      const folderGroups: Record<string, any[]> = {};
      allFolders.forEach(folder => {
        if (!folderGroups[folder.name]) {
          folderGroups[folder.name] = [];
        }
        folderGroups[folder.name].push(folder);
      });

      // Find duplicates and keep only the first one of each
      const foldersToDelete: string[] = [];
      const foldersToKeep: any[] = [];

      Object.entries(folderGroups).forEach(([name, folders]) => {
        if (folders.length > 1) {
          console.log(`Found ${folders.length} duplicates of "${name}"`);
          // Keep the first one (oldest), delete the rest
          foldersToKeep.push(folders[0]);
          foldersToDelete.push(...folders.slice(1).map(f => f.id));
        } else {
          foldersToKeep.push(folders[0]);
        }
      });

      if (foldersToDelete.length > 0) {
        console.log(`Deleting ${foldersToDelete.length} duplicate folders...`);
        
        // Delete duplicate folders
        const { error: deleteError } = await supabase
          .from('folders')
          .delete()
          .in('id', foldersToDelete);

        if (deleteError) {
          console.error('Error deleting duplicate folders:', deleteError);
          toast.error('Failed to cleanup duplicate folders');
          return;
        }

        console.log('Successfully deleted duplicate folders');
        toast.success(`Cleaned up ${foldersToDelete.length} duplicate folders`);
        
        // Update local state with cleaned data
        const cleanedFolders = foldersToKeep.map(dbFolderToFolder);
        set({ folders: cleanedFolders });
      } else {
        console.log('No duplicate folders found');
        toast.success('No duplicates found - folders are already clean');
      }

    } catch (error) {
      console.error('Error in cleanupDuplicateFolders:', error);
      toast.error('Failed to cleanup folders');
    }
  },

  fetchFolders: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ folders: [], loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching folders:', error);
        toast.error('Failed to fetch folders');
        set({ loading: false });
        return;
      }

      const folders = data.map(dbFolderToFolder);
      
      // If no folders exist, create default ones
      if (folders.length === 0) {
        console.log('No folders found, attempting to create default folders');
        await get().createDefaultFolders();
        // createDefaultFolders already updated the state if successful
      } else {
        set({ folders, loading: false });
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to fetch folders');
      set({ loading: false });
    }
  },

  addFolder: async (folderData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create folders');
        return null;
      }

      const dbFolder = folderToDbFolder(folderData, user.id);
      
      const { data, error } = await supabase
        .from('folders')
        .insert([dbFolder])
        .select()
        .single();

      if (error) {
        console.error('Error adding folder:', error);
        toast.error('Failed to create folder');
        return null;
      }

      const newFolder = dbFolderToFolder(data);
      set(state => ({
        folders: [...state.folders, newFolder]
      }));
      
      toast.success('Folder created successfully');
      return newFolder.id;
    } catch (error) {
      console.error('Error adding folder:', error);
      toast.error('Failed to create folder');
      return null;
    }
  },

  updateFolder: async (id, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to update folders');
        return;
      }

      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
      
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('folders')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating folder:', error);
        toast.error('Failed to update folder');
        return;
      }

      set(state => ({
        folders: state.folders.map(folder => 
          folder.id === id 
            ? { ...folder, ...updates, updatedAt: new Date() } 
            : folder
        )
      }));
      
      toast.success('Folder updated successfully');
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  },

  deleteFolder: async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to delete folders');
        return;
      }

      // First, update all notes in this folder to have no folder
      await supabase
        .from('notes')
        .update({ folder_id: null })
        .eq('folder_id', id)
        .eq('user_id', user.id);

      // Then recursively delete all child folders and their notes
      const deleteRecursively = async (folderId: string) => {
        const childFolders = get().folders.filter(f => f.parentId === folderId);
        
        // Delete all child folders recursively
        for (const child of childFolders) {
          await deleteRecursively(child.id);
        }
        
        // Update notes in this folder to have no folder
        await supabase
          .from('notes')
          .update({ folder_id: null })
          .eq('folder_id', folderId)
          .eq('user_id', user.id);
        
        // Delete the folder
        await supabase
          .from('folders')
          .delete()
          .eq('id', folderId)
          .eq('user_id', user.id);
      };

      await deleteRecursively(id);

      // Update local state
      const deleteRecursivelyLocal = (folderId: string, folders: Folder[]): Folder[] => {
        const childFolders = folders.filter(f => f.parentId === folderId);
        let remainingFolders = folders.filter(f => f.id !== folderId);
        
        childFolders.forEach(child => {
          remainingFolders = deleteRecursivelyLocal(child.id, remainingFolders);
        });
        
        return remainingFolders;
      };

      set(state => ({
        folders: deleteRecursivelyLocal(id, state.folders),
        expandedFolders: new Set([...state.expandedFolders].filter(fId => fId !== id))
      }));
      
      toast.success('Folder deleted successfully');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  },

  getFolderById: (id) => {
    return get().folders.find(folder => folder.id === id);
  },

  getFoldersByParent: (parentId) => {
    // Handle null/undefined comparison for root folders
    const targetParentId = parentId || null;
    return get().folders.filter(folder => (folder.parentId || null) === targetParentId);
  },

  getFolderPath: (folderId) => {
    const folders = get().folders;
    const path: Folder[] = [];
    let currentId: string | undefined = folderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    
    return path;
  },

  updateFolderNoteCounts: (noteCounts) => {
    set(state => ({
      folders: state.folders.map(folder => ({
        ...folder,
        noteCount: noteCounts[folder.id] || 0
      }))
    }));
  },

  canDeleteFolder: (folderId) => {
    const state = get();
    const hasChildren = state.folders.some(f => f.parentId === folderId);
    const noteCount = state.folders.find(f => f.id === folderId)?.noteCount || 0;
    
    // Can delete if no children and no notes, or user confirms
    return !hasChildren || noteCount === 0;
  },

  toggleFolderExpanded: (folderId) => {
    set(state => {
      const newExpandedFolders = new Set(state.expandedFolders);
      if (newExpandedFolders.has(folderId)) {
        newExpandedFolders.delete(folderId);
      } else {
        newExpandedFolders.add(folderId);
      }
      return { expandedFolders: newExpandedFolders };
    });
  },

  isExpanded: (folderId) => {
    return get().expandedFolders.has(folderId);
  },
})); 