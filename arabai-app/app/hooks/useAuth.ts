import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { setToken, setUser, getToken, getUser, clearAuth } from "../services/storage";

export function useAuth() {
  const { user, token, setUser: setUserState, logout: logoutStore } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const storedToken = await getToken();
      const storedUser = await getUser();
      if (storedToken && storedUser) {
        try {
          setUserState(JSON.parse(storedUser), storedToken);
        } catch {
          await clearAuth();
        }
      }
      setIsLoading(false);
    }

    load();
  }, [setUserState]);

  async function login(email: string, password: string) {
    const response = await api.post("/api/auth/login", { email, password });
    const data = response.data.data;
    await setToken(data.token);
    await setUser(JSON.stringify(data.user));
    setUserState(data.user, data.token);
    return data;
  }

  async function register(name: string, email: string, password: string, nativeLanguage: string, goal: string) {
    const response = await api.post("/api/auth/register", { name, email, password, nativeLanguage, goal });
    return response.data.data;
  }

  async function logout() {
    await clearAuth();
    logoutStore();
    router.replace("/(auth)/login");
  }

  return {
    user,
    token,
    isLoading,
    login,
    register,
    logout
  };
}
