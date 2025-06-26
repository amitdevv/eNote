import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Folder } from '@/types/note';
import { sampleFolders } from '@/lib/data';

interface FoldersStore {
  folders: Folder[];
  expandedFolders: Set<string>;
  
  // Actions
  setFolders: (folders: Folder[]) => void;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  getFolderById: (id: string) => Folder | undefined;
  getFoldersByParent: (parentId?: string) => Folder[];
  getFolderPath: (folderId: string) => Folder[];
  updateFolderNoteCounts: (noteCounts: Record<string, number>) => void;
  canDeleteFolder: (folderId: string) => boolean;
  
  // UI State
  toggleFolderExpanded: (folderId: string) => void;
  isExpanded: (folderId: string) => boolean;
}

// Helper function to ensure dates are Date objects
const ensureDatesAreObjects = (folders: Folder[]): Folder[] => {
  return folders.map(folder => ({
    ...folder,
    createdAt: folder.createdAt instanceof Date ? folder.createdAt : new Date(folder.createdAt),
    updatedAt: folder.updatedAt instanceof Date ? folder.updatedAt : new Date(folder.updatedAt),
  }));
};

// Check for data version to force migration if needed
const DATA_VERSION = '2.0';

// Default folder colors
const defaultColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-teal-500',
];

export const useFoldersStore = create<FoldersStore>()(
  persist(
    (set, get) => ({
      folders: sampleFolders,
      expandedFolders: new Set(),

      setFolders: (folders) => set({ folders: ensureDatesAreObjects(folders) }),

      addFolder: (folderData) => {
        console.log('Store addFolder called with:', folderData);
        const newFolder: Folder = {
          id: Date.now().toString(),
          name: folderData.name,
          parentId: folderData.parentId,
          color: folderData.color || 'bg-blue-500',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        console.log('Creating new folder:', newFolder);
        
        set(state => {
          console.log('Current folders before adding:', state.folders.length);
          const newState = { folders: [...state.folders, newFolder] };
          console.log('New folders count:', newState.folders.length);
          return newState;
        });
        
        return newFolder.id;
      },

      updateFolder: (id, updates) => {
        set(state => ({
          folders: state.folders.map(folder => 
            folder.id === id 
              ? { ...folder, ...updates, updatedAt: new Date() } 
              : folder
          )
        }));
      },

      deleteFolder: (id) => {
        const deleteRecursively = (folderId: string, folders: Folder[]): Folder[] => {
          const childFolders = folders.filter(f => f.parentId === folderId);
          let remainingFolders = folders.filter(f => f.id !== folderId);
          
          childFolders.forEach(child => {
            remainingFolders = deleteRecursively(child.id, remainingFolders);
          });
          
          return remainingFolders;
        };

        set(state => ({
          folders: deleteRecursively(id, state.folders),
          expandedFolders: new Set([...state.expandedFolders].filter(fId => fId !== id))
        }));
      },

      getFolderById: (id) => {
        return get().folders.find(folder => folder.id === id);
      },

      getFoldersByParent: (parentId) => {
        return get().folders.filter(folder => folder.parentId === parentId);
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
    }),
    {
      name: 'folders-storage',
      version: 1,
      partialize: (state) => ({ 
        folders: state.folders,
        expandedFolders: Array.from(state.expandedFolders)
      }),
      // Add custom serialization/deserialization for dates and Sets
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const data = JSON.parse(str);
            
            // Check for version mismatch or corrupted data
            const storedVersion = localStorage.getItem('folders-storage-version');
            if (storedVersion !== DATA_VERSION) {
              console.log('Folders data version mismatch, clearing storage for fresh start');
              localStorage.removeItem(name);
              localStorage.setItem('folders-storage-version', DATA_VERSION);
              return null;
            }
            
            // Convert date strings back to Date objects and arrays back to Sets
            if (data.state?.folders) {
              try {
                data.state.folders = ensureDatesAreObjects(data.state.folders);
              } catch (error) {
                console.error('Error converting folder dates, clearing storage:', error);
                localStorage.removeItem(name);
                return null;
              }
            }
            if (data.state?.expandedFolders && Array.isArray(data.state.expandedFolders)) {
              data.state.expandedFolders = new Set(data.state.expandedFolders);
            } else {
              data.state.expandedFolders = new Set();
            }
            return data;
          } catch (error) {
            console.error('Error parsing stored folders, clearing storage:', error);
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
          localStorage.setItem('folders-storage-version', DATA_VERSION);
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          localStorage.removeItem('folders-storage-version');
        },
      },
    }
  )
); 