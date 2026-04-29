import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS } from "../services/storage";

export interface User {
  id: string;
  email: string;
  name: string;
  nativeLanguage?: string;
  goal?: string;
  level?: string;
  xp?: number;
  placementType?: string | null;
  startingChapterOrder?: number | null;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  setSession: (user: User, token: string) => void;
  clearSession: () => Promise<void>;
  setHydrated: (isHydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setSession: (user, token) => set({ user, token }),
      clearSession: async () => {
        set({ user: null, token: null });
        await AsyncStorage.removeItem(STORAGE_KEYS.auth);
      },
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
