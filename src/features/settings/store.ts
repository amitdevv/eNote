import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Density = 'compact' | 'default' | 'comfortable';
export type UIFont = 'inter' | 'geist' | 'system';
export type EditorFont = 'inter' | 'geist' | 'lora' | 'mono';

type SettingsState = {
  density: Density;
  uiFont: UIFont;
  editorFont: EditorFont;
  setDensity: (d: Density) => void;
  setUIFont: (f: UIFont) => void;
  setEditorFont: (f: EditorFont) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      density: 'default',
      uiFont: 'inter',
      editorFont: 'inter',
      setDensity: (density) => set({ density }),
      setUIFont: (uiFont) => set({ uiFont }),
      setEditorFont: (editorFont) => set({ editorFont }),
    }),
    { name: 'enote-settings' },
  ),
);
