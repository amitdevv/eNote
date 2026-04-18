import { create } from 'zustand';

type NotesUIState = {
  sidebarOpen: boolean;
  commandOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
};

export const useNotesUI = create<NotesUIState>((set) => ({
  sidebarOpen: false, // used on mobile only
  commandOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCommandOpen: (open) => set({ commandOpen: open }),
}));
