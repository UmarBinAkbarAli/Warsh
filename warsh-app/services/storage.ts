import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const STORAGE_KEYS = {
  auth: "auth-storage",
  onboarding: "onboarding_data"
};

// On native the JWT lives in the OS-encrypted keychain/keystore, not in the
// plain AsyncStorage blob the rest of the auth store persists to — AsyncStorage
// is readable without root from a debuggable/rooted device or an unencrypted
// local backup, and the token now stays valid for up to 90 days across refreshes.
//
// expo-secure-store has NO web implementation, so on web we fall back to
// AsyncStorage (localStorage). Without this, a browser user's token is never
// persisted and they are logged out on every page refresh.
export const TOKEN_KEY = "warsh_auth_token";

const isWeb = Platform.OS === "web";

export async function getToken(): Promise<string | null> {
  try {
    return isWeb
      ? await AsyncStorage.getItem(TOKEN_KEY)
      : await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  try {
    if (isWeb) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // Non-fatal — token still lives in memory for this session.
  }
}

export async function deleteToken(): Promise<void> {
  try {
    if (isWeb) await AsyncStorage.removeItem(TOKEN_KEY);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function setOnboarding(data: string) {
  return AsyncStorage.setItem(STORAGE_KEYS.onboarding, data);
}

export function getOnboarding() {
  return AsyncStorage.getItem(STORAGE_KEYS.onboarding);
}

export async function clearAuth() {
  await deleteToken();
  await AsyncStorage.removeItem(STORAGE_KEYS.auth);
}
