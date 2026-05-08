import axios from "axios";
import { getToken } from "./storage";
import { useAuthStore } from "../stores/authStore";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || "https://warsh-backend.vercel.app";

const api = axios.create({
  baseURL: API_BASE_URL,
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

export default api;
