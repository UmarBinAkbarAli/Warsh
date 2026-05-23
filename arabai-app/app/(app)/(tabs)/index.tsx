import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Shadows, Spacing, WarshPalette } from "../../../constants/theme";

const FREEZE_BANNER_KEY = "warsh_freeze_banner_shown";


function ChapterBadge({ label }: { label: string }) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: Colors.bg.surface,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
        marginBottom: Spacing.sm,
      }}
    >
      <Text style={{ color: Colors.text.secondary, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [chapters, setChapters] = useState<any[]>([]);
  const [tadabburFocus, setTadabburFocus] = useState<{ id: string; nameAr: string; nameEn: string; comprehensionPercent: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10);
  const [lessonsToday, setLessonsToday] = useState(0);
  const [dailyGoalMet, setDailyGoalMet] = useState(false);
  const [showFreezeBanner, setShowFreezeBanner] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("trial");
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(false);

  const loadChapters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [chaptersResponse, progressResponse, shownDate, tadabburResponse] = await Promise.all([
        api.get("/api/chapters"),
        api.get("/api/progress"),
        AsyncStorage.getItem(FREEZE_BANNER_KEY),
        api.get("/api/tadabbur").catch(() => null),
      ]);
      setChapters(chaptersResponse.data.data.chapters);
      const progress = progressResponse.data.data;
      setDailyGoalMinutes(progress.dailyGoalMinutes ?? 10);
      setLessonsToday(progress.lessonsCompletedToday ?? 0);
      setDailyGoalMet(progress.dailyGoalMet ?? false);
      const sub = progress.subscription;
      if (sub) {
        setTrialDaysRemaining(sub.trialDaysRemaining ?? null);
        setSubscriptionStatus(sub.subscriptionStatus ?? "trial");
      }
      if (tadabburResponse) {
        const { surahs, focusSurahId } = tadabburResponse.data.data;
        const focus = surahs.find((s: any) => s.id === focusSurahId);
        if (focus) setTadabburFocus({ id: focus.id, nameAr: focus.nameAr, nameEn: focus.nameEn, comprehensionPercent: focus.comprehensionPercent });
      }
      if (progress.freezeUsedYesterday && shownDate !== today) {
        setShowFreezeBanner(true);
      }
    } catch (err) {
      setError("Unable to load chapters. Please login or try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function dismissFreezeBanner() {
    const today = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem(FREEZE_BANNER_KEY, today);
    setShowFreezeBanner(false);
  }

  useFocusEffect(
    useCallback(() => {
      void loadChapters();
      return undefined;
    }, [loadChapters])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg.primary }}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }


  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg.primary }} contentContainerStyle={{ padding: Spacing.xl, paddingTop: insets.top + 16 }}>
      {/* Trial expired banner — persistent, not dismissable */}
      {subscriptionStatus === "expired" && (
        <TouchableOpacity
          style={styles.trialExpiredBanner}
          onPress={() => router.push("/(app)/paywall")}
          activeOpacity={0.85}
        >
          <Ionicons name="lock-closed-outline" size={16} color={WarshPalette.white} />
          <Text style={styles.trialExpiredText}>Your trial has ended. Subscribe to continue</Text>
        </TouchableOpacity>
      )}

      {/* Trial countdown banner — dismissable per day */}
      {subscriptionStatus === "trial" && trialDaysRemaining !== null && trialDaysRemaining <= 5 && !trialBannerDismissed && (
        <View style={[
          styles.trialBanner,
          trialDaysRemaining <= 1 ? styles.trialBannerUrgent : trialDaysRemaining <= 2 ? styles.trialBannerWarning : null,
        ]}>
          <Text style={styles.trialBannerText}>
            {trialDaysRemaining === 0
              ? "Your trial ends today. Don't lose your streak."
              : trialDaysRemaining === 1
              ? "Your trial ends tomorrow."
              : `Your trial ends in ${trialDaysRemaining} days.`}
          </Text>
          <View style={styles.trialBannerActions}>
            <TouchableOpacity onPress={() => router.push("/(app)/paywall")}>
              <Text style={styles.trialBannerCta}>Subscribe</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTrialBannerDismissed(true)} hitSlop={8}>
              <Ionicons name="close" size={14} color={WarshPalette.bodyBrown} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showFreezeBanner ? (
        <View style={styles.freezeBanner}>
          <Ionicons name="shield-checkmark" size={20} color={WarshPalette.sage} />
          <View style={styles.freezeBannerText}>
            <Text style={styles.freezeBannerTitle}>Streak freeze used</Text>
            <Text style={styles.freezeBannerBody}>Yesterday is forgiven. Continue today, in shaa Allah.</Text>
          </View>
          <TouchableOpacity onPress={dismissFreezeBanner}>
            <Ionicons name="close" size={18} color={WarshPalette.bodyBrown} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={[styles.goalCard, dailyGoalMet ? styles.goalCardMet : null]}>
        {dailyGoalMet ? (
          <>
            <Text style={styles.goalMetLabel}>Today's goal complete</Text>
            <ArabicText size="sm" style={styles.goalMetArabic}>بَارَكَ اللّٰهُ فِيكَ</ArabicText>
          </>
        ) : (
          <>
            <View style={styles.goalTopRow}>
              <Text style={styles.goalLabel}>Today's goal</Text>
              <Text style={styles.goalValue}>
                {lessonsToday > 0 ? `${lessonsToday} lesson${lessonsToday > 1 ? "s" : ""} done` : `${dailyGoalMinutes} min`}
              </Text>
            </View>
            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: lessonsToday >= 1 ? "100%" : "0%" }]} />
            </View>
            <Text style={styles.goalHint}>Complete one lesson to maintain your streak</Text>
          </>
        )}
      </View>

      {/* Tadabbur card */}
      {tadabburFocus ? (
        <TouchableOpacity
          style={styles.tadabburCard}
          onPress={() => router.push(`/(app)/tadabbur`)}
          activeOpacity={0.85}
        >
          <Text style={styles.tadabburEyebrow}>Tadabbur · تَدَبُّر</Text>
          <View style={styles.tadabburNameRow}>
            <ArabicText size="md" style={styles.tadabburNameAr}>{tadabburFocus.nameAr}</ArabicText>
          </View>
          <View style={styles.tadabburProgressRow}>
            <View style={styles.tadabburProgressTrack}>
              <View style={[styles.tadabburProgressFill, { width: `${tadabburFocus.comprehensionPercent}%` as any }]} />
            </View>
            <Text style={styles.tadabburPercent}>{tadabburFocus.comprehensionPercent}% understood</Text>
          </View>
          <Text style={styles.tadabburCta}>Tap to explore</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={{ color: Colors.text.primary, fontSize: FontSizes.h1, lineHeight: LineHeights.h1, fontWeight: "700", marginBottom: Spacing.sm }}>
        Your learning path
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Learn Quranic Arabic — one lesson at a time.
      </Text>
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.lg }}>{error}</Text> : null}
      {chapters.map((chapter) => (
        <View
          key={chapter.id}
          style={{
            marginBottom: Spacing.lg,
            padding: Spacing.lg,
            borderRadius: Radii.lg,
            backgroundColor: chapter.isLocked ? Colors.bg.surface : Colors.bg.card,
            borderWidth: 1,
            borderColor: chapter.isCompleted ? Colors.accent.gold : Colors.border.subtle,
            opacity: chapter.isLocked ? 0.72 : 1,
            ...Shadows.card,
          }}
        >
          {chapter.isSkippedByPlacement ? <ChapterBadge label="Skipped" /> : null}
          <Text style={{ fontSize: FontSizes.h2, lineHeight: LineHeights.h2, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>{chapter.title}</Text>
          {chapter.titleAr ? (
            <ArabicText size="sm" style={{ marginBottom: Spacing.sm, color: Colors.accent.gold }}>
              {chapter.titleAr}
            </ArabicText>
          ) : null}
          <Text style={{ marginBottom: Spacing.md, color: Colors.text.secondary, lineHeight: LineHeights.bodyL }}>{chapter.description}</Text>
          <Text style={{ marginBottom: Spacing.sm, color: Colors.text.primary }}>
            {chapter.completedLessonCount} / {chapter.lessons.length} lessons completed
          </Text>
          <View style={{ height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: Colors.border.subtle, marginBottom: Spacing.md }}>
            <View
              style={{
                height: "100%",
                width: `${chapter.lessons.length ? (chapter.completedLessonCount / chapter.lessons.length) * 100 : 0}%`,
                backgroundColor: Colors.accent.gold,
              }}
            />
          </View>
          <Text style={{ marginBottom: Spacing.md, color: Colors.text.secondary }}>{chapter.lessons.length} lessons</Text>
          {chapter.isLocked ? (
            <Text style={{ color: Colors.text.muted }}>Locked until all lessons in previous chapters are complete.</Text>
          ) : (
            <Pressable
              onPress={() => router.push(`/lessons/${chapter.id}`)}
              style={({ pressed }) => ({
                backgroundColor: Colors.accent.gold,
                padding: Spacing.md,
                borderRadius: Radii.md + 2,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text style={{ color: Colors.bg.primary, textAlign: "center", fontWeight: "700" }}>
                {chapter.isCompleted || chapter.isSkippedByPlacement ? "Review Chapter" : "Open Chapter"}
              </Text>
            </Pressable>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  trialExpiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.ink,
    marginBottom: Spacing.sm,
  },
  trialExpiredText: {
    flex: 1, color: WarshPalette.gold,
    fontFamily: Fonts.display,
    fontSize: FontSizes.bodyL, fontWeight: "700",
  },
  trialBanner: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
    marginBottom: Spacing.sm,
  },
  trialBannerWarning: {
    borderColor: WarshPalette.gold + "88",
    backgroundColor: WarshPalette.cream,
  },
  trialBannerUrgent: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentBg,
  },
  trialBannerText: {
    color: WarshPalette.ink, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM, lineHeight: LineHeights.bodyM,
    marginBottom: Spacing.xs,
  },
  trialBannerActions: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center",
  },
  trialBannerCta: {
    color: WarshPalette.gold, fontFamily: Fonts.display,
    fontSize: FontSizes.bodyM, fontWeight: "700",
  },

  freezeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.sage + "55",
    backgroundColor: "#EDF5ED",
    marginBottom: Spacing.md,
  },
  freezeBannerText: { flex: 1 },
  freezeBannerTitle: {
    color: WarshPalette.sage,
    fontFamily: Fonts.display,
    fontSize: FontSizes.bodyL,
    fontWeight: "700",
  },
  freezeBannerBody: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    marginTop: 2,
  },

  goalCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
  },
  goalCardMet: {
    borderColor: WarshPalette.sage,
    backgroundColor: "#EAF2E8",
  },
  goalTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  goalLabel: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  goalValue: {
    color: WarshPalette.ink,
    fontFamily: Fonts.display,
    fontSize: FontSizes.bodyM,
    fontWeight: "500",
    lineHeight: LineHeights.bodyM,
  },
  goalTrack: {
    height: 4,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: WarshPalette.defaultCardBorder,
    marginBottom: Spacing.sm,
  },
  goalFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: WarshPalette.sage,
  },
  goalHint: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  goalMetLabel: {
    color: "#3A5030",
    fontFamily: Fonts.display,
    fontSize: FontSizes.bodyL,
    fontWeight: "500",
    lineHeight: LineHeights.bodyL,
  },
  goalMetArabic: {
    marginTop: Spacing.xs,
    color: WarshPalette.sage,
    fontSize: FontSizes.arabicM,
    lineHeight: LineHeights.arabicM,
    textAlign: "left",
  },
  tadabburCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.gold + "55",
    backgroundColor: WarshPalette.parchmentBg,
  },
  tadabburEyebrow: {
    color: WarshPalette.gold,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  tadabburNameRow: { alignItems: "flex-end", marginBottom: Spacing.sm },
  tadabburNameAr: { color: WarshPalette.ink, textAlign: "right" },
  tadabburProgressRow: { marginBottom: Spacing.sm },
  tadabburProgressTrack: {
    height: 5, backgroundColor: WarshPalette.defaultCardBorder,
    borderRadius: 3, overflow: "hidden",
  },
  tadabburProgressFill: { height: 5, backgroundColor: WarshPalette.gold, borderRadius: 3 },
  tadabburPercent: {
    marginTop: 4, color: WarshPalette.gold,
    fontFamily: Fonts.regular, fontSize: FontSizes.caption, textAlign: "right",
  },
  tadabburCta: {
    color: WarshPalette.gold, fontFamily: Fonts.display,
    fontSize: FontSizes.bodyM, fontWeight: "700", textAlign: "right",
  },
});
