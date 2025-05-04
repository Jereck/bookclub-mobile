import { StateCreator } from 'zustand'

export interface Book {
  id: number
  title: string
  author?: string
  coverUrl?: string
  image?: string
  read?: boolean
}

export interface LibrarySlice {
  books: Book[]
  total: number
  currentPage: number
  pageSize: number
  needsRefresh: boolean
  setBooks: (books: Book[], total: number) => void
  addBook: (book: Book) => void
  setCurrentPage: (page: number) => void
  setNeedsRefresh: (refresh: boolean) => void
  resetLibrary: () => void
}

export const createLibrarySlice: StateCreator<LibrarySlice, [], [], LibrarySlice> = (set) => ({
  books: [],
  total: 0,
  currentPage: 1,
  pageSize: 10,
  needsRefresh: false,

  setBooks: (books, total) => set({ books, total }),
  addBook: (book) => set((state) => ({ books: [book, ...state.books] })),
  setCurrentPage: (page) => set({ currentPage: page }),
  setNeedsRefresh: (refresh) => set({ needsRefresh: refresh }),
  resetLibrary: () => set({ books: [], total: 0, currentPage: 1 }),
})
