import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SettingsStore {
  defaultFont: string;
  defaultFontSize: number;

  setDefaultFont: (font: string) => void;
  setDefaultFontSize: (size: number) => void;

  clearAllData: () => Promise<void>;
  exportAllData: () => Promise<void>;
  resetToDefaults: () => void;
}

const defaultSettings = {
  defaultFont: 'Fira Code',
  defaultFontSize: 20,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setDefaultFont: (font) => set({ defaultFont: font }),
      setDefaultFontSize: (size) => set({ defaultFontSize: size }),

      clearAllData: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('You must be logged in to clear data');
          return;
        }

        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          toast.error('Failed to clear data');
          return;
        }

        toast.success('All data cleared successfully');
        window.location.reload();
      },

      exportAllData: async () => {
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
          toast.error('Failed to export data');
          return;
        }

        const exportData = {
          exportDate: new Date().toISOString(),
          user: { id: user.id, email: user.email },
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
      },

      resetToDefaults: () => {
        set(defaultSettings);
        toast.success('Settings reset to defaults');
      },
    }),
    {
      name: 'eNote-settings',
      version: 2,
    }
  )
);
