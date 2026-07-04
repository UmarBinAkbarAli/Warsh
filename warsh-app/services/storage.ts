import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const STORAGE_KEYS = {
  auth: "auth-storage",
  onboarding: "onboarding_data"
};

// The JWT lives in the OS-encrypted keychain/keystore, not in the plain
// AsyncStorage blob the rest of the auth store persists to — AsyncStorage
// is readable without root from a debuggable/rooted device or an
// unencrypted local backup, and the token now stays valid for up to 90
// days across refreshes.
export const TOKEN_KEY = "warsh_auth_token";

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setOnboarding(data: string) {
  return AsyncStorage.setItem(STORAGE_KEYS.onboarding, data);
}

export function getOnboarding() {
  return AsyncStorage.getItem(STORAGE_KEYS.onboarding);
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  await AsyncStorage.removeItem(STORAGE_KEYS.auth);
}
