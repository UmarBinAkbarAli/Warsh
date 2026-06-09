import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DimensionValue } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { useAuth } from "@hooks/useAuth";
import { useLanguage } from "@services/language";
import * as Theme from "../../../constants/theme";
import { BrandButton } from "@components/BrandButton";
import { ArabicText } from "@components/ArabicText";
import { useT } from "@i18n/index";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
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

  const displayName = data?.user?.name ?? user?.name ?? t("profile.student");
  const streak = Math.max(0, Math.min(Number(data?.streak ?? 0), 7));
  const xp = Number(data?.xp ?? 0);
  const completedLessons = data?.completedLessons?.length ?? 0;
  const level = data?.level ?? Math.floor(xp / 100) + 1;
  const progressPercent = `${xp % 100}%` as DimensionValue;
  const headerCardStyle = [styles.headerCard, { paddingTop: insets.top + Theme.Spacing.xl }];
  const memberSince = data?.memberSince
    ? new Date(data.memberSince).toLocaleDateString(language === "ur" ? "ur-PK" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={headerCardStyle}>
        <View style={styles.headerTopRow}>
          <View style={styles.brandLine}>
            <Text style={styles.brandEnglish}>Warsh</Text>
            <Text style={styles.brandSeparator}> · </Text>
            <ArabicText size="sm" style={styles.brandArabic}>
              وَرْش
            </ArabicText>
          </View>
          <Pressable onPress={() => router.push("/(app)/settings")} hitSlop={8}>
            <Ionicons name="settings-outline" size={22} color={Theme.WarshPalette.gold} />
          </Pressable>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.userName}>{displayName}</Text>
          <Pressable onPress={() => router.push("/(app)/edit-profile")} hitSlop={8}>
            <Ionicons name="create-outline" size={16} color={Theme.WarshPalette.gold} />
          </Pressable>
        </View>
        <Text style={styles.greeting}>{t("profile.greeting")}</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {data ? (
        <>
          <Pressable style={styles.streakCard} onPress={() => router.push("/(app)/streak-detail")}>
            <View style={styles.streakValueRow}>
              <Text style={styles.streakNumber}>{data.streak}</Text>
              <Text style={styles.streakLabel}>{t("profile.dayStreak")}</Text>
              {(data.streakFreezes ?? 0) > 0 ? (
                <View style={styles.freezeRow}>
                  {Array.from({ length: data.streakFreezes as number }).map((_: unknown, i: number) => (
                    <Ionicons key={i} name="shield-checkmark" size={16} color={Theme.WarshPalette.sage} />
                  ))}
                </View>
              ) : null}
            </View>
            <View style={styles.streakDots}>
              {Array.from({ length: 7 }).map((_, index) => {
                const completed = index >= 7 - streak;
                return <View key={index} style={[styles.streakDot, completed ? styles.streakDotFilled : styles.streakDotEmpty]} />;
              })}
            </View>
            {(data.streakFreezes ?? 0) > 0 ? (
              <Text style={styles.freezeNote}>
                {t("profile.freezeNote", { count: data.streakFreezes, suffix: data.streakFreezes !== 1 ? "s" : "" })}
              </Text>
            ) : null}
            <Text style={styles.streakQuote}>{t("profile.streakQuote")}</Text>
          </Pressable>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <ArabicText size="sm" style={styles.statArabicLabel}>
                نقاط
              </ArabicText>
              <Text style={styles.statValue}>{data.xp}</Text>
              <Text style={styles.statSub}>{t("profile.pointsEarned")}</Text>
            </View>

            <View style={styles.statCard}>
              <ArabicText size="sm" style={styles.statArabicLabel}>
                دروس
              </ArabicText>
              <Text style={styles.statValue}>{completedLessons}</Text>
              <Text style={styles.statSub}>{t("profile.lessonsDone")}</Text>
            </View>
          </View>

          <View style={styles.levelCard}>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>{t("profile.level")}</Text>
              <Text style={styles.levelValue}>{level}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressPercent }]} />
            </View>
          </View>

          {(data.achievements?.length ?? 0) > 0 ? (
            <Pressable style={styles.achievementsCard} onPress={() => router.push("/milestones" as any)}>
              <View style={styles.achievementsHeader}>
                <Text style={styles.achievementsTitle}>{t("profile.milestones")}</Text>
                <Text style={styles.achievementsCount}>{t("profile.earnedCount", { count: data.achievements.length })}</Text>
              </View>
              <View style={styles.achievementsRow}>
                {(data.achievements as any[]).slice(0, 5).map((a: any) => (
                  <View key={a.key} style={styles.achievementBadge}>
                    <Ionicons name={a.icon as any} size={22} color={Theme.WarshPalette.gold} />
                    <ArabicText size="sm" style={styles.achievementTitle}>{a.title}</ArabicText>
                  </View>
                ))}
                {data.achievements.length > 5 ? (
                  <View style={[styles.achievementBadge, styles.achievementMore]}>
                    <Text style={styles.achievementMoreText}>+{data.achievements.length - 5}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ) : null}

          {(data.vocabTotal ?? 0) > 0 ? (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="book-outline" size={20} color={Theme.WarshPalette.gold} />
                <Text style={styles.statValue}>{data.vocabTotal}</Text>
                <Text style={styles.statSub}>{t("profile.wordsInBank")}</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="star-outline" size={20} color={Theme.WarshPalette.sage} />
                <Text style={styles.statValue}>{data.vocabMastered ?? 0}</Text>
                <Text style={styles.statSub}>{t("profile.wordsMastered")}</Text>
              </View>
              {(data.surahsCompleted ?? 0) > 0 ? (
                <View style={styles.statCard}>
                  <Ionicons name="moon-outline" size={20} color={Theme.WarshPalette.gold} />
                  <Text style={styles.statValue}>{data.surahsCompleted}</Text>
                  <Text style={styles.statSub}>{t("profile.surahsUnderstood")}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {data.memberSince ? (
            <View style={styles.memberSinceRow}>
              <Ionicons name="calendar-outline" size={14} color={Theme.WarshPalette.subtleBrown} />
              <Text style={styles.memberSinceText}>
                {t("profile.memberSince", { date: memberSince ?? "" })}
              </Text>
            </View>
          ) : null}

          {(data.phrasesSpoken ?? 0) > 0 ? (
            <View style={styles.speakingCard}>
              <View style={styles.speakingIconRow}>
                <Ionicons name="mic-outline" size={20} color={Theme.WarshPalette.sage} />
                <Text style={styles.speakingTitle}>{t("profile.speaking")}</Text>
              </View>
              <Text style={styles.speakingCount}>{data.phrasesSpoken}</Text>
              <Text style={styles.speakingSub}>{t("profile.phrasesYouCanSay")}</Text>
            </View>
          ) : null}

          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>{t("profile.noor")}</Text>
            <Text style={styles.tipText}>{t("profile.noorTip")}</Text>
          </View>
        </>
      ) : null}

      <BrandButton
        title={t("profile.shareProgress")}
        onPress={() => router.push("/(app)/share-stats")}
        variant="secondary"
        style={styles.shareButton}
      />
      <BrandButton title={t("profile.logOut")} onPress={logout} variant="danger" style={styles.logoutButton} />
    </ScrollView>
  );
}

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
    paddingBottom: Theme.Spacing.xl,
  },
  headerCard: {
    width: "100%",
    paddingHorizontal: Theme.Spacing.xl,
    paddingBottom: 40,
    backgroundColor: Theme.WarshPalette.ink,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandEnglish: {
    color: Theme.WarshPalette.gold,
    fontFamily: Theme.Fonts.display,
    fontSize: Theme.FontSizes.displayXL,
    fontWeight: "500",
    lineHeight: Theme.LineHeights.displayXL,
  },
  brandSeparator: {
    color: Theme.WarshPalette.gold,
    fontFamily: Theme.Fonts.display,
    fontSize: Theme.FontSizes.displayXL,
    fontWeight: "500",
    lineHeight: Theme.LineHeights.displayXL,
  },
  brandArabic: {
    color: Theme.WarshPalette.gold,
    fontSize: Theme.FontSizes.displayL,
    lineHeight: Theme.LineHeights.displayL,
    textAlign: "left",
  },
  userName: {
    marginTop: Theme.Spacing.sm,
    color: Theme.WarshPalette.parchment,
    fontFamily: Theme.Fonts.display,
    fontSize: Theme.FontSizes.h3,
    lineHeight: Theme.LineHeights.h3,
  },
  greeting: {
    marginTop: Theme.Spacing.xs,
    color: Theme.WarshPalette.gold,
    fontFamily: Theme.Fonts.italic,
    fontSize: Theme.FontSizes.caption,
    fontStyle: "italic",
    lineHeight: Theme.LineHeights.caption,
  },
  errorText: {
    marginHorizontal: Theme.Spacing.xl,
    marginTop: Theme.Spacing.md,
    color: Theme.WarshPalette.wrongText,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.bodyM,
    lineHeight: Theme.LineHeights.bodyM,
  },
  streakCard: {
    marginHorizontal: Theme.Spacing.xl,
    marginTop: Theme.Spacing.lg,
    padding: Theme.Spacing.lg,
    borderRadius: Theme.Radii.md,
    borderWidth: 0.5,
    borderColor: Theme.WarshPalette.parchmentCardBorder,
    backgroundColor: Theme.WarshPalette.parchmentBg,
  },
  streakValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  streakNumber: {
    color: Theme.WarshPalette.sage,
    fontFamily: Theme.Fonts.display,
    fontSize: 48,
    fontWeight: "500",
    lineHeight: 56,
  },
  streakLabel: {
    marginBottom: Theme.Spacing.sm,
    marginLeft: Theme.Spacing.sm,
    color: Theme.WarshPalette.bodyBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.bodyM,
    lineHeight: Theme.LineHeights.bodyM,
  },
  streakDots: {
    flexDirection: "row",
    gap: Theme.Spacing.sm,
    marginTop: Theme.Spacing.sm,
  },
  streakDot: {
    width: Theme.Spacing.sm,
    height: Theme.Spacing.sm,
    borderRadius: Theme.Radii.full,
  },
  streakDotFilled: {
    backgroundColor: Theme.WarshPalette.sage,
  },
  streakDotEmpty: {
    borderWidth: 1,
    borderColor: Theme.WarshPalette.parchmentCardBorder,
  },
  freezeRow: {
    flexDirection: "row",
    gap: 4,
    marginLeft: Theme.Spacing.sm,
    alignItems: "center",
  },
  freezeNote: {
    marginTop: Theme.Spacing.xs,
    color: Theme.WarshPalette.sage,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.caption,
  },
  streakQuote: {
    marginTop: Theme.Spacing.lg,
    color: Theme.WarshPalette.gold,
    fontFamily: Theme.Fonts.italic,
    fontSize: Theme.FontSizes.caption,
    fontStyle: "italic",
    lineHeight: Theme.LineHeights.caption,
  },
  statsRow: {
    flexDirection: "row",
    gap: Theme.Spacing.md,
    marginHorizontal: Theme.Spacing.xl,
    marginTop: Theme.Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Theme.Spacing.lg,
    borderRadius: Theme.Radii.md,
    borderWidth: 0.5,
    borderColor: Theme.WarshPalette.defaultCardBorder,
    backgroundColor: Theme.WarshPalette.white,
  },
  statArabicLabel: {
    color: Theme.WarshPalette.gold,
    fontSize: Theme.FontSizes.h3,
    lineHeight: Theme.LineHeights.h3,
    textAlign: "center",
  },
  statValue: {
    marginTop: Theme.Spacing.xs,
    color: Theme.WarshPalette.sage,
    fontFamily: Theme.Fonts.display,
    fontSize: Theme.FontSizes.arabicL,
    fontWeight: "500",
    lineHeight: 34,
    textAlign: "center",
  },
  statSub: {
    marginTop: Theme.Spacing.xs,
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.label,
    lineHeight: Theme.LineHeights.label,
    textAlign: "center",
  },
  levelCard: {
    marginHorizontal: Theme.Spacing.xl,
    marginTop: Theme.Spacing.md,
    padding: Theme.Spacing.lg,
    borderRadius: Theme.Radii.md,
    borderWidth: 0.5,
    borderColor: Theme.WarshPalette.defaultCardBorder,
    backgroundColor: Theme.WarshPalette.white,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Theme.Spacing.md,
  },
  levelLabel: {
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.bodyM,
    lineHeight: Theme.LineHeights.bodyM,
  },
  levelValue: {
    color: Theme.WarshPalette.ink,
    fontFamily: Theme.Fonts.display,
    fontSize: Theme.FontSizes.arabicM,
    fontWeight: "500",
    lineHeight: Theme.LineHeights.arabicM,
  },
  progressTrack: {
    width: "100%",
    height: Theme.Spacing.xs,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: Theme.WarshPalette.defaultCardBorder,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: Theme.WarshPalette.sage,
  },
  achievementsCard: {
    marginHorizontal: Theme.Spacing.xl,
    marginTop: Theme.Spacing.md,
    padding: Theme.Spacing.lg,
    borderRadius: Theme.Radii.md,
    borderWidth: 0.5,
    borderColor: Theme.WarshPalette.parchmentCardBorder,
    backgroundColor: Theme.WarshPalette.parchmentBg,
  },
  achievementsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Theme.Spacing.md,
  },
  achievementsTitle: {
    color: Theme.WarshPalette.ink,
    fontFamily: Theme.Fonts.display,
    fontSize: Theme.FontSizes.bodyL,
    fontWeight: "500",
    lineHeight: Theme.LineHeights.bodyL,
  },
  achievementsCount: {
    color: Theme.WarshPalette.gold,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.caption,
    lineHeight: Theme.LineHeights.caption,
  },
  achievementsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.Spacing.sm,
  },
  achievementBadge: {
    alignItems: "center",
    width: 56,
    padding: Theme.Spacing.sm,
    borderRadius: Theme.Radii.sm,
    borderWidth: 0.5,
    borderColor: Theme.WarshPalette.defaultCardBorder,
    backgroundColor: Theme.WarshPalette.white,
  },
  achievementTitle: {
    marginTop: 4,
    color: Theme.WarshPalette.subtleBrown,
    fontSize: 8,
    lineHeight: 12,
    textAlign: "center",
  },
  achievementMore: {
    justifyContent: "center",
    backgroundColor: Theme.WarshPalette.parchmentBg,
  },
  achievementMoreText: {
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.display,
    fontSize: Theme.FontSizes.bodyM,
    fontWeight: "500",
    lineHeight: Theme.LineHeights.bodyM,
  },
  speakingCard: {
    marginHorizontal: Theme.Spacing.xl,
    marginTop: Theme.Spacing.md,
    padding: Theme.Spacing.lg,
    borderRadius: Theme.Radii.md,
    borderWidth: 0.5,
    borderColor: Theme.WarshPalette.parchmentCardBorder,
    backgroundColor: Theme.WarshPalette.parchmentBg,
  },
  speakingIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: Theme.Spacing.sm,
  },
  speakingTitle: {
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.label,
    lineHeight: Theme.LineHeights.label,
  },
  speakingCount: {
    color: Theme.WarshPalette.ink,
    fontFamily: Theme.Fonts.display,
    fontSize: 36,
    fontWeight: "500",
    lineHeight: 44,
  },
  speakingSub: {
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.bodyM,
    lineHeight: Theme.LineHeights.bodyM,
  },
  tipCard: {
    marginHorizontal: Theme.Spacing.xl,
    marginTop: Theme.Spacing.md,
    padding: Theme.Spacing.lg,
    borderRadius: Theme.Radii.md,
    backgroundColor: Theme.WarshPalette.ink,
  },
  tipLabel: {
    color: Theme.WarshPalette.gold,
    fontFamily: Theme.Fonts.display,
    fontSize: Theme.FontSizes.label,
    lineHeight: Theme.LineHeights.label,
  },
  tipText: {
    marginTop: Theme.Spacing.sm,
    color: Theme.WarshPalette.parchment,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.bodyL,
    lineHeight: Math.round(Theme.FontSizes.bodyL * 1.6),
  },
  logoutButton: {
    marginHorizontal: Theme.Spacing.xl,
    marginTop: Theme.Spacing.xl,
  },
  shareButton: {
    marginHorizontal: Theme.Spacing.xl,
    marginTop: Theme.Spacing.xl,
  },
  memberSinceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.Spacing.xs,
    marginHorizontal: Theme.Spacing.xl,
    marginTop: Theme.Spacing.sm,
  },
  memberSinceText: {
    color: Theme.WarshPalette.subtleBrown,
    fontFamily: Theme.Fonts.regular,
    fontSize: Theme.FontSizes.caption,
    lineHeight: Theme.LineHeights.caption,
  },
});
