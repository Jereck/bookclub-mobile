import { StateCreator } from "zustand";
import { BookshelfEntry } from "../../lib/api/types";

export interface BookshelfSlice {
  bookshelf: BookshelfEntry[];
  bookshelfTotal: number;
  currentPage: number;
  pageSize: number;
  needsRefresh: boolean;
  setBookshelf: (entries: BookshelfEntry[], total: number) => void;
  addToBookshelf: (entry: BookshelfEntry) => void;
  setCurrentPage: (page: number) => void;
  setNeedsRefresh: (refresh: boolean) => void;
  resetBookshelf: () => void;
}

export const createBookshelfSlice: StateCreator<BookshelfSlice, [], [], BookshelfSlice> = (set) => ({
  bookshelf: [],
  bookshelfTotal: 0,
  currentPage: 1,
  pageSize: 10,
  needsRefresh: false,

  setBookshelf: (entries, total) => set({ bookshelf: entries, bookshelfTotal: total }),
  addToBookshelf: (entry) => set((state) => ({ bookshelf: [entry, ...state.bookshelf] })),
  setCurrentPage: (page) => set({ currentPage: page }),
  setNeedsRefresh: (refresh) => set({ needsRefresh: refresh }),
  resetBookshelf: () => set({ bookshelf: [], bookshelfTotal: 0, currentPage: 1 }),
});
