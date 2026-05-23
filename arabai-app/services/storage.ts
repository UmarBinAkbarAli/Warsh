import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  auth: "auth-storage",
  onboarding: "onboarding_data"
};

type PersistedAuthState = {
  state?: {
    token?: string | null;
    user?: string | { id: string; email: string; name: string } | null;
  };
};

async function getPersistedAuthState() {
  const rawAuth = await AsyncStorage.getItem(STORAGE_KEYS.auth);
  if (!rawAuth) {
    return null;
  }

  try {
    return JSON.parse(rawAuth) as PersistedAuthState;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEYS.auth);
    return null;
  }
}

export async function getToken() {
  const authState = await getPersistedAuthState();
  return authState?.state?.token ?? null;
}

export function setOnboarding(data: string) {
  return AsyncStorage.setItem(STORAGE_KEYS.onboarding, data);
}

export function getOnboarding() {
  return AsyncStorage.getItem(STORAGE_KEYS.onboarding);
}

export function clearAuth() {
  return AsyncStorage.removeItem(STORAGE_KEYS.auth);
}
