import { MMKV } from "react-native-mmkv";

const storage = new MMKV({ id: "arabai" });

export const STORAGE_KEYS = {
  token: "auth_token",
  user: "auth_user",
  onboarding: "onboarding_data"
};

export function setToken(token: string) {
  storage.set(STORAGE_KEYS.token, token);
}

export function getToken() {
  return storage.getString(STORAGE_KEYS.token);
}

export function removeToken() {
  storage.delete(STORAGE_KEYS.token);
}

export function setUser(user: string) {
  storage.set(STORAGE_KEYS.user, user);
}

export function getUser() {
  return storage.getString(STORAGE_KEYS.user);
}

export function removeUser() {
  storage.delete(STORAGE_KEYS.user);
}

export function setOnboarding(data: string) {
  storage.set(STORAGE_KEYS.onboarding, data);
}

export function getOnboarding() {
  return storage.getString(STORAGE_KEYS.onboarding);
}

export function clearAuth() {
  removeToken();
  removeUser();
}
