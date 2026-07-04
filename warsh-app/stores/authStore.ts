import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, TOKEN_KEY } from "@services/storage";

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
  patchUser: (patch: Partial<User>) => void;
  setToken: (token: string) => void;
  clearSession: () => Promise<void>;
  setHydrated: (isHydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setSession: (user, token) => {
        set({ user, token });
        SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
      },
      patchUser: (patch) => set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user })),
      setToken: (token) => {
        set({ token });
        SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
      },
      clearSession: async () => {
        set({ user: null, token: null });
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        await AsyncStorage.removeItem(STORAGE_KEYS.auth);
      },
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => AsyncStorage),
      // The token is intentionally excluded here — it lives only in
      // SecureStore (OS keychain/keystore), not in this plain AsyncStorage
      // blob. It's loaded back into memory in onRehydrateStorage below.
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // `state.token` here is whatever was in the pre-upgrade AsyncStorage
        // blob (if any) — a one-time migration path so users aren't silently
        // logged out when this version first runs on their device.
        const legacyToken = state?.token ?? null;

        SecureStore.getItemAsync(TOKEN_KEY)
          .then(async (secureToken) => {
            if (secureToken) {
              useAuthStore.setState({ token: secureToken });
              return;
            }
            if (legacyToken) {
              await SecureStore.setItemAsync(TOKEN_KEY, legacyToken).catch(() => {});
              useAuthStore.setState({ token: legacyToken });
            } else {
              useAuthStore.setState({ token: null });
            }
          })
          .catch(() => {
            useAuthStore.setState({ token: null });
          })
          .finally(() => {
            state?.setHydrated(true);
          });
      },
    }
  )
);
