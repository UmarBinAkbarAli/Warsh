import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";

const COMMITMENT_KEY = "warsh_streak_commitment_set";

const GOALS = [
  { days: 3,  label: "3 days",  sublabel: "Baby steps" },
  { days: 7,  label: "7 days",  sublabel: "Strong start" },
  { days: 14, label: "14 days", sublabel: "Committed" },
  { days: 30, label: "30 days", sublabel: "Unstoppable" },
];

export default function StreakCommitmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<number | null>(null);

  async function handleCommit() {
    if (selected === null) return;
    await AsyncStorage.setItem(COMMITMENT_KEY, String(selected));
    router.replace("/(app)/(tabs)");
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.lg }]}>
      {/* Flame */}
      <View style={styles.header}>
        <Text style={styles.flame}>🔥</Text>
        <Text style={styles.title}>Set your streak goal,{"\n"}make a commitment</Text>
      </View>

      {/* Goal options */}
      <View style={styles.goals}>
        {GOALS.map((g) => {
          const isSelected = selected === g.days;
          return (
            <TouchableOpacity
              key={g.days}
              style={[styles.goalRow, isSelected ? styles.goalRowSelected : null]}
              onPress={() => setSelected(g.days)}
              activeOpacity={0.75}
            >
              <Text style={[styles.goalLabel, isSelected ? styles.goalLabelSelected : null]}>
                {g.label}
              </Text>
              <View style={styles.goalRight}>
                <Text style={[styles.goalSublabel, isSelected ? styles.goalSublabelSelected : null]}>
                  {g.sublabel}
                </Text>
                {isSelected ? (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Motivational copy — changes when a goal is selected */}
      <Text style={styles.tip}>
        {selected !== null
          ? "You'll be 2× more likely to complete the course!"
          : "Streak goals help you stay committed and build a habit."}
      </Text>

      <BrandButton
        title="I'm committed"
        onPress={handleCommit}
        disabled={selected === null}
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
  header: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  flame: {
    fontSize: 64,
    textAlign: "center",
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    fontWeight: "700",
    color: WarshPalette.ink,
    lineHeight: LineHeights.h1 * 1.4,
    textAlign: "center",
  },
  goals: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.sm,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.white,
  },
  goalRowSelected: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentBg,
  },
  goalRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  goalLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.h3,
    fontWeight: "600",
    color: WarshPalette.ink,
    lineHeight: LineHeights.h3,
  },
  goalLabelSelected: {
    color: WarshPalette.ink,
  },
  goalSublabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.subtleBrown,
  },
  goalSublabelSelected: {
    color: WarshPalette.bodyBrown,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: WarshPalette.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: WarshPalette.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  tip: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    lineHeight: LineHeights.bodyM,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cta: {
    marginTop: Spacing.sm,
  },
});
