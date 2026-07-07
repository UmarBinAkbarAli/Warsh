import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import api from "@services/api";

interface StreakData {
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  lastActiveDate: string | null;
}

const MILESTONES = [
  { days: 3, xp: 50, label: "3 day streak" },
  { days: 7, xp: 150, label: "7 day streak" },
  { days: 30, xp: 500, label: "30 day streak" },
  { days: 100, xp: 2000, label: "100 day streak" },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekCompletedDays(): boolean[] {
  // Mark days up to and including today as "completed" (mock)
  const now = new Date();
  // getDay() returns 0=Sun…6=Sat; convert to Mon=0…Sun=6
  const dow = (now.getDay() + 6) % 7; // today index in Mon-Sun order
  return DAY_LABELS.map((_, i) => i <= dow);
}

function getTodayDayIndex(): number {
  const now = new Date();
  return (now.getDay() + 6) % 7;
}

export default function StreakDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  const weekCompleted = getWeekCompletedDays();
  const todayIndex = getTodayDayIndex();

  useEffect(() => {
    api
      .get("/api/progress")
      .then((res) => {
        const d = res.data.data;
        setData({
          streak: d.streak ?? 0,
          longestStreak: d.longestStreak ?? 0,
          streakFreezes: d.streakFreezes ?? 0,
          lastActiveDate: d.lastActiveDate ?? null,
        });
      })
      .catch(() => {
        setData({ streak: 0, longestStreak: 0, streakFreezes: 0, lastActiveDate: null });
      })
      .finally(() => setLoading(false));
  }, []);

  const currentStreak = data?.streak ?? 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={WarshPalette.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Streak · الاستمرار</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🔥</Text>
          <Text style={styles.heroNumber}>{loading ? "—" : currentStreak}</Text>
          <Text style={styles.heroSubtitle}>day streak</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardHalf]}>
            <Text style={styles.statLabel}>Longest Streak</Text>
            <Text style={styles.statValue}>{loading ? "—" : (data?.longestStreak ?? 0)}</Text>
            <Text style={styles.statUnit}>days</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHalf]}>
            <Text style={styles.statLabel}>Streak Freezes</Text>
            <Text style={styles.statValue}>{loading ? "—" : (data?.streakFreezes ?? 0)}</Text>
            <Text style={styles.statUnit}>remaining</Text>
          </View>
        </View>

        {/* This Week */}
        <Text style={styles.sectionHeader}>This Week</Text>
        <View style={styles.weekRow}>
          {DAY_LABELS.map((day, i) => {
            const isToday = i === todayIndex;
            const isDone = weekCompleted[i];
            return (
              <View
                key={day}
                style={[
                  styles.dayPill,
                  isToday ? styles.dayPillToday : isDone ? styles.dayPillDone : null,
                ]}
              >
                <Text style={[styles.dayLabel, isToday ? styles.dayLabelToday : null]}>{day}</Text>
                <Text style={[styles.dayCheck, isToday ? styles.dayCheckToday : null]}>
                  {isDone ? "✓" : "·"}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Streak Milestones */}
        <Text style={styles.sectionHeader}>Streak Milestones</Text>
        <View style={styles.card}>
          {MILESTONES.map((m, idx) => {
            const achieved = currentStreak >= m.days;
            return (
              <View key={m.days}>
                {idx > 0 ? <View style={styles.divider} /> : null}
                <View
                  style={[
                    styles.milestoneRow,
                    achieved ? styles.milestoneRowAchieved : null,
                  ]}
                >
                  <Text style={styles.milestoneEmoji}>🔥</Text>
                  <Text style={[styles.milestoneLabel, achieved ? styles.milestoneLabelAchieved : null]}>
                    {m.label}
                  </Text>
                  <Text style={[styles.milestoneXp, achieved ? styles.milestoneXpAchieved : null]}>
                    +{m.xp} XP
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* How streaks work */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How streaks work</Text>
          <Text style={styles.infoBody}>
            Complete your daily goal to maintain your streak. A new day starts at 4 AM.
            Miss a day? Use a streak freeze to protect it.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: WarshPalette.parchmentBg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: WarshPalette.defaultCardBorder,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    color: WarshPalette.ink,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: Spacing.sm,
  },

  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },

  // Hero
  heroSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  heroEmoji: {
    fontSize: 56,
    lineHeight: 68,
  },
  heroNumber: {
    fontFamily: Fonts.bold,
    fontSize: 64,
    fontWeight: "700",
    color: WarshPalette.ink,
    lineHeight: 72,
    marginTop: Spacing.xs,
  },
  heroSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: WarshPalette.bodyBrown,
    marginTop: 2,
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    backgroundColor: WarshPalette.white,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    padding: Spacing.md,
    alignItems: "center",
  },
  statCardHalf: {
    flex: 1,
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
    marginBottom: 4,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    fontWeight: "700",
    color: WarshPalette.ink,
    lineHeight: 34,
  },
  statUnit: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    marginTop: 2,
  },

  // Section header
  sectionHeader: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.caption,
    color: WarshPalette.gold,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginLeft: 2,
    marginTop: Spacing.sm,
  },

  // Week pills
  weekRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  dayPill: {
    flex: 1,
    alignItems: "center",
    backgroundColor: WarshPalette.parchmentBg,
    borderRadius: Radii.sm,
    paddingVertical: Spacing.sm,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
  },
  dayPillToday: {
    backgroundColor: WarshPalette.gold,
    borderColor: WarshPalette.gold,
  },
  dayPillDone: {
    backgroundColor: WarshPalette.cream,
    borderColor: WarshPalette.defaultCardBorder,
  },
  dayLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label ?? FontSizes.caption,
    color: WarshPalette.bodyBrown,
    fontWeight: "600",
  },
  dayLabelToday: {
    color: WarshPalette.white,
  },
  dayCheck: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    marginTop: 2,
  },
  dayCheckToday: {
    color: WarshPalette.white,
  },

  // Milestones card
  card: {
    backgroundColor: WarshPalette.white,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  divider: {
    height: 0.5,
    backgroundColor: WarshPalette.defaultCardBorder,
    marginHorizontal: Spacing.md,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  milestoneRowAchieved: {
    backgroundColor: "rgba(200, 160, 71, 0.08)",
  },
  milestoneEmoji: {
    fontSize: 18,
    width: 24,
    textAlign: "center",
  },
  milestoneLabel: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.bodyBrown,
  },
  milestoneLabelAchieved: {
    fontFamily: Fonts.semiBold,
    color: WarshPalette.ink,
    fontWeight: "600",
  },
  milestoneXp: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.subtleBrown,
    fontWeight: "600",
  },
  milestoneXpAchieved: {
    color: WarshPalette.gold,
  },

  // Info card
  infoCard: {
    backgroundColor: WarshPalette.parchmentBg,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.ink,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  infoBody: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    lineHeight: LineHeights.bodyM,
  },
});
