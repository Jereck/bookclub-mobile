import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createAuthSlice, AuthSlice } from "./slices/authSlice";
import { createLibrarySlice, LibrarySlice } from "./slices/librarySlice";
import { createBookClubSlice, BookClubSlice } from "./slices/bookClubSlice";

type AppState = AuthSlice & LibrarySlice & BookClubSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createLibrarySlice(...a),
      ...createBookClubSlice(...a),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)