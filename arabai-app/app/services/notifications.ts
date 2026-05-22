import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ─── identifiers ─────────────────────────────────────────────────────────────

function todayTag() {
  return new Date().toISOString().slice(0, 10);
}

const IDS = {
  dailyReminder: "warsh-daily-reminder",
  streakRisk: () => `warsh-streak-risk-${todayTag()}`,
  wordOfDay: "warsh-word-of-day",
};

// ─── permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  if (existing === "denied") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Warsh",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: "#9A8F6A",
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function getNotificationPermissionStatus(): Promise<"granted" | "denied" | "undetermined"> {
  if (!Device.isDevice) return "denied";
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// ─── scheduling helpers ───────────────────────────────────────────────────────

async function scheduleDailyAt(
  identifier: string,
  hour: number,
  minute: number,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  // Cancel any existing with this identifier
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, data: data ?? {}, sound: false },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

// ─── public API ───────────────────────────────────────────────────────────────

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
  const permitted = await getNotificationPermissionStatus();
  if (permitted !== "granted") return;

  // Daily reminder at 8 PM
  if (prefs.dailyReminderEnabled) {
    await scheduleDailyAt(
      IDS.dailyReminder,
      20, 0,
      `Time for today's lesson, ${userName}.`,
      "Even 5 minutes brings you closer. In shaa Allah.",
      { screen: "learn" }
    );
  } else {
    await Notifications.cancelScheduledNotificationAsync(IDS.dailyReminder).catch(() => {});
  }

  // Streak at risk at 8 PM (only if streak >= 3)
  if (prefs.streakRiskEnabled && currentStreak >= 3) {
    await scheduleDailyAt(
      IDS.streakRisk(),
      20, 0,
      `Your streak of ${currentStreak} days is at risk.`,
      "One lesson keeps it going. In shaa Allah.",
      { screen: "learn" }
    );
  }

  // Word of the Day at 9 AM
  if (prefs.wordOfDayEnabled !== false) {
    await scheduleDailyAt(
      IDS.wordOfDay,
      9, 0,
      "Today's word is ready.",
      "Open Warsh to see today's Arabic word.",
      { screen: "vocabulary" }
    );
  } else {
    await Notifications.cancelScheduledNotificationAsync(IDS.wordOfDay).catch(() => {});
  }
}

// Called when user completes their daily goal — cancel today's reminders
export async function cancelTodayReminders(): Promise<void> {
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(IDS.dailyReminder).catch(() => {}),
    Notifications.cancelScheduledNotificationAsync(IDS.streakRisk()).catch(() => {}),
  ]);
}

// Fire an immediate notification for a milestone unlock
export async function fireMilestoneNotification(milestoneTitle: string): Promise<void> {
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

// Cancel ALL scheduled Warsh notifications (e.g. on logout)
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
