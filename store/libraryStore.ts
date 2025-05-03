import { create } from 'zustand';

interface LibraryState {
  needsRefresh: boolean;
  setNeedsRefresh: (refresh: boolean) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  needsRefresh: false,
  setNeedsRefresh: (refresh) => set({ needsRefresh: refresh }),
}));