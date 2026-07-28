import { useCallback } from "react";
import { useRouter } from "expo-router";
import api from "@services/api";
import { useAuthStore } from "@stores/authStore";
import { cancelAllNotifications } from "@services/notifications";
import { signOutGoogle } from "@services/googleSignIn";

export function useAuth() {
  const { user, token, isHydrated, setSession, clearSession } = useAuthStore();
  const router = useRouter();

  async function login(email: string, password: string) {
    const response = await api.post("/api/auth/login", { email, password });
    const data = response.data.data;
    setSession(data.user, data.token);
    return data;
  }

  async function register(name: string, email: string, password: string, nativeLanguage: string, translationLanguage: string, goal: string, dailyGoalMinutes?: number) {
    const response = await api.post("/api/auth/register", { name, email, password, nativeLanguage, translationLanguage, goal, dailyGoalMinutes });
    const data = response.data.data;
    setSession(data.user, data.token);
    return data;
  }

  const loginWithGoogle = useCallback(async (
    idToken: string,
    onboarding: {
      nativeLanguage?: string;
      translationLanguage?: string;
      goal?: string;
      dailyGoalMinutes?: number;
    },
  ) => {
    const response = await api.post("/api/auth/google", { idToken, ...onboarding });
    const data = response.data.data;
    setSession(data.user, data.token);
    return data;
  }, [setSession]);

  const linkGoogleAccount = useCallback(async (linkToken: string, password: string) => {
    const response = await api.post("/api/auth/google/link", { linkToken, password });
    const data = response.data.data;
    setSession(data.user, data.token);
    return data;
  }, [setSession]);

  const applyPlacement = useCallback(async (placementType: string) => {
    const response = await api.post("/api/placement/apply", { placementType });
    return response.data.data;
  }, []);

  async function logout() {
    await cancelAllNotifications().catch(() => {});
    await signOutGoogle().catch(() => {});
    await clearSession();
    router.replace("/(auth)/login");
  }

  return {
    user,
    token,
    isLoading: !isHydrated,
    login,
    register,
    loginWithGoogle,
    linkGoogleAccount,
    applyPlacement,
    logout
  };
}
