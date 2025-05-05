import { StateCreator } from 'zustand';
import { Book } from '../../lib/api/types';

export interface BookSlice {
  catalog: Book[];
  catalogTotal: number;
  catalogPage: number;
  setCatalog: (books: Book[], total: number) => void;
  setCatalogPage: (page: number) => void;
  resetCatalog: () => void;
}

export const createBookSlice: StateCreator<BookSlice, [], [], BookSlice> = (set) => ({
  catalog: [],
  catalogTotal: 0,
  catalogPage: 1,

  setCatalog: (books, total) => set({ catalog: books, catalogTotal: total }),
  setCatalogPage: (page) => set({ catalogPage: page }),
  resetCatalog: () => set({ catalog: [], catalogTotal: 0, catalogPage: 1 }),
});