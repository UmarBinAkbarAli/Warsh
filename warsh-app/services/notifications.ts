import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { WarshPalette } from "../constants/theme";

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

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const Notifications = await getNotifications();
  if (!Notifications) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  if (existing === "denied") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Warsh",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: WarshPalette.gold,
    });
  }

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
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
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
  currentStreak: number
): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const permitted = await getNotificationPermissionStatus();
  if (permitted !== "granted") return;

  if (prefs.dailyReminderEnabled) {
    await scheduleDailyAt(
      IDS.dailyReminder,
      20,
      0,
      `Time for today's lesson, ${userName}.`,
      "Even 5 minutes brings you closer. In shaa Allah.",
      { screen: "learn" }
    );
  } else {
    await Notifications.cancelScheduledNotificationAsync(IDS.dailyReminder).catch(() => {});
  }

  if (prefs.streakRiskEnabled && currentStreak >= 3) {
    await scheduleDailyAt(
      IDS.streakRisk(),
      20,
      0,
      `Your streak of ${currentStreak} days is at risk.`,
      "One lesson keeps it going. In shaa Allah.",
      { screen: "learn" }
    );
  }

  if (prefs.wordOfDayEnabled !== false) {
    await scheduleDailyAt(
      IDS.wordOfDay,
      9,
      0,
      "Today's word is ready.",
      "Open Warsh to see today's Arabic word.",
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

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Milestone unlocked: ${milestoneTitle}`,
      body: "Open Warsh to see your achievement.",
      data: { screen: "milestones" },
      sound: false,
    },
    trigger: null,
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
