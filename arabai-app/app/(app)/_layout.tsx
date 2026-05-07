import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "../stores/authStore";

export default function AppLayout() {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/(auth)/login");
    }
  }, [isHydrated, token]);

  if (!isHydrated) {
    return null;
  }

  if (!token) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lessons/[chapterId]" />
      <Stack.Screen name="lessons/[lessonId]/play" />
    </Stack>
  );
}
