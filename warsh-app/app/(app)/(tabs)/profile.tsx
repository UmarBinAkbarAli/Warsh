import { useCallback, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import type { DimensionValue } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { useAuth } from "@hooks/useAuth";
import { useLanguage } from "@services/language";
import * as Theme from "../../../constants/theme";
import { ArabicText } from "@components/ArabicText";
import { StatusBarBacking } from "@components/StatusBarBacking";
import { useT } from "@i18n/index";

// You tab, redesigned on the Claude Design canvas (owner-approved 2026-10-22).
// Icon rules for this screen: Ionicons outline only, 16 inline / 20 in cards /
// 22 for header actions; gold-text on light surfaces, sage-deep only for "done",
// subtle brown for meta. Log out lives in Settings.

type WeekDay = { weekday: number; done: boolean; today: boolean };

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const desktopWeb = Platform.OS === "web" && width >= 960;
  const { user } = useAuth();
  const language = useLanguage();
  const t = useT();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/progress");
      setData(response.data.data);
    } catch (err) {
      setError(t("profile.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void loadProgress();
      return undefined;
    }, [loadProgress])
  );

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Theme.Colors.accent.gold} />
      </View>
    );
  }

  const displayName = data?.userName ?? user?.name ?? t("profile.student");
  const initial = String(displayName).trim().charAt(0).toUpperCase();
  const memberSince = data?.memberSince
    ? new Date(data.memberSince).toLocaleDateString(language === "ur" ? "ur-PK" : "en-GB", {
        month: "short",
        year: "numeric",
      })
    : null;

  const sub = data?.subscription ?? null;
  const trialDays = Number(sub?.trialDaysRemaining ?? 0);
  const subPill = sub?.subscriptionActive
    ? t("profile.premium")
    : sub?.trialActive
      ? t("profile.trialDaysLeft", { count: trialDays, suffix: trialDays === 1 ? "" : "s" })
      : null;

  const header = (
    <View style={[styles.header, { paddingTop: desktopWeb ? 0 : insets.top + Theme.Spacing.md }]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t("tabs.profile")}</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("profile.shareProgress")}
            onPress={() => router.push("/(app)/share-stats")}
            style={styles.iconButton}
          >
            <Ionicons name="share-social-outline" size={22} color={Theme.WarshPalette.navy} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("a11y.settings")}
            onPress={() => router.push("/(app)/settings")}
            style={styles.iconButton}
          >
            <Ionicons name="settings-outline" size={22} color={Theme.WarshPalette.navy} />
          </Pressable>
        </View>
      </View>
      <View style={styles.profileRow}>
        <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileText}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("a11y.editProfile")}
            onPress={() => router.push("/(app)/edit-profile")}
            style={styles.nameButton}
            hitSlop={6}
          >
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <Ionicons name="create-outline" size={16} color={Theme.WarshPalette.goldText} />
          </Pressable>
          {memberSince ? (
            <Text style={styles.memberSince}>{t("profile.memberSince", { date: memberSince })}</Text>
          ) : null}
          {subPill ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(app)/manage-subscription")}
            style={styles.subPill}
            hitSlop={6}
          >
            <Text style={styles.subPillText} numberOfLines={1}>{subPill}</Text>
            <Ionicons name="chevron-forward" size={16} color={Theme.WarshPalette.goldText} />
          </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );

  const weekLetters = t("profile.weekdays").split(",");
  const weekNames = t("profile.weekdayNames").split(",");
  const freezes = Number(data?.streakFreezes ?? 0);

  const streakCard = data ? (
    <Pressable style={styles.streakCard} onPress={() => router.push("/(app)/streak-detail")}>
      <View style={styles.streakTopRow}>
        <View style={styles.streakValueRow}>
          <Text style={styles.streakNumber}>{data.streak ?? 0}</Text>
          <Text style={styles.streakLabel}>{t("profile.dayStreak")}</Text>
        </View>
        {freezes > 0 ? (
          <View style={styles.freezeRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={Theme.WarshPalette.sageDeep} />
            <Text style={styles.freezeText}>
              {t("profile.freezeCount", { count: freezes, suffix: freezes === 1 ? "" : "s" })}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.weekRow}>
        {((data.week ?? []) as WeekDay[]).map((day) => {
          const name = weekNames[day.weekday] ?? "";
          const label = day.done
            ? t("profile.dayDone", { day: name })
            : day.today
              ? t("profile.dayToday", { day: name })
              : name;
          return (
            <View key={day.weekday} style={styles.weekDay} accessible accessibilityLabel={label}>
              <Text style={[styles.weekLetter, day.today && styles.weekLetterToday]}>{weekLetters[day.weekday]}</Text>
              <View
                style={[
                  styles.weekDot,
                  day.done ? styles.weekDotDone : day.today ? styles.weekDotToday : styles.weekDotFuture,
                ]}
              >
                {day.done ? <Ionicons name="checkmark" size={16} color={Theme.WarshPalette.white} /> : null}
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.streakQuote}>{t("profile.streakQuote")}</Text>
    </Pressable>
  ) : null;

  const levelProgress = data?.levelProgress ?? null;
  const thisWeek = data?.thisWeek ?? {};
  const stats: { ar: string; label: string; value: number; week?: number }[] = data
    ? [
        { ar: "نِقَاط", label: t("profile.statPoints"), value: Number(data.xp ?? 0) },
        { ar: "دُرُوس", label: t("profile.statLessons"), value: data.completedLessons?.length ?? 0, week: thisWeek.lessons },
        { ar: "كَلِمَات", label: t("profile.statWords"), value: Number(data.vocabTotal ?? 0), week: thisWeek.words },
        { ar: "إِتْقَان", label: t("profile.statMastered"), value: Number(data.vocabMastered ?? 0) },
        { ar: "عِبَارَات", label: t("profile.statPhrases"), value: Number(data.phrasesSpoken ?? 0) },
        { ar: "سُوَر", label: t("profile.statSurahs"), value: Number(data.surahsCompleted ?? 0) },
      ]
    : [];
  // The "+N this week" line only earns its height when some stat moved.
  const anyWeekGain = stats.some((stat) => (stat.week ?? 0) > 0);

  const progressCard = data ? (
    <View style={styles.progressCard}>
      {levelProgress ? (
        <>
          <View style={styles.levelRow}>
            <Text style={styles.cardTitle}>{t(`profile.level${levelProgress.level}`)}</Text>
            <Text style={styles.levelMeta}>
              {levelProgress.nextLevel
                ? t("profile.pointsToLevel", {
                    points: levelProgress.pointsToNext,
                    level: t(`profile.level${levelProgress.nextLevel}`),
                  })
                : t("profile.topLevel")}
            </Text>
          </View>
          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: levelProgress.percent }}
          >
            <View style={[styles.progressFill, { width: `${levelProgress.percent}%` as DimensionValue }]} />
          </View>
        </>
      ) : null}
      <View style={styles.statGrid}>
        {stats.map((stat) => (
          <View key={stat.ar} style={styles.statCell}>
            <ArabicText size="sm" style={styles.statArabic}>{stat.ar}</ArabicText>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            {anyWeekGain ? (
              <Text style={styles.statDelta}>
                {stat.week && stat.week > 0 ? t("profile.thisWeek", { count: stat.week }) : " "}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  ) : null;

  const earned = (data?.achievements ?? []) as any[];
  const next = data?.nextMilestone ?? null;
  const milestonesCard = data && (earned.length > 0 || next) ? (
    <View style={styles.milestonesCard}>
      <View style={styles.milestonesHeader}>
        <Text style={styles.cardTitle}>{t("profile.milestones")}</Text>
        {earned.length > 0 ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/milestones" as any)}
            style={styles.seeAll}
            hitSlop={6}
          >
            <Text style={styles.seeAllText}>{t("profile.seeAllMilestones", { count: earned.length })}</Text>
            <Ionicons name="chevron-forward" size={16} color={Theme.WarshPalette.goldText} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.badgeRow}>
        {earned.slice(-(next ? 4 : 5)).map((a) => (
          <View key={a.key} style={styles.badge}>
            <Ionicons name={a.icon as any} size={20} color={Theme.WarshPalette.goldText} />
            <ArabicText size="sm" style={styles.badgeTitle}>{a.title}</ArabicText>
          </View>
        ))}
        {next ? (
          <View style={[styles.badge, styles.badgeNext]}>
            <Ionicons name={next.icon as any} size={20} color={Theme.WarshPalette.subtleBrown} />
            <ArabicText size="sm" style={styles.badgeTitle}>{next.title}</ArabicText>
          </View>
        ) : null}
      </View>
      {next ? (
        <View style={styles.nextRow}>
          <Text style={styles.nextLabel}>{t("profile.nextMilestone")}</Text>
          <View style={styles.nextTrack}>
            <View
              style={[
                styles.nextFill,
                { width: `${Math.round((next.current / next.target) * 100)}%` as DimensionValue },
              ]}
            />
          </View>
          <Text style={styles.nextCount}>
            {t("profile.milestoneProgress", {
              current: next.current,
              target: next.target,
              unit: t(`profile.unit_${next.unit}`),
            })}
          </Text>
        </View>
      ) : null}
    </View>
  ) : null;

  // Noor's note is drawn from the learner's own numbers: unmastered words point
  // to review; otherwise it invites a question.
  const vocabTotal = Number(data?.vocabTotal ?? 0);
  const vocabMastered = Number(data?.vocabMastered ?? 0);
  const reviewNudge = vocabTotal > 0 && vocabMastered < vocabTotal;
  const noorCard = data ? (
    <View style={styles.noorCard}>
      <Text style={styles.noorLabel}>{t("profile.noor")}</Text>
      <Text style={styles.noorText}>
        {reviewNudge
          ? t("profile.noorReviewTip", { total: vocabTotal, mastered: vocabMastered })
          : t("profile.noorAskTip")}
      </Text>
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push(reviewNudge ? "/(app)/(tabs)/vocabulary" : "/(app)/(tabs)/chat")}
        style={styles.noorLink}
        hitSlop={6}
      >
        <Text style={styles.noorLinkText}>{reviewNudge ? t("profile.noorReviewCta") : t("profile.noorAskCta")}</Text>
        <Ionicons name="chevron-forward" size={16} color={Theme.WarshPalette.gold} />
      </Pressable>
    </View>
  ) : null;

  const errorText = error ? <Text style={styles.errorText}>{error}</Text> : null;

  if (desktopWeb) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.webContent}>
        <View style={styles.webLayout}>
          <View style={styles.webLeftColumn}>
            {header}
            {streakCard}
          </View>
          <View style={styles.webRightColumn}>
            {errorText}
            {progressCard}
            {milestonesCard}
            {noorCard}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
      >
        {header}
        {errorText}
        {streakCard}
        {progressCard}
        {milestonesCard}
        {noorCard}
      </ScrollView>
      <StatusBarBacking />
    </View>
  );
}

const cardBase = {
  padding: Theme.Spacing.lg,
  borderRadius: Theme.Radii.md,
  borderWidth: 0.5,
} as const;

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.Colors.bg.primary,
  },
  screen: {
    flex: 1,
    backgroundColor: Theme.Colors.bg.primary,
  },
  content: {
    paddingHorizontal: Theme.Spacing.xl,
    gap: Theme.Spacing.md,
  },
  webContent: {
    paddingBottom: 48,
  },
  webLayout: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 32,
    paddingHorizontal: 32,
    paddingTop: 36,
  },
  webLeftColumn: {
    width: 400,
    flexShrink: 0,
    gap: Theme.Spacing.lg,
  },
  webRightColumn: {
    flex: 1,
    minWidth: 0,
    gap: Theme.Spacing.md,
  },
  header: {
    paddingBottom: Theme.Spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: Theme.WarshPalette.navy,
    fontFamily: Theme.Fonts.display,
    fontSize: Theme.FontSizes.display,
    lineHeight: Theme.desktopLineHeight(36, 30),
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: -11,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Theme.Spacing.md,
    marginTop: Theme.Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.Radii.full,
    backgroundColor: Theme.WarshPalette.navy,
  },
  avatarText: {
    color: Theme.WarshPalette.white,
    fontFamily: Theme.Fonts.semiBold,
    fontSize: Theme.desktopFontSize(18),
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  nameButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    maxWidth: "100%",
    minHeight: 28,
  },
  userName: {
    flexShrink: 1,
    color: Theme.WarshPalette.ink,
    fontFamily: Theme.Fonts.semiBold,
    fontSize: Theme.FontSizes.h2,
    lineHeight: Theme.desktopLineHeight(24, 18),
  },
  memberSince: {
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.caption,
    lineHeight: Theme.LineHeights.caption,
  },
  subPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: Theme.Spacing.sm,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: Theme.Radii.full,
    borderWidth: 1,
    borderColor: Theme.WarshPalette.goldText,
  },
  subPillText: {
    color: Theme.WarshPalette.goldText,
    fontFamily: Theme.Fonts.semiBold,
    fontSize: Theme.FontSizes.label,
  },
  errorText: {
    color: Theme.WarshPalette.wrongText,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.bodyM,
    lineHeight: Theme.LineHeights.bodyM,
  },
  streakCard: {
    ...cardBase,
    borderColor: Theme.WarshPalette.parchmentCardBorder,
    backgroundColor: Theme.WarshPalette.parchmentBg,
  },
  streakTopRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  streakValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  streakNumber: {
    color: Theme.WarshPalette.sageDeep,
    fontFamily: Theme.Fonts.bold,
    fontSize: Theme.desktopFontSize(40),
    lineHeight: Theme.desktopLineHeight(48, 40),
    fontVariant: ["lining-nums", "tabular-nums"],
  },
  streakLabel: {
    marginBottom: Theme.Spacing.sm,
    marginLeft: Theme.Spacing.sm,
    color: Theme.WarshPalette.bodyBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.bodyM,
    lineHeight: Theme.LineHeights.bodyM,
  },
  freezeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Theme.Spacing.sm,
  },
  freezeText: {
    color: Theme.WarshPalette.sageDeep,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.label,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Theme.Spacing.md,
  },
  weekDay: {
    alignItems: "center",
    gap: 6,
  },
  weekLetter: {
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.label,
    lineHeight: Theme.LineHeights.label,
  },
  weekLetterToday: {
    color: Theme.WarshPalette.goldText,
    fontFamily: Theme.Fonts.bold,
  },
  weekDot: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.Radii.full,
  },
  weekDotDone: {
    backgroundColor: Theme.WarshPalette.sageDeep,
  },
  weekDotToday: {
    borderWidth: 2,
    borderColor: Theme.WarshPalette.goldText,
  },
  weekDotFuture: {
    borderWidth: 1,
    borderColor: Theme.WarshPalette.cream,
  },
  streakQuote: {
    marginTop: Theme.Spacing.md,
    color: Theme.WarshPalette.goldText,
    fontFamily: Theme.Fonts.italic,
    fontSize: Theme.FontSizes.caption,
    fontStyle: "italic",
    lineHeight: Theme.LineHeights.caption,
  },
  progressCard: {
    ...cardBase,
    borderColor: Theme.WarshPalette.defaultCardBorder,
    backgroundColor: Theme.WarshPalette.white,
  },
  cardTitle: {
    color: Theme.WarshPalette.ink,
    fontFamily: Theme.Fonts.display,
    fontSize: Theme.FontSizes.h2,
    lineHeight: Theme.desktopLineHeight(24, 18),
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: Theme.Spacing.sm,
  },
  levelMeta: {
    flexShrink: 1,
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.caption,
    lineHeight: Theme.LineHeights.caption,
    textAlign: "right",
  },
  progressTrack: {
    height: 6,
    marginTop: 10,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: Theme.WarshPalette.sageTintBg,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Theme.WarshPalette.sageDeep,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Theme.Spacing.sm,
    marginTop: Theme.Spacing.lg,
  },
  statCell: {
    width: "31.5%",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: Theme.Radii.sm,
    backgroundColor: Theme.WarshPalette.parchmentBg,
  },
  statArabic: {
    color: Theme.WarshPalette.goldText,
    fontSize: Theme.FontSizes.h3,
    lineHeight: Theme.desktopLineHeight(24, 16),
    textAlign: "center",
  },
  statValue: {
    color: Theme.WarshPalette.sageDeep,
    fontFamily: Theme.Fonts.bold,
    fontSize: Theme.desktopFontSize(22),
    lineHeight: Theme.desktopLineHeight(28, 22),
    fontVariant: ["lining-nums", "tabular-nums"],
  },
  statLabel: {
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.label,
    lineHeight: Theme.LineHeights.label,
    textAlign: "center",
  },
  statDelta: {
    marginTop: 4,
    color: Theme.WarshPalette.sageDeep,
    fontFamily: Theme.Fonts.semiBold,
    fontSize: Theme.FontSizes.label,
    lineHeight: Theme.LineHeights.label,
    textAlign: "center",
  },
  milestonesCard: {
    ...cardBase,
    borderColor: Theme.WarshPalette.parchmentCardBorder,
    backgroundColor: Theme.WarshPalette.parchmentBg,
  },
  milestonesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 32,
  },
  seeAllText: {
    color: Theme.WarshPalette.goldText,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.caption,
  },
  badgeRow: {
    flexDirection: "row",
    gap: Theme.Spacing.sm,
    marginTop: Theme.Spacing.sm,
  },
  badge: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Theme.Spacing.sm,
    paddingHorizontal: 2,
    borderRadius: Theme.Radii.sm,
    borderWidth: 0.5,
    borderColor: Theme.WarshPalette.defaultCardBorder,
    backgroundColor: Theme.WarshPalette.white,
  },
  badgeNext: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Theme.WarshPalette.goldDeep,
    backgroundColor: "transparent",
  },
  badgeTitle: {
    marginTop: 4,
    color: Theme.WarshPalette.subtleBrown,
    fontSize: Theme.desktopFontSize(12),
    lineHeight: Theme.desktopLineHeight(16, 12),
    textAlign: "center",
  },
  nextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: Theme.Spacing.md,
  },
  nextLabel: {
    color: Theme.WarshPalette.bodyBrown,
    fontFamily: Theme.Fonts.semiBold,
    fontSize: Theme.FontSizes.label,
  },
  nextTrack: {
    flex: 1,
    height: 6,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: Theme.WarshPalette.parchmentDeep,
  },
  nextFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Theme.WarshPalette.goldText,
  },
  nextCount: {
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.label,
  },
  noorCard: {
    padding: Theme.Spacing.lg,
    borderRadius: Theme.Radii.md,
    backgroundColor: Theme.WarshPalette.navy,
  },
  noorLabel: {
    color: Theme.WarshPalette.gold,
    fontFamily: Theme.Fonts.semiBold,
    fontSize: Theme.FontSizes.label,
    lineHeight: Theme.LineHeights.label,
  },
  noorText: {
    marginTop: Theme.Spacing.sm,
    color: Theme.WarshPalette.creamBg,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.bodyM,
    lineHeight: Math.round(Theme.FontSizes.bodyM * 1.6),
  },
  noorLink: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    minHeight: 36,
    marginTop: Theme.Spacing.xs,
  },
  noorLinkText: {
    color: Theme.WarshPalette.gold,
    fontFamily: Theme.Fonts.semiBold,
    fontSize: Theme.FontSizes.bodyM,
  },
});
