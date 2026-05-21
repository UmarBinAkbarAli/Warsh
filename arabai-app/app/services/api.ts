import axios from "axios";
import { getToken } from "./storage";
import { useAuthStore } from "../stores/authStore";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || "https://warsh-backend.vercel.app";
const API_TIMEOUT_MS = 10000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token ?? await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
