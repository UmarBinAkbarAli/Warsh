import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Quran reader state (Pen section 27). Kept on the device only: the reader
// is free and offline, so nothing here waits on the backend.
interface QuranState {
  lastPage: number | null;
  lastReadAt: string | null;
  bookmarks: number[];
  tajweed: boolean;
  keepAwake: boolean;
  setLastPage: (page: number) => void;
  toggleBookmark: (page: number) => void;
  setTajweed: (on: boolean) => void;
  setKeepAwake: (on: boolean) => void;
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set) => ({
      lastPage: null,
      lastReadAt: null,
      bookmarks: [],
      tajweed: false,
      keepAwake: true,
      setLastPage: (page) => set({ lastPage: page, lastReadAt: new Date().toISOString() }),
      toggleBookmark: (page) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(page)
            ? state.bookmarks.filter((p) => p !== page)
            : [...state.bookmarks, page].sort((a, b) => a - b),
        })),
      setTajweed: (tajweed) => set({ tajweed }),
      setKeepAwake: (keepAwake) => set({ keepAwake }),
    }),
    {
      name: "warsh_quran_reader",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
