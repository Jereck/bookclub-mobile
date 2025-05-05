import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createAuthSlice, AuthSlice } from "./slices/authSlice";
import { createBookSlice, BookSlice } from "./slices/bookSlice";
import { createBookshelfSlice, BookshelfSlice } from "./slices/bookshelfSlice";
import { createBookClubSlice, BookClubSlice } from "./slices/bookClubSlice";

type AppState = AuthSlice & BookSlice & BookshelfSlice & BookClubSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createBookSlice(...args),
      ...createBookshelfSlice(...args),
      ...createBookClubSlice(...args),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // from authSlice
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,

        // from bookShelfSlice
        books: state.bookshelf,
        bookshelfTotal: state.bookshelfTotal,
        currentPage: state.currentPage,
        pageSize: state.pageSize,

        // from bookClubSlice
        clubs: state.clubs,
        invites: state.invites,
      }),
    }
  )
)