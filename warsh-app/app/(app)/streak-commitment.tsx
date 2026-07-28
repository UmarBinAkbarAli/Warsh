import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
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

const COMMITMENT_KEY = "warsh_streak_commitment_set";

const GOALS = [
  { days: 3, label: "3 days", sublabel: "Baby steps" },
  { days: 7, label: "7 days", sublabel: "Strong start" },
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
        <View style={styles.header}>
          <CelebrationEmblem icon="flame-outline" />
          <Text style={styles.eyebrow}>BUILD A RHYTHM</Text>
          <Text style={styles.title}>Choose your streak goal</Text>
          <Text style={styles.subtitle}>
            A small promise to return to the Qur&apos;an, one lesson at a time.
          </Text>
        </View>

        <View style={styles.goalsCard}>
          <Text style={styles.groupLabel}>I want to practise for</Text>
          <View style={styles.goals}>
            {GOALS.map((goal) => {
              const isSelected = selected === goal.days;
              return (
                <Pressable
                  key={goal.days}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [
                    styles.goalRow,
                    isSelected ? styles.goalRowSelected : null,
                    pressed ? styles.goalRowPressed : null,
                  ]}
                  onPress={() => setSelected(goal.days)}
                >
                  <View>
                    <Text
                      style={[
                        styles.goalLabel,
                        isSelected ? styles.goalLabelSelected : null,
                      ]}
                    >
                      {goal.label}
                    </Text>
                    <Text
                      style={[
                        styles.goalSublabel,
                        isSelected ? styles.goalSublabelSelected : null,
                      ]}
                    >
                      {goal.sublabel}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      isSelected ? styles.radioSelected : null,
                    ]}
                  >
                    {isSelected ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={WarshPalette.navy}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.tipCard}>
          <Ionicons
            name={
              selected !== null
                ? "checkmark-circle-outline"
                : "leaf-outline"
            }
            size={20}
            color={WarshPalette.sageDeep}
          />
          <Text style={styles.tip}>
            {selected !== null
              ? "Your goal is set. You can still learn beyond it whenever you like."
              : "Choose a pace that feels realistic. Consistency matters more than speed."}
          </Text>
        </View>
      </View>

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
    paddingHorizontal: Spacing.gutter,
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  header: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  eyebrow: {
    marginTop: Spacing.sm,
    color: WarshPalette.goldDeep,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.displayXL,
    fontWeight: "700",
    color: WarshPalette.ink,
    lineHeight: LineHeights.displayXL,
    textAlign: "center",
  },
  subtitle: {
    maxWidth: 340,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    textAlign: "center",
  },
  goalsCard: {
    width: "100%",
    padding: Spacing.md,
    borderRadius: Radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
    ...Shadows.card,
  },
  groupLabel: {
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
  },
  goals: {
    gap: Spacing.sm,
  },
  goalRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
  },
  goalRowSelected: {
    borderWidth: 2,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.highlightBg,
  },
  goalRowPressed: {
    opacity: 0.8,
  },
  goalLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.h3,
    fontWeight: "600",
    color: WarshPalette.ink,
    lineHeight: LineHeights.h3,
  },
  goalLabelSelected: {
    color: WarshPalette.navy,
  },
  goalSublabel: {
    marginTop: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
  },
  goalSublabelSelected: {
    color: WarshPalette.bodyBrown,
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchment,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    width: "100%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.correctBg,
  },
  tip: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.bodyBrown,
    lineHeight: LineHeights.caption,
  },
  cta: {
    width: "100%",
    maxWidth: 440,
    marginTop: Spacing.sm,
  },
});
