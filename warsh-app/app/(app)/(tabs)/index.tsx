import { useCallback, useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, Animated, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Shadows, Spacing, WarshPalette } from "../../../constants/theme";
import { useLanguage, pickTranslation, pickLocalized } from "@services/language";
import { useT } from "@i18n/index";

const FREEZE_BANNER_KEY = "warsh_freeze_banner_shown";
const LAST_STREAK_KEY = "warsh_last_streak";
const STREAK_ENDED_SHOWN_KEY = "warsh_streak_ended_shown";


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
  const language = useLanguage();
  const isWeb = Platform.OS === "web";
  const t = useT();
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
  // M4 — streak ended modal
  const [wordOfDay, setWordOfDay] = useState<{ id: string; arabic: string; transliteration: string; translationEn: string; translationUr: string; wordType: string; inWordBank: boolean } | null>(null);
  const [showStreakEndedModal, setShowStreakEndedModal] = useState(false);
  // M5 — daily goal toast
  const [showDailyGoalToast, setShowDailyGoalToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showDailyGoalToast) {
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      toastTimer.current = setTimeout(() => {
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setShowDailyGoalToast(false);
        });
      }, 3000);
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [showDailyGoalToast]);

  const loadChapters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [chaptersResponse, progressResponse, shownDate, tadabburResponse, wordOfDayResponse, lastStreakRaw, streakEndedShownDate, dailyGoalToastFlag] = await Promise.all([
        api.get("/api/chapters"),
        api.get("/api/progress"),
        AsyncStorage.getItem(FREEZE_BANNER_KEY),
        api.get("/api/tadabbur").catch(() => null),
        api.get("/api/vocabulary/word-of-day").catch(() => null),
        AsyncStorage.getItem(LAST_STREAK_KEY),
        AsyncStorage.getItem(STREAK_ENDED_SHOWN_KEY),
        AsyncStorage.getItem(`warsh_daily_goal_toast_${today}`),
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
      if (wordOfDayResponse?.data?.data) setWordOfDay(wordOfDayResponse.data.data);
      if (progress.freezeUsedYesterday && shownDate !== today) {
        setShowFreezeBanner(true);
      }
      // M4: show streak ended modal if streak dropped to 0 since last session
      const currentStreak: number = progress.streak ?? progress.currentStreak ?? 0;
      const lastStreak = lastStreakRaw ? parseInt(lastStreakRaw, 10) : null;
      if (currentStreak === 0 && lastStreak !== null && lastStreak > 0 && streakEndedShownDate !== today) {
        setShowStreakEndedModal(true);
        await AsyncStorage.setItem(STREAK_ENDED_SHOWN_KEY, today);
      }
      await AsyncStorage.setItem(LAST_STREAK_KEY, String(currentStreak));
      // M5: show daily goal toast if flagged by lesson completion
      if (dailyGoalToastFlag) {
        await AsyncStorage.removeItem(`warsh_daily_goal_toast_${today}`);
        setShowDailyGoalToast(true);
      }
    } catch (err) {
      setError(t("learn.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary }}>

    {/* M4 — Streak ended modal */}
    <Modal visible={showStreakEndedModal} transparent animationType="fade" onRequestClose={() => setShowStreakEndedModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalEmoji}>🌿</Text>
          <Text style={styles.modalTitle}>{t("learn.streakEndedTitle")}</Text>
          <Text style={styles.modalBody}>
            {t("learn.streakEndedBody")}
          </Text>
          <Text style={styles.modalHadith}>{t("learn.streakEndedFooter")}</Text>
          <BrandButton
            title={t("learn.beginAgain")}
            onPress={() => setShowStreakEndedModal(false)}
            style={styles.modalCta}
          />
        </View>
      </View>
    </Modal>

    {/* M5 — Daily goal toast */}
    {showDailyGoalToast ? (
      <Animated.View style={[styles.dailyGoalToast, { top: insets.top + Spacing.sm, opacity: toastOpacity }]}>
        <Ionicons name="checkmark-circle" size={18} color={WarshPalette.sage} />
        <Text style={styles.dailyGoalToastText}>{t("learn.dailyGoalToast")}</Text>
        <TouchableOpacity onPress={() => {
          if (toastTimer.current) clearTimeout(toastTimer.current);
          setShowDailyGoalToast(false);
        }} hitSlop={8}>
          <Ionicons name="close" size={16} color={WarshPalette.bodyBrown} />
        </TouchableOpacity>
      </Animated.View>
    ) : null}

    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.xl, paddingTop: insets.top + 16 }}>
      {/* Trial expired banner — persistent, not dismissable */}
      {!isWeb && subscriptionStatus === "expired" && (
        <TouchableOpacity
          style={styles.trialExpiredBanner}
          onPress={() => router.push("/(app)/paywall")}
          activeOpacity={0.85}
        >
          <Ionicons name="lock-closed-outline" size={16} color={WarshPalette.white} />
          <Text style={styles.trialExpiredText}>{t("learn.trialExpired")}</Text>
        </TouchableOpacity>
      )}

      {/* Trial countdown banner — dismissable per day */}
      {!isWeb && subscriptionStatus === "trial" && trialDaysRemaining !== null && trialDaysRemaining <= 5 && !trialBannerDismissed && (
        <View style={[
          styles.trialBanner,
          trialDaysRemaining <= 1 ? styles.trialBannerUrgent : trialDaysRemaining <= 2 ? styles.trialBannerWarning : null,
        ]}>
          <Text style={styles.trialBannerText}>
            {trialDaysRemaining === 0
              ? t("learn.trialEndsToday")
              : trialDaysRemaining === 1
              ? t("learn.trialEndsTomorrow")
              : t("learn.trialEndsInDays", { days: trialDaysRemaining })}
          </Text>
          <View style={styles.trialBannerActions}>
            <TouchableOpacity onPress={() => router.push("/(app)/paywall")}>
              <Text style={styles.trialBannerCta}>{t("learn.subscribe")}</Text>
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
            <Text style={styles.freezeBannerTitle}>{t("learn.freezeUsedTitle")}</Text>
            <Text style={styles.freezeBannerBody}>{t("learn.freezeUsedBody")}</Text>
          </View>
          <TouchableOpacity onPress={dismissFreezeBanner}>
            <Ionicons name="close" size={18} color={WarshPalette.bodyBrown} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={[styles.goalCard, dailyGoalMet ? styles.goalCardMet : null]}>
        {dailyGoalMet ? (
          <>
            <Text style={styles.goalMetLabel}>{t("learn.goalComplete")}</Text>
            <ArabicText size="sm" style={styles.goalMetArabic}>بَارَكَ اللّٰهُ فِيكَ</ArabicText>
          </>
        ) : (
          <>
            <View style={styles.goalTopRow}>
              <Text style={styles.goalLabel}>{t("learn.goalTitle")}</Text>
              <Text style={styles.goalValue}>
                {lessonsToday > 0
                  ? t("learn.goalLessonsDone", { count: lessonsToday, suffix: lessonsToday > 1 ? "s" : "" })
                  : t("learn.goalMinutes", { minutes: dailyGoalMinutes })}
              </Text>
            </View>
            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: lessonsToday >= 1 ? "100%" : "0%" }]} />
            </View>
            <Text style={styles.goalHint}>{t("learn.goalHint")}</Text>
          </>
        )}
      </View>

      {/* Word of the Day card */}
      {wordOfDay ? (
        <TouchableOpacity
          style={styles.wotdCard}
          onPress={() => router.push(`/(app)/vocabulary/word/${wordOfDay.id}`)}
          activeOpacity={0.85}
        >
          <Text style={styles.wotdEyebrow}>{t("learn.wordOfDay")}</Text>
          <View style={styles.wotdRow}>
            <View style={styles.wotdLeft}>
              <ArabicText size="lg" style={styles.wotdArabic}>{wordOfDay.arabic}</ArabicText>
              <Text style={styles.wotdTranslit}>{wordOfDay.transliteration}</Text>
              <Text style={styles.wotdTranslation}>{pickTranslation(wordOfDay, language)}</Text>
            </View>
            <View style={styles.wotdRight}>
              <Text style={styles.wotdType}>{wordOfDay.wordType}</Text>
              {wordOfDay.inWordBank && (
                <Ionicons name="checkmark-circle" size={18} color={WarshPalette.sage} style={{ marginTop: 4 }} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ) : null}

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
          <Text style={styles.tadabburCta}>{t("learn.tapToExplore")}</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={{ color: Colors.text.primary, fontSize: FontSizes.h1, lineHeight: LineHeights.h1, fontWeight: "700", marginBottom: Spacing.sm }}>
        {t("learn.learningPathTitle")}
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        {t("learn.learningPathBody")}
      </Text>
      {error ? <Text style={{ color: Colors.text.danger, marginBottom: Spacing.lg }}>{error}</Text> : null}
      {chapters.slice(0, 5).map((chapter) => (
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
          {chapter.isSkippedByPlacement ? <ChapterBadge label={t("learn.skipped")} /> : null}
          <Text style={{ fontSize: FontSizes.h2, lineHeight: LineHeights.h2, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>
            {pickLocalized(chapter.title, chapter.titleUr, language)}
          </Text>
          {chapter.titleAr ? (
            <ArabicText size="sm" style={{ marginBottom: Spacing.sm, color: Colors.accent.gold }}>
              {chapter.titleAr}
            </ArabicText>
          ) : null}
          <Text style={{ marginBottom: Spacing.md, color: Colors.text.secondary, lineHeight: LineHeights.bodyL }}>
            {pickLocalized(chapter.description, chapter.descriptionUr, language)}
          </Text>
          <Text style={{ marginBottom: Spacing.sm, color: Colors.text.primary }}>
            {t("learn.lessonsCompleted", { done: chapter.completedLessonCount, total: chapter.lessons.length })}
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
          <Text style={{ marginBottom: Spacing.md, color: Colors.text.secondary }}>{t("learn.lessonCount", { count: chapter.lessons.length })}</Text>
          {chapter.isLocked ? (
            <Text style={{ color: Colors.text.muted }}>{t("learn.lockedMessage")}</Text>
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
                {chapter.isCompleted || chapter.isSkippedByPlacement ? t("learn.reviewChapter") : t("learn.openChapter")}
              </Text>
            </Pressable>
          )}
        </View>
      ))}
      {chapters.length > 5 && (
        <TouchableOpacity
          onPress={() => router.push("/(app)/chapters")}
          activeOpacity={0.75}
          style={styles.allChaptersLink}
        >
          <Text style={styles.allChaptersText}>{t("learn.allChapters", { count: chapters.length })}</Text>
          <Ionicons name="chevron-forward" size={16} color={WarshPalette.gold} />
        </TouchableOpacity>
      )}
    </ScrollView>
    </View>
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

  // M4 — Streak ended modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 17, 23, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.bg.primary,
    borderRadius: Radii.xl,
    padding: Spacing.xxl,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
  },
  modalEmoji: {
    fontSize: 52,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    fontWeight: "700",
    color: WarshPalette.ink,
    textAlign: "center",
    lineHeight: LineHeights.h1,
    marginBottom: Spacing.md,
  },
  modalBody: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    lineHeight: LineHeights.bodyM * 1.6,
    marginBottom: Spacing.md,
  },
  modalHadith: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
    lineHeight: LineHeights.bodyM,
    marginBottom: Spacing.xl,
  },
  modalCta: {
    width: "100%",
  },

  wotdCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  wotdEyebrow: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  wotdRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  wotdLeft: { flex: 1 },
  wotdRight: { alignItems: "flex-end", paddingLeft: Spacing.sm },
  wotdArabic: { color: WarshPalette.ink, textAlign: "left" },
  wotdTranslit: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    marginTop: 2,
  },
  wotdTranslation: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    marginTop: 2,
  },
  wotdType: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.gold,
    textTransform: "capitalize",
  },
  allChaptersLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  allChaptersText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.gold,
  },

  // M5 — Daily goal toast
  dailyGoalToast: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: WarshPalette.white,
    borderWidth: 1.5,
    borderColor: WarshPalette.gold,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    zIndex: 100,
    shadowColor: WarshPalette.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  dailyGoalToastText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
    lineHeight: LineHeights.bodyM,
  },
});
