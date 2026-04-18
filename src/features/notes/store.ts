import { create } from 'zustand';

type NotesUIState = {
  sidebarOpen: boolean;
  commandOpen: boolean;
  quickCaptureOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setQuickCaptureOpen: (open: boolean) => void;
};

export const useNotesUI = create<NotesUIState>((set) => ({
  sidebarOpen: false,
  commandOpen: false,
  quickCaptureOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCommandOpen: (open) => set({ commandOpen: open }),
  setQuickCaptureOpen: (open) => set({ quickCaptureOpen: open }),
}));
