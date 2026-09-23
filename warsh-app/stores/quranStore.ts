import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_LAYOUT, type MushafLayout } from "../services/quran/data";
import type { QuranTranslation } from "../services/quran/translations";

// Quran reader state (Pen sections 27 and 28). Kept on the device only: the
// reader is free and offline, so nothing here waits on the backend. The
// place and bookmarks are ayahs (surah * 1000 + ayah), not pages, so they
// hold in either layout.
interface QuranState {
  layout: MushafLayout;
  lastAyah: number | null;
  lastReadAt: string | null;
  bookmarks: number[];
  tajweed: boolean;
  keepAwake: boolean;
  /** Translation shown under the page (Pen section 30); null = off. */
  translation: QuranTranslation | null;
  setLayout: (layout: MushafLayout) => void;
  setLastAyah: (ayah: number) => void;
  /** Bookmarks the page's opening ayah, or clears every bookmark on the page. */
  toggleBookmark: (pageAyahs: { first: number; next: number | null }) => void;
  setTajweed: (on: boolean) => void;
  setKeepAwake: (on: boolean) => void;
  setTranslation: (translation: QuranTranslation | null) => void;
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set) => ({
      layout: DEFAULT_LAYOUT,
      lastAyah: null,
      lastReadAt: null,
      bookmarks: [],
      tajweed: false,
      keepAwake: true,
      translation: null,
      setLayout: (layout) => set({ layout }),
      setLastAyah: (ayah) => set({ lastAyah: ayah, lastReadAt: new Date().toISOString() }),
      toggleBookmark: ({ first, next }) =>
        set((state) => {
          const onPage = (ayah: number) => ayah >= first && (next === null || ayah < next);
          return {
            bookmarks: state.bookmarks.some(onPage)
              ? state.bookmarks.filter((ayah) => !onPage(ayah))
              : [...state.bookmarks, first].sort((a, b) => a - b),
          };
        }),
      setTajweed: (tajweed) => set({ tajweed }),
      setKeepAwake: (keepAwake) => set({ keepAwake }),
      setTranslation: (translation) => set({ translation }),
    }),
    {
      name: "warsh_quran_reader",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Version 0 kept Madani page numbers and was never released; start
      // fresh rather than guess which ayah a page meant.
      migrate: (persisted, version) =>
        version === 0
          ? { ...(persisted as object), lastAyah: null, bookmarks: [] }
          : persisted,
    },
  ),
);
