import { useEffect, useRef } from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { Platform, useWindowDimensions, View } from "react-native";
import { useAuthStore } from "@stores/authStore";
import { WebAppSidebar } from "@components/WebAppSidebar";
import { Colors } from "../../constants/theme";
import {
  addNotificationResponseListener,
  clearNotificationBadge,
  requestNotificationPermission,
  setupNotificationSchedules,
} from "@services/notifications";
import { setSentryUser, clearSentryUser } from "@services/sentry";
import { identifyUser, resetAnalytics } from "@services/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@services/api";

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
    const streakGoalDays = progress.streakGoalDays ?? null;

    await setupNotificationSchedules(
      {
        dailyReminderEnabled: prefs.dailyReminderEnabled !== false,
        streakRiskEnabled: prefs.streakRiskEnabled !== false,
        milestoneEnabled: prefs.milestoneEnabled !== false,
        wordOfDayEnabled: prefs.wordOfDayEnabled !== false,
      },
      userName,
      currentStreak,
      streakGoalDays
    );
  } catch {
    // Non-critical — don't block the app
  }
}

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const responseListener = useRef<{ remove: () => void } | null>(null);

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
    void initNotifications();

    // Clear badge when app opens
    void clearNotificationBadge();

    // Handle notification tap — deep link to the right screen
    addNotificationResponseListener((screen) => {
      if (screen === "learn") router.push("/(app)/(tabs)");
      else if (screen === "vocabulary") router.push("/(app)/(tabs)/vocabulary");
      else if (screen === "milestones") router.push("/milestones" as any);
    }).then((listener) => {
      responseListener.current = listener;
    }).catch(() => {});

    return () => {
      responseListener.current?.remove();
      responseListener.current = null;
    };
  }, [token]);

  if (!isHydrated) return null;
  if (!token) return null;

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="lessons/[chapterId]" />
      <Stack.Screen name="lessons/[lessonId]/play" />
      <Stack.Screen name="vocabulary/[topic]" />
      <Stack.Screen name="vocabulary/word/[wordId]" />
      <Stack.Screen name="vocabulary/review" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="manage-subscription" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="tadabbur" />
      <Stack.Screen name="milestones" />
      <Stack.Screen name="milestone-celebration" />
      <Stack.Screen name="streak-celebration" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="streak-detail" />
      <Stack.Screen name="surah-celebration" />
      <Stack.Screen name="vocabulary/my-words" />
      <Stack.Screen name="vocabulary/search" />
      <Stack.Screen name="chapters" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="share-stats" />
    </Stack>
  );

  const isFocusedExperience =
    pathname.includes("/play") ||
    pathname.includes("/review") ||
    pathname.includes("celebration") ||
    pathname.includes("/paywall");
  const desktopWeb =
    Platform.OS === "web" && width >= 960 && !isFocusedExperience;

  if (!desktopWeb) return stack;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        backgroundColor: Colors.bg.primary,
      }}
    >
      <WebAppSidebar />
      <View style={{ flex: 1, minWidth: 0 }}>{stack}</View>
    </View>
  );
}
