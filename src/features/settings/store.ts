import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Density = 'compact' | 'default' | 'comfortable';

type SettingsState = {
  density: Density;
  setDensity: (d: Density) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      density: 'default',
      setDensity: (density) => set({ density }),
    }),
    { name: 'enote-settings' }
  )
);
