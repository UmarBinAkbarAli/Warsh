import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandButton } from "@components/BrandButton";
import { CelebrationEmblem } from "@components/CelebrationEmblem";
import {
  Colors,
  FontSizes,
  Fonts,
  LineHeights,
  Radii,
  Shadows,
  Spacing,
  WarshPalette,
} from "../../constants/theme";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const COMMITMENT_KEY = "warsh_streak_commitment_set";

function getTodayDayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

function getMotivationalCopy(streak: number): string {
  if (streak === 1) return "Amazing start. Come back tomorrow and make it two.";
  if (streak < 7) return `${streak} days in a row. You are building something real.`;
  if (streak < 14) return "One week strong. Ustaad Noor is proud of you.";
  if (streak < 30) return `${streak} days. This is discipline — keep going.`;
  return `${streak} days. SubhanAllah — your consistency is remarkable.`;
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
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>TODAY&apos;S PRACTICE</Text>
          <CelebrationEmblem icon="flame-outline" tone="dark" />
          <View style={styles.streakHeading}>
            <Text style={styles.streakCount}>{streak}</Text>
            <View>
              <Text style={styles.streakLabel}>day</Text>
              <Text style={styles.streakLabel}>streak</Text>
            </View>
          </View>
          <Text style={styles.heroNote}>
            A little every day becomes lasting understanding.
          </Text>
        </View>

        <View style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekEyebrow}>THIS WEEK</Text>
            <Text style={styles.weekStatus}>Today complete</Text>
          </View>
          <View style={styles.weekRow}>
            {DAYS.map((day, dayIndex) => {
              const daysAgo =
                (todayIdx - dayIndex + DAYS.length) % DAYS.length;
              const completed = daysAgo < streak;
              const isToday = dayIndex === todayIdx;
              return (
                <View key={day} style={styles.dayCol}>
                  <View
                    style={[
                      styles.dayCircle,
                      completed ? styles.dayCircleCompleted : null,
                      isToday ? styles.dayCircleToday : null,
                    ]}
                  >
                    {completed ? (
                      <Text style={styles.dayCheck}>✓</Text>
                    ) : (
                      <View style={styles.dayDot} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      isToday ? styles.dayLabelToday : null,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.motivationCard}>
          <Text style={styles.motivationKicker}>USTAAD NOOR</Text>
          <Text style={styles.motivational}>
            {getMotivationalCopy(streak)}
          </Text>
        </View>
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
    paddingHorizontal: Spacing.gutter,
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  hero: {
    width: "100%",
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.navy,
    ...Shadows.card,
  },
  eyebrow: {
    marginBottom: Spacing.lg,
    color: WarshPalette.parchment,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    letterSpacing: 1.6,
  },
  streakHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  streakCount: {
    fontFamily: Fonts.bold,
    fontSize: 68,
    fontWeight: "700",
    color: WarshPalette.white,
    lineHeight: 72,
  },
  streakLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.parchment,
    lineHeight: 20,
  },
  heroNote: {
    maxWidth: 290,
    marginTop: Spacing.md,
    color: WarshPalette.cream,
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    textAlign: "center",
  },
  weekCard: {
    width: "100%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
    ...Shadows.card,
  },
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  weekEyebrow: {
    color: WarshPalette.goldDeep,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    letterSpacing: 1.2,
  },
  weekStatus: {
    color: WarshPalette.sageDeep,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCol: {
    minWidth: 36,
    alignItems: "center",
    gap: Spacing.xs,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: WarshPalette.parchmentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleCompleted: {
    backgroundColor: WarshPalette.cream,
  },
  dayCircleToday: {
    backgroundColor: WarshPalette.gold,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: WarshPalette.sageSoft,
  },
  dayCheck: {
    color: WarshPalette.navy,
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
  motivationCard: {
    width: "100%",
    borderLeftWidth: 3,
    borderLeftColor: WarshPalette.gold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.parchmentSoft,
  },
  motivationKicker: {
    color: WarshPalette.sageDeep,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    letterSpacing: 1.2,
  },
  motivational: {
    marginTop: Spacing.xs,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.bodyBrown,
    lineHeight: LineHeights.bodyL,
  },
  cta: {
    width: "100%",
    maxWidth: 440,
    marginTop: Spacing.md,
  },
});
