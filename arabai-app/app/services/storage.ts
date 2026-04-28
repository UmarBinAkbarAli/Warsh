import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEYS = {
  token: "auth_token",
  user: "auth_user",
  onboarding: "onboarding_data"
};

export function setToken(token: string) {
  return AsyncStorage.setItem(STORAGE_KEYS.token, token);
}

export function getToken() {
  return AsyncStorage.getItem(STORAGE_KEYS.token);
}

export function removeToken() {
  return AsyncStorage.removeItem(STORAGE_KEYS.token);
}

export function setUser(user: string) {
  return AsyncStorage.setItem(STORAGE_KEYS.user, user);
}

export function getUser() {
  return AsyncStorage.getItem(STORAGE_KEYS.user);
}

export function removeUser() {
  return AsyncStorage.removeItem(STORAGE_KEYS.user);
}

export function setOnboarding(data: string) {
  return AsyncStorage.setItem(STORAGE_KEYS.onboarding, data);
}

export function getOnboarding() {
  return AsyncStorage.getItem(STORAGE_KEYS.onboarding);
}

export function clearAuth() {
  return Promise.all([removeToken(), removeUser()]);
}
