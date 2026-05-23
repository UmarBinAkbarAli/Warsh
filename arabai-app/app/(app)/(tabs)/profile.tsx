import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DimensionValue } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { useAuth } from "@hooks/useAuth";
import * as Theme from "../../../constants/theme";
import { BrandButton } from "@components/BrandButton";
import { ArabicText } from "@components/ArabicText";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
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
      setError("Unable to load profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const displayName = data?.user?.name ?? user?.name ?? "Student";
  const streak = Math.max(0, Math.min(Number(data?.streak ?? 0), 7));
  const xp = Number(data?.xp ?? 0);
  const completedLessons = data?.completedLessons?.length ?? 0;
  const level = data?.level ?? Math.floor(xp / 100) + 1;
  const progressPercent = `${xp % 100}%` as DimensionValue;
  const headerCardStyle = [styles.headerCard, { paddingTop: insets.top + Theme.Spacing.xl }];

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
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.greeting}>As-salamu alaykum</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {data ? (
        <>
          <View style={styles.streakCard}>
            <View style={styles.streakValueRow}>
              <Text style={styles.streakNumber}>{data.streak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
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
                {data.streakFreezes} streak freeze{data.streakFreezes !== 1 ? "s" : ""} · earns at 7-day and 30-day streaks
              </Text>
            ) : null}
            <Text style={styles.streakQuote}>The most beloved deed to Allah is the consistent one, even if small.</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <ArabicText size="sm" style={styles.statArabicLabel}>
                نقاط
              </ArabicText>
              <Text style={styles.statValue}>{data.xp}</Text>
              <Text style={styles.statSub}>points earned</Text>
            </View>

            <View style={styles.statCard}>
              <ArabicText size="sm" style={styles.statArabicLabel}>
                دروس
              </ArabicText>
              <Text style={styles.statValue}>{completedLessons}</Text>
              <Text style={styles.statSub}>lessons done</Text>
            </View>
          </View>

          <View style={styles.levelCard}>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Level</Text>
              <Text style={styles.levelValue}>{level}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressPercent }]} />
            </View>
          </View>

          {(data.achievements?.length ?? 0) > 0 ? (
            <Pressable style={styles.achievementsCard} onPress={() => router.push("/milestones" as any)}>
              <View style={styles.achievementsHeader}>
                <Text style={styles.achievementsTitle}>Milestones</Text>
                <Text style={styles.achievementsCount}>{data.achievements.length} earned ›</Text>
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

          {(data.phrasesSpoken ?? 0) > 0 ? (
            <View style={styles.speakingCard}>
              <View style={styles.speakingIconRow}>
                <Ionicons name="mic-outline" size={20} color={Theme.WarshPalette.sage} />
                <Text style={styles.speakingTitle}>Speaking</Text>
              </View>
              <Text style={styles.speakingCount}>{data.phrasesSpoken}</Text>
              <Text style={styles.speakingSub}>phrases you can say</Text>
            </View>
          ) : null}

          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>Ustaad Noor</Text>
            <Text style={styles.tipText}>
              Keep your streak alive. The Prophet ﷺ said: the most beloved deeds to Allah are those done consistently,
              even if small. Five minutes of Arabic every day beats five hours once a week.
            </Text>
          </View>
        </>
      ) : null}

      <BrandButton title="Log Out" onPress={logout} variant="danger" style={styles.logoutButton} />
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
});
