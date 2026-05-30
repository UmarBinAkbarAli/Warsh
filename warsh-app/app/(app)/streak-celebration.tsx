import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const COMMITMENT_KEY = "warsh_streak_commitment_set";

function getTodayDayIndex() {
  // getDay() returns 0=Sun…6=Sat; convert to Mon-based index
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function getMotivationalCopy(streak: number): string {
  if (streak === 1) return "Amazing start! Think you can do it again tomorrow?";
  if (streak < 7) return `${streak} days in a row. You're building something real.`;
  if (streak < 14) return "One week strong. Ustaad Noor is proud of you!";
  if (streak < 30) return `${streak} days. This is discipline — keep going.`;
  return `${streak} days! SubhanAllah — you are unstoppable.`;
}

export default function StreakCelebrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { streak: streakParam } = useLocalSearchParams<{ streak: string }>();
  const streak = parseInt(streakParam ?? "1", 10) || 1;
  const todayIdx = getTodayDayIndex();

  async function handleContinue() {
    const committed = await AsyncStorage.getItem(COMMITMENT_KEY);
    if (committed) {
      router.replace("/(app)/(tabs)");
    } else {
      router.push("/(app)/streak-commitment");
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.lg }]}>
      {/* Flame */}
      <View style={styles.center}>
        <Text style={styles.flame}>🔥</Text>
        <Text style={styles.streakCount}>{streak}</Text>
        <Text style={styles.streakLabel}>day streak!</Text>

        {/* Week row */}
        <View style={styles.weekRow}>
          {DAYS.map((day, i) => {
            const completed = i <= todayIdx;
            const isToday = i === todayIdx;
            return (
              <View key={day} style={styles.dayCol}>
                <View style={[
                  styles.dayCircle,
                  completed ? styles.dayCircleCompleted : null,
                  isToday ? styles.dayCircleToday : null,
                ]}>
                  {isToday ? (
                    <Text style={styles.dayCheckToday}>✓</Text>
                  ) : completed ? (
                    <View style={styles.dayDot} />
                  ) : null}
                </View>
                <Text style={[styles.dayLabel, isToday ? styles.dayLabelToday : null]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.motivational}>{getMotivationalCopy(streak)}</Text>
      </View>

      <BrandButton
        title="Continue"
        onPress={handleContinue}
        style={styles.cta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.xl,
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  flame: {
    fontSize: 80,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  streakCount: {
    fontFamily: Fonts.bold,
    fontSize: 64,
    fontWeight: "700",
    color: WarshPalette.ink,
    lineHeight: 72,
  },
  streakLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.h2,
    color: WarshPalette.bodyBrown,
    lineHeight: LineHeights.h2,
    marginBottom: Spacing.lg,
  },
  weekRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    backgroundColor: WarshPalette.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
  },
  dayCol: {
    alignItems: "center",
    gap: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: WarshPalette.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleCompleted: {
    backgroundColor: WarshPalette.parchment,
  },
  dayCircleToday: {
    backgroundColor: WarshPalette.gold,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WarshPalette.bodyBrown,
  },
  dayCheckToday: {
    color: WarshPalette.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  dayLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
  },
  dayLabelToday: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontWeight: "600",
  },
  motivational: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    lineHeight: LineHeights.bodyL,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  cta: {
    marginTop: Spacing.md,
  },
});
