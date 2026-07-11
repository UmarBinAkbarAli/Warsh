import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import api, { API_BASE_URL, updateUserProfile, deleteAccount } from "@services/api";
import { useAuthStore } from "@stores/authStore";
import {
  requestNotificationPermission,
  setupNotificationSchedules,
  cancelAllNotifications,
} from "@services/notifications";
import { isSentrySmokeTestEnabled, sendSentrySmokeTest } from "@services/sentry";
import { useT } from "@i18n/index";

// AsyncStorage keys for local preferences
const PREFS_KEY = "warsh_settings";

interface Prefs {
  dailyReminderEnabled: boolean;
  streakRiskEnabled: boolean;
  milestoneEnabled: boolean;
  audioEnabled: boolean;
  autoPlayEnabled: boolean;
  hapticsEnabled: boolean;
  srsAudioEnabled: boolean;
  srsDailyLimit: number;
}

const DEFAULT_PREFS: Prefs = {
  dailyReminderEnabled: true,
  streakRiskEnabled: true,
  milestoneEnabled: true,
  audioEnabled: true,
  autoPlayEnabled: true,
  hapticsEnabled: true,
  srsAudioEnabled: true,
  srsDailyLimit: 20,
};

async function loadPrefs(): Promise<Prefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

async function savePrefs(prefs: Prefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

// ─── components ──────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingRow({
  icon,
  label,
  sublabel,
  right,
  onPress,
  danger,
  showChevron,
}: {
  icon?: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  showChevron?: boolean;
}) {
  const inner = (
    <View style={styles.row}>
      {icon ? (
        <View style={styles.rowIcon}>
          <Ionicons name={icon as any} size={18} color={danger ? WarshPalette.wrongText : WarshPalette.sage} />
        </View>
      ) : null}
      <View style={styles.rowLabel}>
        <Text style={[styles.rowText, danger ? styles.dangerText : null]}>{label}</Text>
        {sublabel ? <Text style={styles.rowSub}>{sublabel}</Text> : null}
      </View>
      {right ?? null}
      {showChevron ? <Ionicons name="chevron-forward" size={16} color={WarshPalette.subtleBrown} /> : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

function OptionPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: number; label: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <View style={styles.optionPills}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.pill, value === opt.value ? styles.pillSelected : null]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.pillText, value === opt.value ? styles.pillTextSelected : null]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const t = useT();

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10);

  function openExternalUrl(url: string) {
    void Linking.openURL(url).catch(() => {
      Alert.alert(t("settings.errorTitle"), "Could not open this link. Please try again.");
    });
  }
  const [currentStreak, setCurrentStreak] = useState(0);
  const [userName, setUserName] = useState("friend");
  const [saving, setSaving] = useState(false);
  const sentrySmokeTestEnabled = isSentrySmokeTestEnabled();

  useFocusEffect(
    useCallback(() => {
      loadPrefs().then(setPrefs);
      api.get("/api/progress")
        .then((res) => {
          const d = res.data.data;
          setDailyGoalMinutes(d.dailyGoalMinutes ?? 10);
          setCurrentStreak(d.streak ?? 0);
          setUserName(d.userName ?? "friend");
        })
        .catch(() => {});
    }, [])
  );

  const NOTIFICATION_PREFS: (keyof Prefs)[] = ["dailyReminderEnabled", "streakRiskEnabled", "milestoneEnabled"];

  async function updatePref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await savePrefs(updated);

    // Re-schedule notifications whenever a notification pref changes
    if (NOTIFICATION_PREFS.includes(key as keyof Prefs)) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await setupNotificationSchedules(
          {
            dailyReminderEnabled: updated.dailyReminderEnabled,
            streakRiskEnabled: updated.streakRiskEnabled,
            milestoneEnabled: updated.milestoneEnabled,
          },
          userName,
          currentStreak
        );
      }
    }
  }

  async function changeDailyGoal(minutes: number) {
    if (saving) return;
    setDailyGoalMinutes(minutes);
    setSaving(true);
    try {
      await updateUserProfile({ dailyGoalMinutes: minutes });
    } catch {
      // silently revert on failure
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    Alert.alert(
      t("settings.deleteAccountTitle"),
      t("settings.deleteAccountBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.deleteAccountConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              await cancelAllNotifications();
              await clearSession();
            } catch {
              Alert.alert(t("settings.errorTitle"), t("settings.deleteAccountError"));
            }
          },
        },
      ]
    );
  }

  async function handleSentrySmokeTest() {
    try {
      const eventId = await sendSentrySmokeTest({ screen: "settings" });
      if (eventId) {
        Alert.alert(t("settings.sentrySent"), `Event ID: ${eventId}`);
      } else {
        Alert.alert(t("settings.sentryDisabled"), t("settings.sentryDisabledBody"));
      }
    } catch {
      Alert.alert(t("settings.sentryFailed"), t("settings.sentryFailedBody"));
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ {t("common.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Notifications */}
        <SectionHeader title={t("settings.notifications")} />
        <View style={styles.card}>
          <SettingRow
            icon="notifications-outline"
            label={t("settings.dailyReminder")}
            sublabel={t("settings.dailyReminderSub")}
            right={
              <Switch
                value={prefs.dailyReminderEnabled}
                onValueChange={(v) => updatePref("dailyReminderEnabled", v)}
                trackColor={{ true: WarshPalette.sage, false: WarshPalette.cream }}
                thumbColor={WarshPalette.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-outline"
            label={t("settings.streakRisk")}
            sublabel={t("settings.streakRiskSub")}
            right={
              <Switch
                value={prefs.streakRiskEnabled}
                onValueChange={(v) => updatePref("streakRiskEnabled", v)}
                trackColor={{ true: WarshPalette.sage, false: WarshPalette.cream }}
                thumbColor={WarshPalette.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="trophy-outline"
            label={t("settings.milestones")}
            sublabel={t("settings.milestonesSub")}
            right={
              <Switch
                value={prefs.milestoneEnabled}
                onValueChange={(v) => updatePref("milestoneEnabled", v)}
                trackColor={{ true: WarshPalette.sage, false: WarshPalette.cream }}
                thumbColor={WarshPalette.white}
              />
            }
          />
        </View>

        {/* Audio */}
        <SectionHeader title={t("settings.audio")} />
        <View style={styles.card}>
          <SettingRow
            icon="volume-medium-outline"
            label={t("settings.audioPlayback")}
            sublabel={t("settings.audioPlaybackSub")}
            right={
              <Switch
                value={prefs.audioEnabled}
                onValueChange={(v) => updatePref("audioEnabled", v)}
                trackColor={{ true: WarshPalette.sage, false: WarshPalette.cream }}
                thumbColor={WarshPalette.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="play-circle-outline"
            label={t("settings.autoPlayReviews")}
            sublabel={t("settings.autoPlayReviewsSub")}
            right={
              <Switch
                value={prefs.srsAudioEnabled}
                onValueChange={(v) => updatePref("srsAudioEnabled", v)}
                trackColor={{ true: WarshPalette.sage, false: WarshPalette.cream }}
                thumbColor={WarshPalette.white}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="phone-portrait-outline"
            label={t("settings.haptics")}
            sublabel={t("settings.hapticsSub")}
            right={
              <Switch
                value={prefs.hapticsEnabled}
                onValueChange={(v) => updatePref("hapticsEnabled", v)}
                trackColor={{ true: WarshPalette.sage, false: WarshPalette.cream }}
                thumbColor={WarshPalette.white}
              />
            }
          />
        </View>

        {/* Vocabulary (SRS) */}
        <SectionHeader title={t("settings.vocabReview")} />
        <View style={styles.card}>
          <OptionPicker
            label={t("settings.dailyReviewLimit")}
            options={[
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: 30, label: "30" },
            ]}
            value={prefs.srsDailyLimit}
            onChange={(v) => updatePref("srsDailyLimit", v)}
          />
        </View>

        {/* Daily goal */}
        <SectionHeader title={t("settings.dailyGoal")} />
        <View style={styles.card}>
          <OptionPicker
            label={t("settings.studyCommitment")}
            options={[
              { value: 5, label: t("learn.goalMinutes", { minutes: 5 }) },
              { value: 10, label: t("learn.goalMinutes", { minutes: 10 }) },
              { value: 15, label: t("learn.goalMinutes", { minutes: 15 }) },
              { value: 30, label: t("learn.goalMinutes", { minutes: 30 }) },
            ]}
            value={dailyGoalMinutes}
            onChange={changeDailyGoal}
          />
        </View>

        {/* Support */}
        <SectionHeader title={t("settings.support")} />
        <View style={styles.card}>
          <SettingRow
            icon="help-circle-outline"
            label={t("settings.helpFaq")}
            onPress={() => openExternalUrl(`${API_BASE_URL}/help`)}
            showChevron
          />
          <View style={styles.divider} />
          <SettingRow
            icon="chatbubble-outline"
            label={t("settings.sendFeedback")}
            onPress={() => openExternalUrl("mailto:support@warsh.app?subject=Warsh%20feedback")}
            showChevron
          />
        </View>

        {sentrySmokeTestEnabled ? (
          <>
            <SectionHeader title={t("settings.diagnostics")} />
            <View style={styles.card}>
              <SettingRow
                icon="bug-outline"
                label={t("settings.sentryTest")}
                sublabel={t("settings.sentryTestSub")}
                onPress={handleSentrySmokeTest}
                showChevron
              />
            </View>
          </>
        ) : null}

        {/* Legal */}
        <SectionHeader title={t("settings.legal")} />
        <View style={styles.card}>
          <SettingRow
            icon="document-text-outline"
            label={t("settings.privacy")}
            onPress={() => openExternalUrl(`${API_BASE_URL}/privacy`)}
            showChevron
          />
          <View style={styles.divider} />
          <SettingRow
            icon="document-outline"
            label={t("settings.terms")}
            onPress={() => openExternalUrl(`${API_BASE_URL}/terms`)}
            showChevron
          />
        </View>

        {/* About */}
        <SectionHeader title={t("settings.about")} />
        <View style={styles.card}>
          <SettingRow
            icon="information-circle-outline"
            label={t("settings.aboutApp")}
            sublabel={t("settings.aboutSub")}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="code-outline"
            label={t("settings.version")}
            right={<Text style={styles.versionText}>1.0.0</Text>}
          />
        </View>

        {/* Account */}
        <SectionHeader title={t("settings.account")} />
        <View style={styles.card}>
          <SettingRow
            icon="card-outline"
            label={t("settings.manageSubscription")}
            sublabel={t("settings.manageSubscriptionSub")}
            onPress={() => router.push("/(app)/paywall")}
            showChevron
          />
          <View style={styles.divider} />
          <SettingRow
            icon="lock-closed-outline"
            label={t("settings.changePassword")}
            onPress={() => router.push("/(app)/change-password")}
            showChevron
          />
          <View style={styles.divider} />
          <SettingRow
            icon="trash-outline"
            label={t("settings.deleteAccount")}
            sublabel={t("settings.deleteAccountSub")}
            onPress={handleDeleteAccount}
            danger
            showChevron
          />
        </View>

        <View style={{ height: Spacing.xl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: WarshPalette.parchmentCardBorder,
  },
  backBtn: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL, width: 60,
  },
  headerTitle: {
    color: WarshPalette.ink, fontFamily: Fonts.display,
    fontSize: FontSizes.h2, fontWeight: "700",
  },

  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },

  sectionHeader: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.8,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
    marginLeft: 4,
  },

  card: {
    borderRadius: Radii.lg, borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.white,
    overflow: "hidden",
  },
  divider: {
    height: 0.5, backgroundColor: WarshPalette.parchmentCardBorder,
    marginHorizontal: Spacing.md,
  },

  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    gap: Spacing.sm, minHeight: 52,
  },
  rowIcon: { width: 28, alignItems: "center" },
  rowLabel: { flex: 1 },
  rowText: {
    color: WarshPalette.ink, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL, lineHeight: LineHeights.bodyL,
  },
  rowSub: {
    color: WarshPalette.subtleBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, marginTop: 1,
  },
  dangerText: { color: WarshPalette.wrongText },
  versionText: {
    color: WarshPalette.subtleBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
  },

  optionPills: {
    flexDirection: "row", gap: 6, flexShrink: 1, flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  pill: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radii.full ?? 999, borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  pillSelected: {
    borderColor: WarshPalette.sage,
    backgroundColor: WarshPalette.sage,
  },
  pillText: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, fontWeight: "600",
  },
  pillTextSelected: { color: WarshPalette.white },
});
