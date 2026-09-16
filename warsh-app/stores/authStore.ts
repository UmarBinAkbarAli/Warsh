import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, getToken, saveToken, deleteToken } from "@services/storage";
import { forgetRestoreCredential } from "@services/restoreCredentials";

export interface User {
  id: string;
  email: string;
  name: string;
  nativeLanguage?: string;
  translationLanguage?: string;
  goal?: string;
  level?: string;
  xp?: number;
  placementType?: string | null;
  startingChapterOrder?: number | null;
  hasPassword?: boolean;
  // ISO YYYY-MM-DD. `null` = the age check has not been answered; `undefined`
  // = a session persisted before the field existed, so it must be fetched.
  dateOfBirth?: string | null;
  isMinor?: boolean | null;
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
    (set, get) => ({
      user: null,
      token: null,
      isHydrated: false,
      setSession: (user, token) => {
        set({ user, token });
        void saveToken(token);
      },
      patchUser: (patch) => set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user })),
      setToken: (token) => {
        set({ token });
        void saveToken(token);
      },
      clearSession: async () => {
        // Revoke this device's Android restore key first, while the token
        // still authenticates the call; otherwise a backup taken after
        // sign-out could restore the session on another phone.
        await forgetRestoreCredential(get().user?.id ?? null, get().token);
        set({ user: null, token: null });
        await deleteToken();
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

        // getToken() reads from SecureStore on native, AsyncStorage on web.
        getToken()
          .then(async (storedToken) => {
            if (storedToken) {
              useAuthStore.setState({ token: storedToken });
              return;
            }
            if (legacyToken) {
              await saveToken(legacyToken);
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
