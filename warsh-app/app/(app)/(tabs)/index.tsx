import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { StatusBarBacking } from "@components/StatusBarBacking";
import { BrandButton } from "@components/BrandButton";
import {
  OnboardingChecklist,
  type OnboardingStep,
  type OnboardingStepKey,
} from "@components/OnboardingChecklist";
import {
  ChapterPath,
  type PathChapter,
  type PathLesson,
} from "@components/learn/ChapterPath";
import { LearnRow } from "@components/learn/LearnRow";
import {
  NewLessonsPrompt,
  type LessonNotice,
} from "@components/NewLessonsPrompt";
import { QuranCard } from "@components/quran/QuranCard";
import { SubscriptionBanner } from "@components/SubscriptionBanner";
import { TranslationLanguagePrompt } from "@components/TranslationLanguagePrompt";
import { useT } from "@i18n/index";
import {
  trackSubscriptionBannerCta,
  trackSubscriptionBannerShown,
} from "@services/analytics";
import api, { updateUserProfile } from "@services/api";
import { prefetchChapter } from "@services/chapterPrefetch";
import {
  pickLocalized,
  pickTranslation,
  useLanguage,
  useTranslationLanguage,
  type AppLanguage,
} from "@services/language";
import { useAuthStore } from "@stores/authStore";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WEB_MAX_WIDTH } from "../../../components/WebShell";
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
import {
  isPremiumSuspended,
  toSubscriptionHealthState,
  type SubscriptionHealthState,
} from "../../../constants/subscription";

// Streak and freeze memory is per account, like the onboarding keys below:
// a device-global "last streak" made a fresh account on the same phone open to
// the "Your streak ended" modal after the previous account had a streak.
const FREEZE_BANNER_KEY = "warsh_freeze_banner_shown";
const LAST_STREAK_KEY = "warsh_last_streak";
const STREAK_ENDED_SHOWN_KEY = "warsh_streak_ended_shown";
const TRANSLATION_PROMPT_SHOWN_KEY = "warsh_translation_prompt_shown";
const ONBOARDING_CHECKLIST_DISMISSED_KEY =
  "warsh_onboarding_checklist_dismissed";
// Also written from settings.tsx (changeLanguage/changeDailyGoal) — keep the
// literal in sync there if this ever changes.
const ONBOARDING_LANG_TOUCHED_KEY = "warsh_onboarding_meaning_lang_set";

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
  /** Nothing here holds the learner back (new servers; older ones omit it). */
  isSatisfied?: boolean;
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

interface Core500Summary {
  ready: boolean;
  coveragePercent: number;
  knownCount: number;
  totalCount: number;
  completedSetCount: number;
  nextSetNumber: number | null;
  wordsLeftInNextSet: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const language = useLanguage();
  const translationLanguage = useTranslationLanguage();
  const fallbackName = useAuthStore((state) => state.user?.name);
  const userId = useAuthStore((state) => state.user?.id);
  const patchUser = useAuthStore((state) => state.patchUser);
  const isWeb = Platform.OS === "web";
  const t = useT();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  // The active chapter's own lessons route adds what the list omits: which
  // lesson is the chapter test, its pass rule and its lock.
  // undefined while loading, null when the request failed.
  const [activeChapterDetail, setActiveChapterDetail] = useState<
    PathChapter | null | undefined
  >(undefined);
  const [tadabburFocus, setTadabburFocus] = useState<TadabburFocus | null>(
    null,
  );
  const [core500, setCore500] = useState<Core500Summary | null>(null);
  const [wordOfDay, setWordOfDay] = useState<WordOfDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState(fallbackName ?? "");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lessonsToday, setLessonsToday] = useState(0);
  const [xp, setXp] = useState(0);
  const [showFreezeBanner, setShowFreezeBanner] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(
    null,
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState("trial");
  const [subscriptionActiveUntil, setSubscriptionActiveUntil] = useState<
    string | null
  >(null);
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(false);
  const [showStreakEndedModal, setShowStreakEndedModal] = useState(false);
  const [showTranslationPrompt, setShowTranslationPrompt] = useState(false);
  const [lessonNotices, setLessonNotices] = useState<LessonNotice[]>([]);
  const [translationPromptSaving, setTranslationPromptSaving] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [meaningLanguageChosen, setMeaningLanguageChosen] = useState(false);
  const [commitmentMade, setCommitmentMade] = useState(false);

  // On web `width` is the full browser viewport, but the app is constrained
  // to the centered WebShell column — cap to the frame width so content fits
  // instead of overflowing and clipping. Native keeps its wider cap.
  const desktopWeb = isWeb && width >= 960;
  const android = Platform.OS === "android";
  const availableWebWidth = desktopWeb ? width - 260 : width;
  const contentWidth = Math.min(availableWebWidth, isWeb ? WEB_MAX_WIDTH : 720);
  const pagePadding = contentWidth >= 600 ? Spacing.xxl : Spacing.gutter;

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    const key = `${TRANSLATION_PROMPT_SHOWN_KEY}_${userId}`;
    AsyncStorage.getItem(key).then((shown) => {
      if (cancelled || shown) return;
      setShowTranslationPrompt(true);
      void AsyncStorage.setItem(key, "1");
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function selectTranslationLanguage(value: AppLanguage) {
    if (translationPromptSaving) return;
    setTranslationPromptSaving(true);
    const previous = translationLanguage;
    patchUser({ translationLanguage: value });
    try {
      await updateUserProfile({ translationLanguage: value });
      if (userId) {
        await AsyncStorage.setItem(
          `${ONBOARDING_LANG_TOUCHED_KEY}_${userId}`,
          "1",
        );
      }
      setMeaningLanguageChosen(true);
    } catch {
      patchUser({ translationLanguage: previous });
    } finally {
      setTranslationPromptSaving(false);
      setShowTranslationPrompt(false);
    }
  }

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
        core500Response,
        wordOfDayResponse,
        lastStreakRaw,
        streakEndedShownDate,
        checklistDismissedFlag,
        langTouchedFlag,
      ] = await Promise.all([
        api.get("/api/chapters"),
        api.get("/api/progress"),
        AsyncStorage.getItem(`${FREEZE_BANNER_KEY}_${userId}`),
        api.get("/api/tadabbur").catch(() => null),
        api.get("/api/core500").catch(() => null),
        api.get("/api/vocabulary/word-of-day").catch(() => null),
        AsyncStorage.getItem(`${LAST_STREAK_KEY}_${userId}`),
        AsyncStorage.getItem(`${STREAK_ENDED_SHOWN_KEY}_${userId}`),
        userId
          ? AsyncStorage.getItem(
              `${ONBOARDING_CHECKLIST_DISMISSED_KEY}_${userId}`,
            )
          : null,
        userId
          ? AsyncStorage.getItem(`${ONBOARDING_LANG_TOUCHED_KEY}_${userId}`)
          : null,
      ]);

      setChapters(chaptersResponse.data.data.chapters);
      setLessonNotices(chaptersResponse.data.data.lessonNotices ?? []);
      const progress = progressResponse.data.data;
      const streak = progress.streak ?? progress.currentStreak ?? 0;
      setUserName(progress.userName ?? fallbackName ?? "");
      setCurrentStreak(streak);
      setLessonsToday(progress.lessonsCompletedToday ?? 0);
      setXp(progress.xp ?? 0);

      const completedLessonsCount = progress.completedLessons?.length ?? 0;
      setIsFirstTimeUser(
        (progress.xp ?? 0) === 0 && completedLessonsCount === 0 && streak === 0,
      );
      setChecklistDismissed(!!checklistDismissedFlag);
      setMeaningLanguageChosen(!!langTouchedFlag);
      // The commitment step is done when the server holds a streak goal, so it
      // survives reinstalls and agrees across devices.
      setCommitmentMade(progress.streakGoalDays != null);

      if (progress.subscription) {
        setTrialDaysRemaining(progress.subscription.trialDaysRemaining ?? null);
        setSubscriptionStatus(
          progress.subscription.subscriptionStatus ?? "trial",
        );
        setSubscriptionActiveUntil(
          progress.subscription.subscriptionActiveUntil ?? null,
        );
      }

      if (tadabburResponse) {
        const { surahs, focusSurahId } = tadabburResponse.data.data;
        const focus = surahs.find(
          (surah: TadabburFocus) => surah.id === focusSurahId,
        );
        if (focus) {
          setTadabburFocus({
            id: focus.id,
            nameAr: focus.nameAr,
            nameEn: focus.nameEn,
            comprehensionPercent: focus.comprehensionPercent,
          });
        }
      }

      if (core500Response?.data?.data) {
        const core = core500Response.data.data;
        const nextSet = core.sets?.find(
          (set: { setNumber: number }) => set.setNumber === core.nextSetNumber,
        );
        setCore500({
          ready: core.ready === true,
          coveragePercent: core.coveragePercent ?? 0,
          knownCount: core.knownCount ?? 0,
          totalCount: core.totalCount ?? 0,
          completedSetCount: core.completedSetCount ?? 0,
          nextSetNumber: core.nextSetNumber ?? null,
          wordsLeftInNextSet: nextSet
            ? (nextSet.wordCount ?? 0) - (nextSet.knownCount ?? 0)
            : 0,
        });
      }

      if (wordOfDayResponse?.data?.data) {
        setWordOfDay(wordOfDayResponse.data.data);
      }

      if (progress.freezeUsedYesterday && shownDate !== today) {
        setShowFreezeBanner(true);
      }

      const lastStreak = lastStreakRaw
        ? Number.parseInt(lastStreakRaw, 10)
        : null;
      if (
        streak === 0 &&
        lastStreak !== null &&
        lastStreak > 0 &&
        streakEndedShownDate !== today
      ) {
        setShowStreakEndedModal(true);
        await AsyncStorage.setItem(
          `${STREAK_ENDED_SHOWN_KEY}_${userId}`,
          today,
        );
      }
      await AsyncStorage.setItem(
        `${LAST_STREAK_KEY}_${userId}`,
        String(streak),
      );
    } catch {
      setError(t("learn.loadError"));
    } finally {
      setLoading(false);
    }
  }, [fallbackName, t, userId]);

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
          !chapter.isLocked &&
          !(
            chapter.isSatisfied ??
            (chapter.isCompleted || chapter.isSkippedByPlacement)
          ),
      ) ??
      [...chapters].reverse().find((chapter) => !chapter.isLocked) ??
      chapters[0] ??
      null
    );
  }, [chapters]);

  // Warm the chapter the learner is about to work through, on WiFi only, once
  // per chapter. Doing it here rather than at sign-up means it fires on real
  // intent: plenty of people create an account and never open a lesson, and at
  // sign-up they are mid-flow and as likely as not on mobile data.
  useEffect(() => {
    if (!activeChapter) return;
    void prefetchChapter(activeChapter.id);
  }, [activeChapter]);

  useEffect(() => {
    if (!activeChapter || activeChapter.isLocked) {
      setActiveChapterDetail(null);
      return undefined;
    }
    let cancelled = false;
    setActiveChapterDetail((current) =>
      current?.id === activeChapter.id ? current : undefined,
    );
    api
      .get(`/api/chapters/${activeChapter.id}/lessons`)
      .then((response) => {
        if (!cancelled) setActiveChapterDetail(response.data.data.chapter);
      })
      .catch(() => {
        if (!cancelled) setActiveChapterDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeChapter]);

  // The path waits for the detail so the chapter test never flashes up as an
  // ordinary lesson; if that request fails, the list's lessons still draw it.
  const pathChapter: PathChapter | null = !activeChapter
    ? null
    : activeChapterDetail?.id === activeChapter.id
      ? activeChapterDetail
      : activeChapterDetail === null
        ? activeChapter
        : null;
  const upcomingChapters = activeChapter
    ? chapters
        .filter((chapter) => chapter.order > activeChapter.order)
        .slice(0, 2)
    : [];

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
  const lessonsCompleted = useMemo(
    () =>
      chapters.reduce(
        (total, chapter) => total + chapter.completedLessonCount,
        0,
      ),
    [chapters],
  );

  // A lesson added to a chapter the learner already finished, or a change to
  // one they completed, is announced once and never locks anything.
  const showLessonNotices =
    !loading &&
    !showTranslationPrompt &&
    !showStreakEndedModal &&
    lessonNotices.length > 0;

  function markLessonNoticesSeen() {
    setLessonNotices([]);
    void api.post("/api/progress/lesson-notices").catch(() => undefined);
  }

  function openLessonNotice(notice: LessonNotice) {
    markLessonNoticesSeen();
    router.push(`/lessons/${notice.lessonId}/play`);
  }

  async function dismissFreezeBanner() {
    const today = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem(`${FREEZE_BANNER_KEY}_${userId}`, today);
    setShowFreezeBanner(false);
  }

  // Google has suspended a PAYING subscriber (account hold / paused): lessons
  // are locked server-side, but the fix is a payment method, not the paywall.
  const premiumSuspended = isPremiumSuspended(subscriptionStatus);
  // The Learn tab's one banner slot. "expired" keeps its own banner below.
  const healthState: SubscriptionHealthState | null =
    toSubscriptionHealthState(subscriptionStatus);

  useEffect(() => {
    if (healthState) trackSubscriptionBannerShown(healthState);
  }, [healthState]);

  function openActiveLesson() {
    if (premiumSuspended) {
      router.push("/(app)/manage-subscription");
      return;
    }
    if (activeLesson) {
      router.push(`/lessons/${activeLesson.id}/play`);
    } else if (activeChapter) {
      router.push(`/lessons/${activeChapter.id}`);
    }
  }

  function openPathLesson(lesson: PathLesson) {
    if (premiumSuspended) {
      router.push("/(app)/manage-subscription");
      return;
    }
    if (lesson.isChapterTest) {
      if (!lesson.isLocked) router.push(`/chapter-test/${lesson.id}`);
      return;
    }
    router.push(`/lessons/${lesson.id}/play`);
  }

  const showOnboardingChecklist = isFirstTimeUser && !checklistDismissed;

  const onboardingSteps: OnboardingStep[] = useMemo(
    () => [
      {
        key: "account",
        done: true,
        meta: t("onboardingChecklist.stepAccountMeta"),
      },
      { key: "language", done: meaningLanguageChosen },
      {
        key: "commitment",
        done: commitmentMade,
        meta: commitmentMade
          ? undefined
          : t("onboardingChecklist.stepCommitmentMeta"),
      },
      { key: "firstLesson", done: lessonsCompleted > 0 },
    ],
    [meaningLanguageChosen, commitmentMade, lessonsCompleted, t],
  );

  async function dismissOnboardingChecklist() {
    if (userId) {
      await AsyncStorage.setItem(
        `${ONBOARDING_CHECKLIST_DISMISSED_KEY}_${userId}`,
        "1",
      );
    }
    setChecklistDismissed(true);
  }

  useEffect(() => {
    if (!showOnboardingChecklist) return;
    if (onboardingSteps.every((step) => step.done)) {
      void dismissOnboardingChecklist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOnboardingChecklist, onboardingSteps]);

  function handleOnboardingStepPress(key: OnboardingStepKey) {
    if (key === "language") {
      router.push({
        pathname: "/(app)/settings",
        params: { open: "meaningLanguage" },
      });
    } else if (key === "commitment") {
      router.push({
        pathname: "/(app)/streak-commitment",
        params: { source: "checklist" },
      });
    } else if (key === "firstLesson") {
      openActiveLesson();
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
        statusBarTranslucent
        navigationBarTranslucent
        animationType="fade"
        onRequestClose={() => setShowStreakEndedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons
                name="leaf-outline"
                size={28}
                color={WarshPalette.sageDeep}
              />
            </View>
            <Text style={styles.modalTitle}>{t("learn.streakEndedTitle")}</Text>
            <Text style={styles.modalBody}>{t("learn.streakEndedBody")}</Text>
            <Text style={styles.modalHadith}>
              {t("learn.streakEndedFooter")}
            </Text>
            <BrandButton
              title={t("learn.beginAgain")}
              onPress={() => setShowStreakEndedModal(false)}
              style={styles.modalCta}
            />
          </View>
        </View>
      </Modal>

      <NewLessonsPrompt
        visible={showLessonNotices}
        notices={lessonNotices}
        onOpen={openLessonNotice}
        onDismiss={markLessonNoticesSeen}
      />

      <TranslationLanguagePrompt
        visible={showTranslationPrompt}
        current={translationLanguage}
        saving={translationPromptSaving}
        onSelect={selectTranslationLanguage}
        onDismiss={() => setShowTranslationPrompt(false)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            width: contentWidth,
            paddingHorizontal: pagePadding,
            paddingTop: desktopWeb
              ? Spacing.xxxl
              : insets.top + Spacing.md,
            paddingBottom: insets.bottom + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {healthState ? (
          <SubscriptionBanner
            state={healthState}
            activeUntil={subscriptionActiveUntil}
            onCtaPress={trackSubscriptionBannerCta}
          />
        ) : null}

        {!isWeb && subscriptionStatus === "expired" ? (
          <TouchableOpacity
            style={styles.trialExpiredBanner}
            onPress={() => router.push("/(app)/paywall")}
            activeOpacity={0.85}
          >
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={WarshPalette.white}
            />
            <Text style={styles.trialExpiredText}>
              {t("learn.trialExpired")}
            </Text>
          </TouchableOpacity>
        ) : null}

        {isWeb && subscriptionStatus === "expired" ? (
          <TouchableOpacity
            style={styles.trialExpiredBanner}
            onPress={() => router.push("/(app)/paywall")}
            activeOpacity={0.85}
          >
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={WarshPalette.white}
            />
            <Text style={styles.trialExpiredText}>
              {t("learn.webAccessEnded")}
            </Text>
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
                <Text style={styles.trialBannerCta}>
                  {t("learn.subscribe")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTrialBannerDismissed(true)}
                hitSlop={8}
                accessibilityLabel={t("common.close")}
              >
                <Ionicons
                  name="close"
                  size={14}
                  color={WarshPalette.bodyBrown}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {showFreezeBanner ? (
          <View style={styles.freezeBanner}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={WarshPalette.sageDeep}
            />
            <View style={styles.freezeBannerText}>
              <Text style={styles.freezeBannerTitle}>
                {t("learn.freezeUsedTitle")}
              </Text>
              <Text style={styles.freezeBannerBody}>
                {t("learn.freezeUsedBody")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={dismissFreezeBanner}
              accessibilityLabel={t("common.close")}
            >
              <Ionicons name="close" size={18} color={WarshPalette.bodyBrown} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View
          style={[
            styles.headerRow,
            android && styles.headerRowAndroid,
            android && translationLanguage === "ur" && styles.headerRowAndroidRtl,
          ]}
        >
          <View style={[styles.headerCopy, android && translationLanguage === "ur" && styles.headerCopyAndroidRtl]}>
            <Text
              style={[
                styles.greeting,
                android ? styles.greetingAndroid : null,
                desktopWeb ? styles.greetingDesktop : null,
              ]}
              numberOfLines={1}
            >
              {userName || t("learn.learner")}
            </Text>
            <Text
              style={[styles.greetingSubtitle, android && styles.greetingSubtitleAndroid]}
              numberOfLines={1}
            >
              {activeChapter
                ? t("learn.headerSub", { chapter: activeChapter.order })
                : t("learn.salaam")}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.streakChip, android && styles.streakChipAndroid]}
            onPress={() => router.push("/(app)/streak-detail")}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={t(
              currentStreak === 1 ? "learn.streakDay" : "learn.streakDays",
              { count: currentStreak },
            )}
          >
            <Ionicons
              name="flame-outline"
              size={android ? 14 : 17}
              color={android ? WarshPalette.goldText : WarshPalette.goldDeep}
            />
            <Text style={[styles.streakText, android && styles.streakTextAndroid]}>
              {currentStreak}
            </Text>
          </TouchableOpacity>
          {/* Owner decision 2026-09-25: the avatar opens the You tab. */}
          <TouchableOpacity
            style={[styles.avatar, android && styles.avatarAndroid]}
            onPress={() => router.push("/(app)/(tabs)/profile")}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={t("learn.openYou")}
          >
            <Text style={[styles.avatarText, android && styles.avatarTextAndroid]}>
              {(userName || t("learn.learner")).trim().charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {showOnboardingChecklist ? (
          <OnboardingChecklist
            steps={onboardingSteps}
            onSkip={dismissOnboardingChecklist}
            onStepPress={handleOnboardingStepPress}
          />
        ) : null}

        <View style={desktopWeb ? styles.desktopDashboardGrid : undefined}>
          <View style={desktopWeb ? styles.desktopPrimaryColumn : undefined}>
            {showOnboardingChecklist &&
            activeChapter &&
            lessonsCompleted === 0 ? (
              <View style={styles.coachMarkBubble}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={WarshPalette.white}
                />
                <Text style={styles.coachMarkText}>
                  {t("onboardingChecklist.coachMark")}
                </Text>
              </View>
            ) : null}
            {pathChapter ? (
              <ChapterPath
                chapter={pathChapter}
                language={translationLanguage}
                locked={premiumSuspended}
                onOpenChapter={() => router.push(`/lessons/${pathChapter.id}`)}
                onOpenLesson={openPathLesson}
              />
            ) : null}

            {upcomingChapters.length === 0 ? (
              <View
                style={[styles.listSection, android && styles.listSectionAndroid]}
              >
                <LearnRow
                  icon="list-outline"
                  title={t("learn.allChapters", { count: chapters.length })}
                  compact={android}
                  onPress={() => router.push("/(app)/chapters")}
                />
              </View>
            ) : (
              <View
                style={[styles.listSection, android && styles.listSectionAndroid]}
              >
                  <View
                    style={[
                      styles.sectionHeadingRow,
                      android && translationLanguage === "ur" && styles.sectionHeadingRowAndroidRtl,
                    ]}
                  >
                  <Text
                    style={[
                      styles.sectionTitle,
                      android && styles.sectionTitleAndroid,
                      android && translationLanguage === "ur" && styles.sectionTitleAndroidRtl,
                    ]}
                  >
                    {t("learn.comingUp")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(app)/chapters")}
                    style={[
                      styles.sectionAction,
                      android && styles.sectionActionAndroid,
                      android && translationLanguage === "ur" && styles.sectionActionRtl,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.sectionActionText, android && styles.sectionActionTextAndroid]}>
                      {t("learn.allChapters", { count: chapters.length })}
                    </Text>
                    <Ionicons
                      name={translationLanguage === "ur" ? "arrow-back" : "arrow-forward"}
                      size={12}
                      color={WarshPalette.goldText}
                    />
                  </TouchableOpacity>
                </View>
                {upcomingChapters.map((chapter) => (
                  <LearnRow
                    key={chapter.id}
                    leading={
                      <Text style={[styles.chapterNumber, android && styles.chapterNumberAndroid]}>{chapter.order}</Text>
                    }
                    title={`${translationLanguage === "ur" ? "‏" : "‎"}${pickLocalized(chapter.title, chapter.titleUr, translationLanguage)}`}
                    locked={chapter.isLocked}
                    compact={android}
                    rtl={translationLanguage === "ur"}
                    onPress={
                      chapter.isLocked
                        ? undefined
                        : () => router.push(`/lessons/${chapter.id}`)
                    }
                  />
                ))}
              </View>
            )}

            <View
              style={[styles.listSection, android && styles.listSectionAndroid]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  android && styles.sectionTitleAndroid,
                  android && translationLanguage === "ur" && styles.sectionTitleAndroidRtl,
                ]}
              >
                {t("learn.moreForToday")}
              </Text>
              {!android ? <QuranCard /> : null}
              {tadabburFocus ||
              subscriptionStatus === "expired" ||
              premiumSuspended ? (
                <LearnRow
                  icon="moon-outline"
                  title={
                    subscriptionStatus === "expired" || premiumSuspended
                      ? t("learn.tadabburLockedTitle")
                      : `${t("learn.tadabbur")} · ${tadabburFocus?.nameEn ?? ""}`
                  }
                  meta={
                    premiumSuspended
                      ? t("learn.tadabburSuspendedBody")
                      : subscriptionStatus === "expired"
                        ? t("learn.tadabburLockedBody")
                        : t("learn.understoodPercent", {
                            percent: tadabburFocus?.comprehensionPercent ?? 0,
                          })
                  }
                  locked={subscriptionStatus === "expired" || premiumSuspended}
                  compact={android}
                  rtl={translationLanguage === "ur"}
                  onPress={() =>
                    router.push(
                      premiumSuspended
                        ? "/(app)/manage-subscription"
                        : subscriptionStatus === "expired"
                          ? "/(app)/paywall"
                          : "/(app)/tadabbur",
                    )
                  }
                />
              ) : null}
              {/* Quranic Core 500 — free for everyone, so no subscription gate here.
              Progress reads as Quran coverage rather than a word count. */}
              {core500?.ready ? (
                <LearnRow
                  icon="layers-outline"
                  title={t("learn.core500")}
                  compact={android}
                  rtl={translationLanguage === "ur"}
                  meta={
                    core500.knownCount > 0
                      ? t("learn.core500Progress", {
                          set:
                            core500.nextSetNumber ?? core500.completedSetCount,
                          words: core500.wordsLeftInNextSet,
                        })
                      : t("learn.core500Body")
                  }
                  onPress={() => router.push("/(app)/core-500")}
                />
              ) : null}
              {wordOfDay ? (
                <LearnRow
                  icon="sparkles-outline"
                  title={t("learn.wordOfDay")}
                  meta={pickTranslation(wordOfDay, translationLanguage)}
                  compact={android}
                  rtl={translationLanguage === "ur"}
                  trailing={
                    <ArabicText
                      size="md"
                      style={android ? { ...styles.wordArabic, ...styles.wordArabicAndroid } : styles.wordArabic}
                      numberOfLines={1}
                    >
                      {wordOfDay.arabic}
                    </ArabicText>
                  }
                  onPress={() =>
                    router.push(`/(app)/vocabulary/word/${wordOfDay.id}`)
                  }
                />
              ) : null}
            </View>
          </View>
          {desktopWeb ? (
            <View style={styles.desktopRail}>
              <View style={styles.statCard}>
                <View style={styles.statTop}>
                  <Text style={styles.statLabel}>POINTS</Text>
                  <Ionicons
                    name="sparkles-outline"
                    size={17}
                    color={WarshPalette.goldDeep}
                  />
                </View>
                <Text style={styles.statValue}>{xp}</Text>
                <Text style={styles.statCaption}>points earned</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statTop}>
                  <Text style={styles.statLabel}>LESSONS</Text>
                  <Ionicons
                    name="book-outline"
                    size={17}
                    color={WarshPalette.goldDeep}
                  />
                </View>
                <Text style={styles.statValue}>{lessonsCompleted}</Text>
                <Text style={styles.statCaption}>lessons completed</Text>
              </View>
            </View>
          ) : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
      <StatusBarBacking />
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
  headerRowAndroid: { gap: Spacing.sm, marginBottom: Spacing.lg },
  headerRowAndroidRtl: { flexDirection: "row-reverse" },
  headerCopy: { flex: 1 },
  headerCopyAndroidRtl: { alignItems: "flex-end" },
  greeting: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: 26,
    lineHeight: 33,
    letterSpacing: -0.35,
  },
  greetingAndroid: {
    fontFamily: Fonts.medium,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0,
  },
  greetingDesktop: {
    color: WarshPalette.navy,
    fontFamily: Fonts.displaySemiBold,
    fontSize: 30,
    lineHeight: 38,
  },
  greetingSubtitle: {
    marginTop: 3,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  greetingSubtitleAndroid: {
    marginTop: 2,
    color: WarshPalette.metaGrey,
    lineHeight: 14,
  },
  streakChip: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
  },
  streakChipAndroid: {
    minHeight: 32,
    height: 32,
    gap: 4,
    paddingHorizontal: 10,
    borderWidth: 0,
  },
  streakTextAndroid: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.caption,
    lineHeight: 14,
  },
  streakText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.navy,
  },
  avatarAndroid: { width: 40, height: 40 },
  avatarTextAndroid: {
    color: WarshPalette.white,
    fontFamily: Fonts.medium,
    fontSize: 15,
  },
  avatarText: {
    color: WarshPalette.parchment,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
  },
  listSection: { gap: Spacing.sm, marginBottom: Spacing.xl },
  listSectionAndroid: { gap: Spacing.sm, marginBottom: Spacing.xl },
  chapterNumber: {
    minWidth: 20,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM + 1,
  },
  chapterNumberAndroid: {
    width: 40,
    color: WarshPalette.metaGrey,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label - 1,
    textAlign: "center",
  },
  desktopDashboardGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 40,
  },
  desktopPrimaryColumn: {
    flex: 1,
    minWidth: 0,
  },
  desktopRail: {
    width: 280,
    gap: Spacing.lg,
  },
  statCard: {
    minHeight: 150,
    padding: 22,
    gap: 8,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
    backgroundColor: WarshPalette.white,
    ...Shadows.card,
  },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLabel: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.bold,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  statValue: {
    color: WarshPalette.navy,
    fontFamily: Fonts.displaySemiBold,
    fontSize: 34,
    lineHeight: 40,
  },
  statCaption: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  coachMarkBubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.navy,
    marginBottom: Spacing.sm,
  },
  coachMarkText: {
    flex: 1,
    color: WarshPalette.white,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  sectionTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    letterSpacing: -0.2,
    marginBottom: Spacing.sm,
  },
  sectionTitleAndroid: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.bodyL,
    lineHeight: 19,
    letterSpacing: 0,
    marginBottom: Spacing.xs,
  },
  sectionTitleAndroidRtl: { textAlign: "right" },
  wordArabicAndroid: { fontSize: 18, lineHeight: 28 },
  wordArabic: {
    maxWidth: 120,
    color: WarshPalette.navy,
    fontSize: 24,
    lineHeight: 36,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  sectionHeadingRowAndroidRtl: { flexDirection: "row-reverse" },
  sectionAction: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  sectionActionAndroid: { minHeight: 24 },
  sectionActionRtl: { flexDirection: "row-reverse" },
  sectionActionText: {
    color: WarshPalette.goldText,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
  },
  sectionActionTextAndroid: { fontFamily: Fonts.regular, fontSize: FontSizes.label - 1 },
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
    backgroundColor: WarshPalette.navy,
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
    color: WarshPalette.goldText,
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
});
