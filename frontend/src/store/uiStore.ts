import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  globalTimeWindow: string;
  setGlobalTimeWindow: (window: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  globalTimeWindow: '24h',
  setGlobalTimeWindow: (window) => set({ globalTimeWindow: window }),
}));
