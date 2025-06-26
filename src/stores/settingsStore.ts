import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SettingsStore {
  // App Settings
  defaultFont: string;
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  confirmDelete: boolean;
  showWordCount: boolean;
  
  // UI Settings
  compactMode: boolean;
  showPreview: boolean;
  
  // Actions
  setDefaultFont: (font: string) => void;
  setAutoSave: (enabled: boolean) => void;
  setAutoSaveInterval: (seconds: number) => void;
  setConfirmDelete: (enabled: boolean) => void;
  setShowWordCount: (enabled: boolean) => void;
  setCompactMode: (enabled: boolean) => void;
  setShowPreview: (enabled: boolean) => void;
  
  // Data Management
  clearAllData: () => Promise<void>;
  exportAllData: () => Promise<void>;
  
  // Reset
  resetToDefaults: () => void;
}

const defaultSettings = {
  defaultFont: 'Inter',
  autoSave: true,
  autoSaveInterval: 2,
  confirmDelete: true,
  showWordCount: true,
  compactMode: false,
  showPreview: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setDefaultFont: (font) => set({ defaultFont: font }),
      setAutoSave: (enabled) => set({ autoSave: enabled }),
      setAutoSaveInterval: (seconds) => set({ autoSaveInterval: seconds }),
      setConfirmDelete: (enabled) => set({ confirmDelete: enabled }),
      setShowWordCount: (enabled) => set({ showWordCount: enabled }),
      setCompactMode: (enabled) => set({ compactMode: enabled }),
      setShowPreview: (enabled) => set({ showPreview: enabled }),

      clearAllData: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast.error('You must be logged in to clear data');
            return;
          }

          // Delete all notes for the user
          const { error } = await supabase
            .from('notes')
            .delete()
            .eq('user_id', user.id);

          if (error) {
            console.error('Error clearing data:', error);
            toast.error('Failed to clear data');
            return;
          }

          toast.success('All data cleared successfully');
          
          // Refresh the page to clear any cached data
          window.location.reload();
        } catch (error) {
          console.error('Error clearing data:', error);
          toast.error('Failed to clear data');
        }
      },

      exportAllData: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast.error('You must be logged in to export data');
            return;
          }

          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id);

          if (error) {
            console.error('Error exporting data:', error);
            toast.error('Failed to export data');
            return;
          }

          const exportData = {
            exportDate: new Date().toISOString(),
            user: {
              id: user.id,
              email: user.email,
            },
            notes: data,
            settings: get(),
          };

          const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
          });
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `eNote-backup-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast.success('Data exported successfully');
        } catch (error) {
          console.error('Error exporting data:', error);
          toast.error('Failed to export data');
        }
      },

      resetToDefaults: () => {
        set(defaultSettings);
        toast.success('Settings reset to defaults');
      },
    }),
    {
      name: 'eNote-settings',
      version: 1,
    }
  )
); 