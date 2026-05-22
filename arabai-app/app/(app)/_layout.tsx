import { useEffect, useRef } from "react";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "../stores/authStore";
import {
  requestNotificationPermission,
  setupNotificationSchedules,
} from "../services/notifications";
import { setSentryUser, clearSentryUser } from "../services/sentry";
import { identifyUser, resetAnalytics } from "../services/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const PREFS_KEY = "warsh_settings";

async function initNotifications() {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  try {
    const [rawPrefs, progressRes] = await Promise.all([
      AsyncStorage.getItem(PREFS_KEY),
      api.get("/api/progress"),
    ]);
    const prefs = rawPrefs ? JSON.parse(rawPrefs) : {};
    const progress = progressRes.data.data;
    const userName = progress.userName ?? "friend";
    const currentStreak = progress.streak ?? 0;

    await setupNotificationSchedules(
      {
        dailyReminderEnabled: prefs.dailyReminderEnabled !== false,
        streakRiskEnabled: prefs.streakRiskEnabled !== false,
        milestoneEnabled: prefs.milestoneEnabled !== false,
        wordOfDayEnabled: prefs.wordOfDayEnabled !== false,
      },
      userName,
      currentStreak
    );
  } catch {
    // Non-critical — don't block the app
  }
}

export default function AppLayout() {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const notifListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/(auth)/login");
    }
  }, [isHydrated, token]);

  // Attach/detach error tracking + analytics identity on login/logout
  useEffect(() => {
    if (token && user) {
      setSentryUser(user.id);
      identifyUser(user.id, { goal: user.goal, level: user.level, native_language: user.nativeLanguage });
    } else {
      clearSentryUser();
      resetAnalytics();
    }
  }, [token, user]);

  useEffect(() => {
    if (!token) return;

    // Init schedules once on login
    initNotifications();

    // Clear badge when app opens
    Notifications.setBadgeCountAsync(0).catch(() => {});

    // Handle notification tap — deep link to the right screen
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen as string | undefined;
      if (screen === "learn") router.push("/(app)/(tabs)");
      else if (screen === "vocabulary") router.push("/(app)/(tabs)/vocabulary");
      else if (screen === "milestones") router.push("/milestones" as any);
    });

    return () => {
      if (notifListener.current) Notifications.removeNotificationSubscription(notifListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [token]);

  if (!isHydrated) return null;
  if (!token) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lessons/[chapterId]" />
      <Stack.Screen name="lessons/[lessonId]/play" />
      <Stack.Screen name="vocabulary/[topic]" />
      <Stack.Screen name="vocabulary/word/[wordId]" />
      <Stack.Screen name="vocabulary/review" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="tadabbur" />
      <Stack.Screen name="milestones" />
    </Stack>
  );
}
