import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { useT } from "@i18n/index";
import api from "@services/api";
import { pickLocalized, pickTranslation, useLanguage, useTranslationLanguage } from "@services/language";
import { useAuthStore } from "@stores/authStore";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Colors,
  FontSizes,
  Fonts,
  LineHeights,
  Radii,
  Shadows,
  Spacing,
  WarshPalette,
} from "../../../constants/theme";

const FREEZE_BANNER_KEY = "warsh_freeze_banner_shown";
const LAST_STREAK_KEY = "warsh_last_streak";
const STREAK_ENDED_SHOWN_KEY = "warsh_streak_ended_shown";

type Lesson = {
  id: string;
  title: string;
  titleUr?: string | null;
  titleAr: string;
  isCompleted: boolean;
  isSkippedByPlacement: boolean;
};

type Chapter = {
  id: string;
  order: number;
  title: string;
  titleUr?: string | null;
  titleAr: string;
  isLocked: boolean;
  isCompleted: boolean;
  isSkippedByPlacement: boolean;
  completedLessonCount: number;
  lessons: Lesson[];
};

type WordOfDay = {
  id: string;
  arabic: string;
  transliteration: string;
  translationEn: string;
  translationUr: string;
  wordType: string;
  inWordBank: boolean;
};

type TadabburFocus = {
  id: string;
  nameAr: string;
  nameEn: string;
  comprehensionPercent: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const language = useLanguage();
  const translationLanguage = useTranslationLanguage();
  const fallbackName = useAuthStore((state) => state.user?.name);
  const isWeb = Platform.OS === "web";
  const t = useT();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tadabburFocus, setTadabburFocus] = useState<TadabburFocus | null>(null);
  const [wordOfDay, setWordOfDay] = useState<WordOfDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState(fallbackName ?? "");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10);
  const [lessonsToday, setLessonsToday] = useState(0);
  const [dailyGoalMet, setDailyGoalMet] = useState(false);
  const [showFreezeBanner, setShowFreezeBanner] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("trial");
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(false);
  const [showStreakEndedModal, setShowStreakEndedModal] = useState(false);
  const [showDailyGoalToast, setShowDailyGoalToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contentWidth = Math.min(width, 720);
  const pagePadding = contentWidth >= 600 ? Spacing.xxl : Spacing.gutter;

  useEffect(() => {
    if (!showDailyGoalToast) return undefined;

    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowDailyGoalToast(false));
    }, 3000);

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [showDailyGoalToast, toastOpacity]);

  const loadHome = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [
        chaptersResponse,
        progressResponse,
        shownDate,
        tadabburResponse,
        wordOfDayResponse,
        lastStreakRaw,
        streakEndedShownDate,
        dailyGoalToastFlag,
      ] = await Promise.all([
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
      const streak = progress.streak ?? progress.currentStreak ?? 0;
      setUserName(progress.userName ?? fallbackName ?? "");
      setCurrentStreak(streak);
      setDailyGoalMinutes(progress.dailyGoalMinutes ?? 10);
      setLessonsToday(progress.lessonsCompletedToday ?? 0);
      setDailyGoalMet(progress.dailyGoalMet ?? false);

      if (progress.subscription) {
        setTrialDaysRemaining(progress.subscription.trialDaysRemaining ?? null);
        setSubscriptionStatus(progress.subscription.subscriptionStatus ?? "trial");
      }

      if (tadabburResponse) {
        const { surahs, focusSurahId } = tadabburResponse.data.data;
        const focus = surahs.find((surah: TadabburFocus) => surah.id === focusSurahId);
        if (focus) {
          setTadabburFocus({
            id: focus.id,
            nameAr: focus.nameAr,
            nameEn: focus.nameEn,
            comprehensionPercent: focus.comprehensionPercent,
          });
        }
      }

      if (wordOfDayResponse?.data?.data) {
        setWordOfDay(wordOfDayResponse.data.data);
      }

      if (progress.freezeUsedYesterday && shownDate !== today) {
        setShowFreezeBanner(true);
      }

      const lastStreak = lastStreakRaw ? Number.parseInt(lastStreakRaw, 10) : null;
      if (streak === 0 && lastStreak !== null && lastStreak > 0 && streakEndedShownDate !== today) {
        setShowStreakEndedModal(true);
        await AsyncStorage.setItem(STREAK_ENDED_SHOWN_KEY, today);
      }
      await AsyncStorage.setItem(LAST_STREAK_KEY, String(streak));

      if (dailyGoalToastFlag) {
        await AsyncStorage.removeItem(`warsh_daily_goal_toast_${today}`);
        setShowDailyGoalToast(true);
      }
    } catch {
      setError(t("learn.loadError"));
    } finally {
      setLoading(false);
    }
  }, [fallbackName, t]);

  useFocusEffect(
    useCallback(() => {
      void loadHome();
      return undefined;
    }, [loadHome]),
  );

  const activeChapter = useMemo(() => {
    return (
      chapters.find(
        (chapter) =>
          !chapter.isLocked && !chapter.isCompleted && !chapter.isSkippedByPlacement,
      ) ??
      [...chapters].reverse().find((chapter) => !chapter.isLocked) ??
      chapters[0] ??
      null
    );
  }, [chapters]);

  const activeLessonIndex = useMemo(() => {
    if (!activeChapter) return -1;
    const index = activeChapter.lessons.findIndex(
      (lesson) => !lesson.isCompleted && !lesson.isSkippedByPlacement,
    );
    return index >= 0 ? index : Math.max(activeChapter.lessons.length - 1, 0);
  }, [activeChapter]);

  const activeLesson =
    activeChapter && activeLessonIndex >= 0
      ? activeChapter.lessons[activeLessonIndex]
      : null;
  const nextLesson =
    activeChapter && activeLessonIndex >= 0
      ? activeChapter.lessons[activeLessonIndex + 1] ?? null
      : null;
  const chapterProgress = activeChapter?.lessons.length
    ? Math.round(
        (activeChapter.completedLessonCount / activeChapter.lessons.length) * 100,
      )
    : 0;
  const lessonProgress = activeChapter?.lessons.length
    ? `${Math.min(activeLessonIndex + 1, activeChapter.lessons.length)} ${t("learn.of")} ${activeChapter.lessons.length}`
    : "";

  async function dismissFreezeBanner() {
    const today = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem(FREEZE_BANNER_KEY, today);
    setShowFreezeBanner(false);
  }

  function openActiveLesson() {
    if (activeLesson) {
      router.push(`/lessons/${activeLesson.id}/play`);
    } else if (activeChapter) {
      router.push(`/lessons/${activeChapter.id}`);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Modal
        visible={showStreakEndedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStreakEndedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="leaf-outline" size={28} color={WarshPalette.sageDeep} />
            </View>
            <Text style={styles.modalTitle}>{t("learn.streakEndedTitle")}</Text>
            <Text style={styles.modalBody}>{t("learn.streakEndedBody")}</Text>
            <Text style={styles.modalHadith}>{t("learn.streakEndedFooter")}</Text>
            <BrandButton
              title={t("learn.beginAgain")}
              onPress={() => setShowStreakEndedModal(false)}
              style={styles.modalCta}
            />
          </View>
        </View>
      </Modal>

      {showDailyGoalToast ? (
        <Animated.View
          style={[
            styles.dailyGoalToast,
            { top: insets.top + Spacing.sm, opacity: toastOpacity },
          ]}
        >
          <Ionicons name="checkmark-circle" size={18} color={WarshPalette.sage} />
          <Text style={styles.dailyGoalToastText}>{t("learn.dailyGoalToast")}</Text>
          <TouchableOpacity
            onPress={() => {
              if (toastTimer.current) clearTimeout(toastTimer.current);
              setShowDailyGoalToast(false);
            }}
            hitSlop={8}
            accessibilityLabel={t("common.close")}
          >
            <Ionicons name="close" size={16} color={WarshPalette.bodyBrown} />
          </TouchableOpacity>
        </Animated.View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentWidth,
            paddingHorizontal: pagePadding,
            paddingTop: insets.top + Spacing.md,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!isWeb && subscriptionStatus === "expired" ? (
          <TouchableOpacity
            style={styles.trialExpiredBanner}
            onPress={() => router.push("/(app)/paywall")}
            activeOpacity={0.85}
          >
            <Ionicons name="lock-closed-outline" size={16} color={WarshPalette.white} />
            <Text style={styles.trialExpiredText}>{t("learn.trialExpired")}</Text>
          </TouchableOpacity>
        ) : null}

        {isWeb && subscriptionStatus === "expired" ? (
          <TouchableOpacity
            style={styles.trialExpiredBanner}
            onPress={() => router.push("/(app)/paywall")}
            activeOpacity={0.85}
          >
            <Ionicons name="lock-closed-outline" size={16} color={WarshPalette.white} />
            <Text style={styles.trialExpiredText}>{t("learn.webAccessEnded")}</Text>
          </TouchableOpacity>
        ) : null}

        {!isWeb &&
        subscriptionStatus === "trial" &&
        trialDaysRemaining !== null &&
        trialDaysRemaining <= 5 &&
        !trialBannerDismissed ? (
          <View
            style={[
              styles.trialBanner,
              trialDaysRemaining <= 1
                ? styles.trialBannerUrgent
                : trialDaysRemaining <= 2
                  ? styles.trialBannerWarning
                  : null,
            ]}
          >
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
              <TouchableOpacity
                onPress={() => setTrialBannerDismissed(true)}
                hitSlop={8}
                accessibilityLabel={t("common.close")}
              >
                <Ionicons name="close" size={14} color={WarshPalette.bodyBrown} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {showFreezeBanner ? (
          <View style={styles.freezeBanner}>
            <Ionicons name="shield-checkmark" size={20} color={WarshPalette.sageDeep} />
            <View style={styles.freezeBannerText}>
              <Text style={styles.freezeBannerTitle}>{t("learn.freezeUsedTitle")}</Text>
              <Text style={styles.freezeBannerBody}>{t("learn.freezeUsedBody")}</Text>
            </View>
            <TouchableOpacity
              onPress={dismissFreezeBanner}
              accessibilityLabel={t("common.close")}
            >
              <Ionicons name="close" size={18} color={WarshPalette.bodyBrown} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting} numberOfLines={2}>
              {t("learn.greeting", { name: userName || t("learn.learner") })}
            </Text>
            <Text style={styles.greetingSubtitle}>{t("learn.greetingSubtitle")}</Text>
          </View>
          <TouchableOpacity
            style={styles.streakChip}
            onPress={() => router.push("/(app)/streak-detail")}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={t("learn.streakDays", { count: currentStreak })}
          >
            <Ionicons name="flame-outline" size={17} color={WarshPalette.goldDeep} />
            <Text style={styles.streakText}>
              {t("learn.streakDays", { count: currentStreak })}
            </Text>
          </TouchableOpacity>
        </View>

        {activeChapter ? (
          <Pressable
            onPress={openActiveLesson}
            style={({ pressed }) => [styles.heroCard, pressed && styles.cardPressed]}
            accessibilityRole="button"
            accessibilityLabel={t("learn.continueLearning")}
          >
            <View style={styles.heroTopRow}>
              <Text style={styles.heroEyebrow}>
                {t("learn.chapterLesson", {
                  chapter: activeChapter.order,
                  lesson: Math.max(activeLessonIndex + 1, 1),
                })}
              </Text>
              <View style={styles.heroBookIcon}>
                <Ionicons name="book-outline" size={19} color={WarshPalette.parchment} />
              </View>
            </View>

            <ArabicText size="lg" style={styles.heroArabic} numberOfLines={2}>
              {activeLesson?.titleAr || activeChapter.titleAr}
            </ArabicText>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {pickLocalized(activeLesson?.title, activeLesson?.titleUr, translationLanguage) ||
                pickLocalized(activeChapter.title, activeChapter.titleUr, translationLanguage)}
            </Text>
            {activeLesson?.titleUr && activeLesson.titleUr !== activeLesson.title ? (
              <Text style={styles.heroUrdu} numberOfLines={1}>
                {language === "ur" ? activeLesson.title : activeLesson.titleUr}
              </Text>
            ) : null}

            <View style={styles.progressLabelRow}>
              <Text style={styles.heroMeta}>{t("learn.progress")}</Text>
              <Text style={styles.heroProgressValue}>{lessonProgress}</Text>
            </View>
            <View style={styles.heroProgressTrack}>
              <View style={[styles.heroProgressFill, { width: `${chapterProgress}%` }]} />
            </View>

            <View style={styles.heroFooter}>
              <Text style={styles.heroHint} numberOfLines={2}>
                {t("learn.heroHint")}
              </Text>
              <View style={styles.continueButton}>
                <Text style={styles.continueButtonText}>{t("learn.continue")}</Text>
                <Ionicons name="arrow-forward" size={16} color={WarshPalette.navy} />
              </View>
            </View>
          </Pressable>
        ) : null}

        <Text style={styles.sectionTitle}>{t("learn.today")}</Text>
        <View style={styles.todayGrid}>
          <Pressable
            onPress={openActiveLesson}
            style={({ pressed }) => [
              styles.todayCard,
              styles.goalCard,
              pressed && styles.lightCardPressed,
            ]}
          >
            <View style={styles.todayCardHeader}>
              <Text style={styles.cardEyebrow}>{t("learn.goalTitle")}</Text>
              <Ionicons name="flag-outline" size={16} color={WarshPalette.sageDeep} />
            </View>
            <View style={styles.goalContentRow}>
              <View style={styles.goalCopy}>
                <Text style={styles.goalValue}>
                  {dailyGoalMet ? t("learn.goalCompleteShort") : t("learn.oneLesson")}
                </Text>
                <Text style={styles.goalHint} numberOfLines={2}>
                  {dailyGoalMet
                    ? "بَارَكَ اللّٰهُ فِيكَ"
                    : t("learn.goalMinutes", { minutes: dailyGoalMinutes })}
                </Text>
              </View>
              <View style={[styles.goalRing, dailyGoalMet && styles.goalRingComplete]}>
                <Text style={styles.goalRingValue}>{dailyGoalMet ? "100%" : "0%"}</Text>
              </View>
            </View>
          </Pressable>

          {wordOfDay ? (
            <Pressable
              onPress={() => router.push(`/(app)/vocabulary/word/${wordOfDay.id}`)}
              style={({ pressed }) => [
                styles.todayCard,
                styles.wordCard,
                pressed && styles.lightCardPressed,
              ]}
            >
              <View style={styles.todayCardHeader}>
                <Text style={styles.cardEyebrow}>{t("learn.wordOfDay")}</Text>
                <Ionicons name="sparkles-outline" size={16} color={WarshPalette.goldDeep} />
              </View>
              <ArabicText size="lg" style={styles.wordArabic} numberOfLines={1}>
                {wordOfDay.arabic}
              </ArabicText>
              <Text style={styles.wordMeaning} numberOfLines={2}>
                {pickTranslation(wordOfDay, translationLanguage)}
              </Text>
            </Pressable>
          ) : (
            <View style={[styles.todayCard, styles.wordCard]}>
              <Text style={styles.cardEyebrow}>{t("learn.wordOfDay")}</Text>
              <Text style={styles.wordPlaceholder}>{t("learn.wordUnavailable")}</Text>
            </View>
          )}
        </View>

        {activeChapter && activeLesson ? (
          <View style={styles.journeySection}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>{t("learn.chapterJourney")}</Text>
              <TouchableOpacity
                onPress={() => router.push(`/lessons/${activeChapter.id}`)}
                style={styles.sectionAction}
                accessibilityLabel={t("learn.openChapter")}
              >
                <Text style={styles.sectionActionText}>{t("learn.viewChapter")}</Text>
                <Ionicons name="chevron-forward" size={15} color={WarshPalette.goldDeep} />
              </TouchableOpacity>
            </View>

            <View style={styles.journeyCard}>
              <Pressable
                onPress={openActiveLesson}
                style={({ pressed }) => [
                  styles.journeyRow,
                  pressed && styles.lightCardPressed,
                ]}
              >
                <View style={styles.journeyIconCurrent}>
                  <Ionicons name="book-outline" size={18} color={WarshPalette.navy} />
                </View>
                <View style={styles.journeyCopy}>
                  <Text style={styles.journeyLabel}>{t("learn.current")}</Text>
                  <Text style={styles.journeyTitle} numberOfLines={2}>
                    {pickLocalized(activeLesson.title, activeLesson.titleUr, translationLanguage)}
                  </Text>
                  {activeLesson.titleUr ? (
                    <Text style={styles.journeySubtitle} numberOfLines={1}>
                      {language === "ur" ? activeLesson.title : activeLesson.titleUr}
                    </Text>
                  ) : null}
                  <ArabicText size="md" style={styles.journeyArabic} numberOfLines={2}>
                    {activeLesson.titleAr}
                  </ArabicText>
                </View>
              </Pressable>

              <View style={styles.journeyDivider} />

              <Pressable
                disabled
                accessibilityState={{ disabled: true }}
                style={({ pressed }) => [
                  styles.journeyRow,
                  !nextLesson && styles.journeyRowDisabled,
                  pressed && styles.lightCardPressed,
                ]}
              >
                <View style={styles.journeyIconNext}>
                  <Ionicons name="lock-closed-outline" size={16} color={WarshPalette.white} />
                </View>
                <View style={styles.journeyCopy}>
                  <Text style={styles.journeyLabel}>{t("learn.next")}</Text>
                  <Text style={styles.journeyTitle} numberOfLines={2}>
                    {nextLesson
                      ? pickLocalized(nextLesson.title, nextLesson.titleUr, translationLanguage)
                      : t("learn.chapterComplete")}
                  </Text>
                  {nextLesson?.titleUr ? (
                    <Text style={styles.journeySubtitle} numberOfLines={1}>
                      {language === "ur" ? nextLesson.title : nextLesson.titleUr}
                    </Text>
                  ) : null}
                  {nextLesson ? (
                    <ArabicText size="md" style={styles.journeyArabic} numberOfLines={2}>
                      {nextLesson.titleAr}
                    </ArabicText>
                  ) : null}
                </View>
                {!nextLesson ? (
                  <Ionicons name="checkmark-circle" size={22} color={WarshPalette.sageDeep} />
                ) : null}
              </Pressable>
            </View>
          </View>
        ) : null}

        {tadabburFocus || subscriptionStatus === "expired" ? (
          <View style={styles.tadabburSection}>
            <Text style={styles.sectionTitle}>{t("learn.tadabbur")}</Text>
            <Pressable
              onPress={() =>
                router.push(
                  subscriptionStatus === "expired" ? "/(app)/paywall" : "/(app)/tadabbur",
                )
              }
              style={({ pressed }) => [styles.tadabburCard, pressed && styles.cardPressed]}
            >
              <View style={styles.tadabburIcon}>
                <Ionicons name="moon-outline" size={22} color={WarshPalette.parchment} />
              </View>
              <View style={styles.tadabburCopy}>
                <Text style={styles.tadabburTitle}>
                  {subscriptionStatus === "expired"
                    ? t("learn.tadabburLockedTitle")
                    : t("learn.tadabburPrompt")}
                </Text>
                <Text style={styles.tadabburBody} numberOfLines={2}>
                  {subscriptionStatus === "expired"
                    ? t("learn.tadabburLockedBody")
                    : t("learn.tadabburBody", { surah: tadabburFocus?.nameEn ?? "" })}
                </Text>
                {tadabburFocus ? (
                  <View style={styles.tadabburProgressRow}>
                    <View style={styles.tadabburProgressTrack}>
                      <View
                        style={[
                          styles.tadabburProgressFill,
                          { width: `${tadabburFocus.comprehensionPercent}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.tadabburPercent}>
                      {t("learn.understoodPercent", {
                        percent: tadabburFocus.comprehensionPercent,
                      })}
                    </Text>
                  </View>
                ) : null}
              </View>
              {tadabburFocus ? (
                <ArabicText size="md" style={styles.tadabburArabic}>
                  {tadabburFocus.nameAr}
                </ArabicText>
              ) : (
                <Ionicons name="lock-closed-outline" size={22} color={WarshPalette.parchment} />
              )}
            </Pressable>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          onPress={() => router.push("/(app)/chapters")}
          activeOpacity={0.75}
          style={styles.allChaptersLink}
        >
          <Text style={styles.allChaptersText}>
            {t("learn.allChapters", { count: chapters.length })}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={WarshPalette.goldDeep} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg.primary,
  },
  scroll: { flex: 1 },
  scrollContent: {
    alignSelf: "center",
    paddingBottom: Spacing.xxxl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerCopy: { flex: 1 },
  greeting: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.35,
  },
  greetingSubtitle: {
    marginTop: 3,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  streakChip: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
    backgroundColor: WarshPalette.sageTintBg,
  },
  streakText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
  },
  heroCard: {
    minHeight: 252,
    padding: Spacing.lg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.navy,
    marginBottom: Spacing.xl,
    ...Shadows.goldGlow,
  },
  cardPressed: { transform: [{ scale: 0.985 }], opacity: 0.96 },
  lightCardPressed: { backgroundColor: WarshPalette.highlightBgSoft },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  heroEyebrow: {
    color: WarshPalette.parchment,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  heroBookIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: "rgba(212,176,106,0.45)",
  },
  heroArabic: {
    color: WarshPalette.white,
    textAlign: "right",
    fontSize: 36,
    lineHeight: 54,
    marginBottom: 1,
  },
  heroTitle: {
    color: WarshPalette.white,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
  },
  heroUrdu: {
    color: WarshPalette.parchment,
    fontFamily: Fonts.urduFallback,
    fontSize: FontSizes.bodyM,
    lineHeight: 24,
    writingDirection: "rtl",
    textAlign: "left",
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  heroMeta: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
  },
  heroProgressValue: {
    color: WarshPalette.white,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
  },
  heroProgressTrack: {
    height: 6,
    overflow: "hidden",
    borderRadius: Radii.full,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroProgressFill: {
    height: "100%",
    minWidth: 5,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.gold,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  heroHint: {
    flex: 1,
    color: "rgba(255,255,255,0.68)",
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  continueButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.gold,
  },
  continueButtonText: {
    color: WarshPalette.navy,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.caption,
  },
  sectionTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    letterSpacing: -0.2,
    marginBottom: Spacing.sm,
  },
  todayGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  todayCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 132,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    ...Shadows.card,
  },
  goalCard: {
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.parchmentBg,
  },
  wordCard: {
    borderColor: WarshPalette.sageSoft,
    backgroundColor: WarshPalette.sageTintBg,
  },
  todayCardHeader: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  cardEyebrow: {
    flexShrink: 1,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.semiBold,
    fontSize: 9,
    lineHeight: 13,
    textTransform: "uppercase",
    letterSpacing: 0.55,
  },
  goalContentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  goalCopy: { flex: 1, minWidth: 0 },
  goalValue: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyL,
    lineHeight: LineHeights.bodyL,
  },
  goalHint: {
    marginTop: 4,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  goalRing: {
    width: 49,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    borderWidth: 5,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.parchmentBg,
  },
  goalRingComplete: { borderColor: WarshPalette.gold },
  goalRingValue: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: 10,
  },
  wordArabic: {
    color: WarshPalette.navy,
    textAlign: "right",
    fontSize: 37,
    lineHeight: 50,
    marginTop: 1,
  },
  wordMeaning: {
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 17,
  },
  wordPlaceholder: {
    marginTop: Spacing.lg,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
  },
  journeySection: { marginBottom: Spacing.xl },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  sectionAction: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  sectionActionText: {
    color: WarshPalette.goldDeep,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
  },
  journeyCard: {
    overflow: "hidden",
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.parchmentBg,
    ...Shadows.card,
  },
  journeyRow: {
    minHeight: 118,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  journeyRowDisabled: { opacity: 0.76 },
  journeyDivider: {
    height: 1,
    marginLeft: 66,
    backgroundColor: WarshPalette.cream,
  },
  journeyIconCurrent: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.highlightBg,
  },
  journeyIconNext: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.sageSoft,
  },
  journeyCopy: { flex: 1, minWidth: 0 },
  journeyLabel: {
    color: WarshPalette.goldDeep,
    fontFamily: Fonts.semiBold,
    fontSize: 9,
    lineHeight: 13,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  journeyTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  journeySubtitle: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.urduFallback,
    fontSize: 11,
    lineHeight: 17,
    writingDirection: "rtl",
    textAlign: "left",
  },
  journeyArabic: {
    width: "100%",
    color: WarshPalette.ink,
    textAlign: "right",
    fontSize: 22,
    lineHeight: 31,
    marginTop: 2,
  },
  tadabburSection: { marginBottom: Spacing.md },
  tadabburCard: {
    minHeight: 132,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.navy,
    ...Shadows.card,
  },
  tadabburIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: "rgba(196,155,77,0.13)",
    borderWidth: 1,
    borderColor: "rgba(196,155,77,0.45)",
  },
  tadabburCopy: { flex: 1, minWidth: 0 },
  tadabburTitle: {
    color: WarshPalette.white,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  tadabburBody: {
    marginTop: 2,
    color: "rgba(255,255,255,0.68)",
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  tadabburArabic: {
    maxWidth: 78,
    color: WarshPalette.parchment,
    fontSize: 22,
    lineHeight: 34,
  },
  tadabburProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tadabburProgressTrack: {
    flex: 1,
    height: 4,
    overflow: "hidden",
    borderRadius: Radii.full,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  tadabburProgressFill: {
    height: "100%",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.gold,
  },
  tadabburPercent: {
    color: WarshPalette.parchment,
    fontFamily: Fonts.regular,
    fontSize: 9,
  },
  allChaptersLink: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    borderRadius: Radii.md,
  },
  allChaptersText: {
    color: WarshPalette.goldDeep,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
  },
  errorText: {
    color: Colors.text.danger,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    marginBottom: Spacing.md,
  },
  trialExpiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.ink,
    marginBottom: Spacing.md,
  },
  trialExpiredText: {
    flex: 1,
    color: WarshPalette.gold,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  trialBanner: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
    marginBottom: Spacing.md,
  },
  trialBannerWarning: {
    borderColor: `${WarshPalette.gold}88`,
    backgroundColor: WarshPalette.cream,
  },
  trialBannerUrgent: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentSoft,
  },
  trialBannerText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    marginBottom: Spacing.xs,
  },
  trialBannerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trialBannerCta: {
    color: WarshPalette.goldDeep,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
  },
  freezeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
    backgroundColor: WarshPalette.sageTintBg,
    marginBottom: Spacing.md,
  },
  freezeBannerText: { flex: 1 },
  freezeBannerTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
  },
  freezeBannerBody: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.overlay,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    padding: Spacing.xxl,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: Colors.bg.primary,
  },
  modalIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.sageTintBg,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalBody: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalHadith: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.italic,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  modalCta: { width: "100%" },
  dailyGoalToast: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.white,
    ...Shadows.goldGlow,
  },
  dailyGoalToastText: {
    flex: 1,
    color: WarshPalette.ink,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
});
