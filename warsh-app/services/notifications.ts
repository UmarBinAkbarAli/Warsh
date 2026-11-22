import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { WarshPalette } from "../constants/theme";
import { translate } from "../i18n";
import { useAuthStore } from "../stores/authStore";
import type { AppLanguage } from "./language";
import { track } from "./analytics";

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
  // Before 1.0.22 the daily reminder was one repeating alarm under this id.
  legacyDailyReminder: "warsh-daily-reminder",
  dailyReminderPrefix: "warsh-daily-reminder-",
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

  // On Android 13+ expo-notifications reports "denied" for a permission that
  // was never asked (notifications stay off until POST_NOTIFICATIONS is
  // granted), so "denied" alone must not stop us. `canAskAgain` is false only
  // once the learner has refused for good (or on Android 12 and older, where
  // there is no runtime prompt and they switched notifications off).
  const { status: existing, canAskAgain } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  if (!canAskAgain) return false;

  await ensureReminderChannel(Notifications);

  const { status } = await Notifications.requestPermissionsAsync();
  track("notification_permission_result", { status });
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

// Device-local calendar date, so "today" matches the learner's own evening.
function localDateTag(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const DAILY_REMINDER_DAYS = 7;

async function cancelDailyReminders(Notifications: NotificationsModule) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(IDS.legacyDailyReminder).catch(() => {}),
    ...scheduled
      .filter((item) => item.identifier.startsWith(IDS.dailyReminderPrefix))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier).catch(() => {})),
  ]);
}

// One reminder per evening for the next week, as separate one-off alarms.
// A single repeating alarm cannot skip just today, so meeting the daily goal
// used to cancel it outright, and it only came back when the learner opened
// the app again — the very learner the reminder exists for. One-off alarms let
// today be skipped while tomorrow's stays, and stop after a week of silence
// instead of nagging forever. Every app open and finished lesson renews them.
async function scheduleDailyReminders(
  Notifications: NotificationsModule,
  title: string,
  body: string,
  skipToday: boolean
) {
  await cancelDailyReminders(Notifications);
  const now = new Date();
  for (let offset = 0; offset < DAILY_REMINDER_DAYS; offset++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 20, 0, 0);
    if (offset === 0 && (skipToday || at <= now)) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: `${IDS.dailyReminderPrefix}${localDateTag(at)}`,
      content: { title, body, data: { screen: "learn" }, sound: false },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: REMINDER_CHANNEL_ID },
    });
  }
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
  streakGoalDays?: number | null,
  // True once today's daily goal is met: no reminder tonight.
  skipToday = false
): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const permitted = await getNotificationPermissionStatus();
  if (permitted !== "granted") return;

  await ensureReminderChannel(Notifications);

  if (prefs.dailyReminderEnabled) {
    await scheduleDailyReminders(
      Notifications,
      t("notifications.dailyTitle", { name: userName.trim() || t("notifications.friend") }),
      t("notifications.dailyBody"),
      skipToday
    );
  } else {
    await cancelDailyReminders(Notifications);
  }

  if (skipToday) {
    await Notifications.cancelScheduledNotificationAsync(IDS.streakRisk()).catch(() => {});
  } else if (prefs.streakRiskEnabled && currentStreak >= 3) {
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

const SETTINGS_PREFS_KEY = "warsh_settings";

// Schedule reminders from the learner's saved preferences and current streak.
// With `ask`, show the system permission prompt when it can still be shown;
// without it, schedule only if permission was already granted. The prompt is
// asked after the learner's first finished lesson, never on app entry, because
// Android allows it to be shown at most twice. It is shown automatically only
// once per device; after a "no", the Settings switches can still ask.
const REMINDER_PROMPTED_KEY = "warsh_reminder_prompted_v1";

export async function enableReminders({ ask }: { ask: boolean }): Promise<void> {
  const [{ default: AsyncStorage }, { default: api }] = await Promise.all([
    import("@react-native-async-storage/async-storage"),
    import("./api"),
  ]);
  let granted = (await getNotificationPermissionStatus()) === "granted";
  if (!granted && ask && !(await AsyncStorage.getItem(REMINDER_PROMPTED_KEY))) {
    await AsyncStorage.setItem(REMINDER_PROMPTED_KEY, "1");
    granted = await requestNotificationPermission();
  }
  if (!granted) return;

  const [rawPrefs, progressRes] = await Promise.all([
    AsyncStorage.getItem(SETTINGS_PREFS_KEY),
    api.get("/api/progress"),
  ]);
  const prefs = rawPrefs ? JSON.parse(rawPrefs) : {};
  const progress = progressRes.data.data;
  await setupNotificationSchedules(
    {
      dailyReminderEnabled: prefs.dailyReminderEnabled !== false,
      streakRiskEnabled: prefs.streakRiskEnabled !== false,
      milestoneEnabled: prefs.milestoneEnabled !== false,
      wordOfDayEnabled: prefs.wordOfDayEnabled !== false,
    },
    progress.userName ?? "",
    progress.streak ?? 0,
    progress.streakGoalDays ?? null,
    progress.dailyGoalMet === true
  );
}

// App entry: keep existing reminders current, and ask learners who already
// finished a lesson before this prompt moved (they were never asked).
export async function initReminders(): Promise<void> {
  if ((await getNotificationPermissionStatus()) === "granted") {
    await enableReminders({ ask: false });
    return;
  }
  const [{ default: AsyncStorage }, { default: api }] = await Promise.all([
    import("@react-native-async-storage/async-storage"),
    import("./api"),
  ]);
  if (await AsyncStorage.getItem(REMINDER_PROMPTED_KEY)) return;
  const progress = (await api.get("/api/progress")).data.data;
  if (Array.isArray(progress.completedLessons) && progress.completedLessons.length > 0) {
    await enableReminders({ ask: true });
  }
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
