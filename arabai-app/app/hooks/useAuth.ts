import { useRouter } from "expo-router";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";

export function useAuth() {
  const { user, token, isHydrated, setSession, clearSession } = useAuthStore();
  const router = useRouter();

  async function login(email: string, password: string) {
    const response = await api.post("/api/auth/login", { email, password });
    const data = response.data.data;
    setSession(data.user, data.token);
    return data;
  }

  async function register(name: string, email: string, password: string, nativeLanguage: string, goal: string) {
    const response = await api.post("/api/auth/register", { name, email, password, nativeLanguage, goal });
    const data = response.data.data;
    setSession(data.user, data.token);
    return data;
  }

  async function logout() {
    await clearSession();
    router.replace("/(auth)/login");
  }

  return {
    user,
    token,
    isLoading: !isHydrated,
    login,
    register,
    logout
  };
}
