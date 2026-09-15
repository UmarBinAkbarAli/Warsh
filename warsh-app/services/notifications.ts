import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { WarshPalette } from "../constants/theme";
import { translate } from "../i18n";
import { useAuthStore } from "../stores/authStore";
import type { AppLanguage } from "./language";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null | undefined;
let handlerConfigured = false;

function todayTag() {
  return new Date().toISOString().slice(0, 10);
}

function isExpoGo() {
  return Constants.appOwnership === "expo";
}

async function getNotifications() {
  // Push notifications are a native-only feature for Warsh. Skip entirely on
  // web so the browser learning experience never touches unsupported APIs.
  if (Platform.OS === "web") {
    return null;
  }
  if (isExpoGo()) {
    return null;
  }

  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  try {
    notificationsModule = await import("expo-notifications");
  } catch {
    notificationsModule = null;
  }

  if (notificationsModule && !handlerConfigured) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  }

  return notificationsModule;
}

const IDS = {
  dailyReminder: "warsh-daily-reminder",
  streakRisk: () => `warsh-streak-risk-${todayTag()}`,
  wordOfDay: "warsh-word-of-day",
};

// Same id the app has always used, so devices that already have the channel
// get it renamed in place instead of a second entry in Android settings.
const REMINDER_CHANNEL_ID = "default";

// Notifications are scheduled outside React, so read the interface language
// straight from the store rather than through `useLanguage()`.
function currentLanguage(): AppLanguage {
  return useAuthStore.getState().user?.nativeLanguage === "ur" ? "ur" : "en";
}

function t(key: string, params?: Record<string, string | number>) {
  return translate(currentLanguage(), key, params);
}

// Android drops any notification without a channel into a system channel it
// labels "Miscellaneous" in settings. Create ours on every scheduling path,
// not only when asking for permission, so it exists even when permission was
// granted earlier (reinstall, or granted at first launch).
async function ensureReminderChannel(Notifications: NotificationsModule) {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: t("notifications.channelName"),
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250],
    lightColor: WarshPalette.gold,
  }).catch(() => {});
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const Notifications = await getNotifications();
  if (!Notifications) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  if (existing === "denied") return false;

  await ensureReminderChannel(Notifications);

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getNotificationPermissionStatus(): Promise<"granted" | "denied" | "undetermined"> {
  if (!Device.isDevice) return "denied";

  const Notifications = await getNotifications();
  if (!Notifications) return "denied";

  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

async function scheduleDailyAt(
  identifier: string,
  hour: number,
  minute: number,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, data: data ?? {}, sound: false },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
}

export interface NotificationPrefs {
  dailyReminderEnabled: boolean;
  streakRiskEnabled: boolean;
  milestoneEnabled: boolean;
  wordOfDayEnabled?: boolean;
}

export async function setupNotificationSchedules(
  prefs: NotificationPrefs,
  userName: string,
  currentStreak: number,
  streakGoalDays?: number | null
): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const permitted = await getNotificationPermissionStatus();
  if (permitted !== "granted") return;

  await ensureReminderChannel(Notifications);

  if (prefs.dailyReminderEnabled) {
    await scheduleDailyAt(
      IDS.dailyReminder,
      20,
      0,
      t("notifications.dailyTitle", { name: userName.trim() || t("notifications.friend") }),
      t("notifications.dailyBody"),
      { screen: "learn" }
    );
  } else {
    await Notifications.cancelScheduledNotificationAsync(IDS.dailyReminder).catch(() => {});
  }

  if (prefs.streakRiskEnabled && currentStreak >= 3) {
    const daysToGoal = streakGoalDays ? streakGoalDays - currentStreak : 0;
    const streakRiskBody =
      streakGoalDays && daysToGoal > 0
        ? t(daysToGoal === 1 ? "notifications.streakBodyGoalOne" : "notifications.streakBodyGoal", {
            left: daysToGoal,
            goal: streakGoalDays,
          })
        : t("notifications.streakBody");
    await scheduleDailyAt(
      IDS.streakRisk(),
      20,
      0,
      t("notifications.streakTitle", { count: currentStreak }),
      streakRiskBody,
      { screen: "learn" }
    );
  }

  if (prefs.wordOfDayEnabled !== false) {
    await scheduleDailyAt(
      IDS.wordOfDay,
      9,
      0,
      t("notifications.wordTitle"),
      t("notifications.wordBody"),
      { screen: "vocabulary" }
    );
  } else {
    await Notifications.cancelScheduledNotificationAsync(IDS.wordOfDay).catch(() => {});
  }
}

export async function cancelTodayReminders(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(IDS.dailyReminder).catch(() => {}),
    Notifications.cancelScheduledNotificationAsync(IDS.streakRisk()).catch(() => {}),
  ]);
}

export async function fireMilestoneNotification(milestoneTitle: string): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const permitted = await getNotificationPermissionStatus();
  if (permitted !== "granted") return;

  await ensureReminderChannel(Notifications);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: t("notifications.milestoneTitle", { title: milestoneTitle }),
      body: t("notifications.milestoneBody"),
      data: { screen: "milestones" },
      sound: false,
    },
    // On Android a bare `null` trigger also lands in "Miscellaneous";
    // a channel-only trigger still fires immediately.
    trigger: Platform.OS === "android" ? { channelId: REMINDER_CHANNEL_ID } : null,
  });
}

export async function cancelAllNotifications(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function clearNotificationBadge(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  await Notifications.setBadgeCountAsync(0).catch(() => {});
}

export async function addNotificationResponseListener(
  onScreen: (screen: string | undefined) => void
): Promise<{ remove: () => void } | null> {
  const Notifications = await getNotifications();
  if (!Notifications) return null;

  return Notifications.addNotificationResponseReceivedListener((response) => {
    const screen = response.notification.request.content.data?.screen;
    onScreen(typeof screen === "string" ? screen : undefined);
  });
}
