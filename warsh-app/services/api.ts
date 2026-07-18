import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import { getToken } from "./storage";
import { useAuthStore } from "@stores/authStore";

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

type AppEnvironment = "development" | "staging" | "production";

const APP_ENVIRONMENT: AppEnvironment = process.env.EXPO_PUBLIC_ENVIRONMENT ?? "production";
const API_TIMEOUT_MS = 20000;

function getApiBaseUrl() {
  const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!rawApiUrl) {
    throw new Error(`EXPO_PUBLIC_API_URL must be set for ${APP_ENVIRONMENT} builds.`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawApiUrl);
  } catch {
    throw new Error("EXPO_PUBLIC_API_URL must be a valid absolute URL.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "10.0.2.2" ||
    hostname.endsWith(".local");

  if (APP_ENVIRONMENT !== "development" && parsedUrl.protocol !== "https:") {
    throw new Error("EXPO_PUBLIC_API_URL must use HTTPS outside development.");
  }

  if (APP_ENVIRONMENT !== "development" && isLocalHost) {
    throw new Error("EXPO_PUBLIC_API_URL cannot point to a local host outside development.");
  }

  return parsedUrl.toString().replace(/\/$/, "");
}

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    "X-Warsh-Platform": Platform.OS,
  }
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token ?? await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    // Only attempt refresh once, and never for auth endpoints themselves.
    const url = config?.url ?? "";
    const isAuthEndpoint = url.includes("/api/auth/");

    if (
      error.response?.status === 401 &&
      config &&
      !config._retried &&
      !isAuthEndpoint
    ) {
      config._retried = true;

      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${currentToken}` }, timeout: API_TIMEOUT_MS }
        );
        const newToken: string = refreshResponse.data.data.token;
        useAuthStore.getState().setToken(newToken);
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      } catch {
        await useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export function isSubscriptionRequiredError(error: unknown) {
  return axios.isAxiosError(error) &&
    error.response?.status === 402 &&
    error.response?.data?.code === "subscription_required";
}

export function getVocabularyWords(params?: { topic?: string; search?: string; page?: number }) {
  return api.get("/api/vocabulary/words", { params });
}

export function getWordOfDay() {
  return api.get("/api/vocabulary/word-of-day");
}

export function getVocabularyWordDetail(wordId: string) {
  return api.get(`/api/vocabulary/words/${wordId}`);
}

export function updateUserVocabularyWord(wordId: string, data: { isFavorite?: boolean; isHidden?: boolean; markForReview?: boolean }) {
  return api.patch(`/api/vocabulary/words/${wordId}/user`, data);
}

export function getSRSDueWords() {
  return api.get("/api/vocabulary/srs/due");
}

export function submitSRSReview(wordId: string, quality: 2 | 4 | 5) {
  return api.post("/api/vocabulary/srs/review", { wordId, quality });
}

export function updateUserProfile(data: { dailyGoalMinutes?: number; nativeLanguage?: string; translationLanguage?: string }) {
  return api.patch("/api/users/me", data);
}

export function deleteAccount() {
  return api.delete("/api/users/me");
}

export function getTadabbur() {
  return api.get("/api/tadabbur");
}

export function getTadabburSurah(surahId: string) {
  return api.get(`/api/tadabbur/${surahId}`);
}

export function getSubscriptionStatus() {
  return api.get("/api/subscription/status");
}

export function verifyPurchase(data: { productId: string; purchaseToken?: string; receiptData?: string; platform: "android" | "ios" }) {
  return api.post("/api/subscription/verify", data);
}

export function purchaseNoorPack(data: { purchaseToken: string; platform: "android" | "ios" }) {
  return api.post("/api/noor/purchase-pack", data);
}

export function redeemPromoCode(code: string) {
  return api.post("/api/subscription/redeem-promo", { code });
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.code === "ECONNABORTED") {
    return "The server did not respond in time. Check that the backend is running, then try again.";
  }

  if (!error.response) {
    return "Warsh could not reach the backend. Check your connection or local API URL, then try again.";
  }

  if (error.response.status === 401) {
    return "The email or password was not accepted. Please check them and try again.";
  }

  const serverMessage = error.response.data?.error;
  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage;
  }

  return fallback;
}

export default api;
