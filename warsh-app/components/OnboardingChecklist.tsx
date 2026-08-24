import { Ionicons } from "@expo/vector-icons";
import { useT } from "@i18n/index";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Shadows,
  Spacing,
  WarshPalette,
} from "../constants/theme";

export type OnboardingStepKey = "account" | "language" | "goal" | "firstLesson";

export type OnboardingStep = {
  key: OnboardingStepKey;
  done: boolean;
  meta?: string;
};

type OnboardingChecklistProps = {
  steps: OnboardingStep[];
  onSkip: () => void;
  onStepPress: (key: OnboardingStepKey) => void;
};

const STEP_ICON: Record<OnboardingStepKey, keyof typeof Ionicons.glyphMap> = {
  account: "person-outline",
  language: "language-outline",
  goal: "flag-outline",
  firstLesson: "book-outline",
};

const STEP_TITLE_KEY: Record<OnboardingStepKey, string> = {
  account: "onboardingChecklist.stepAccount",
  language: "onboardingChecklist.stepLanguage",
  goal: "onboardingChecklist.stepGoal",
  firstLesson: "onboardingChecklist.stepFirstLesson",
};

export function OnboardingChecklist({
  steps,
  onSkip,
  onStepPress,
}: OnboardingChecklistProps) {
  const t = useT();
  const doneCount = steps.filter((step) => step.done).length;
  const progressPercent = (doneCount / steps.length) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <Text style={styles.title}>{t("onboardingChecklist.title")}</Text>
        <TouchableOpacity onPress={onSkip} hitSlop={8}>
          <Text style={styles.skip}>{t("onboardingChecklist.skip")}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>{t("onboardingChecklist.subtitle")}</Text>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressCount} numberOfLines={1}>
          {t("onboardingChecklist.progress", { done: doneCount, total: steps.length })}
        </Text>
      </View>

      <View style={styles.list}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const tappable = !step.done;
          return (
            <TouchableOpacity
              key={step.key}
              disabled={!tappable}
              activeOpacity={tappable ? 0.7 : 1}
              onPress={() => onStepPress(step.key)}
              style={[styles.row, !isLast && styles.rowDivider]}
              accessibilityRole={tappable ? "button" : undefined}
            >
              <View style={[styles.iconCircle, step.done && styles.iconCircleDone]}>
                <Ionicons
                  name={step.done ? "checkmark" : STEP_ICON[step.key]}
                  size={16}
                  color={step.done ? WarshPalette.sageDeep : WarshPalette.goldDeep}
                />
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowTitle, step.done && styles.rowTitleDone]}>
                  {t(STEP_TITLE_KEY[step.key])}
                </Text>
                {step.meta ? <Text style={styles.rowMeta}>{step.meta}</Text> : null}
              </View>
              {tappable ? (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={WarshPalette.subtleBrown}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.parchmentBg,
    marginBottom: Spacing.xl,
    ...Shadows.goldGlow,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: WarshPalette.ink,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h3,
    lineHeight: LineHeights.h3,
  },
  skip: {
    color: WarshPalette.goldDeep,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
  },
  subtitle: {
    marginTop: 2,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    overflow: "hidden",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.cream,
  },
  progressFill: {
    height: "100%",
    minWidth: 5,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.gold,
  },
  progressCount: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
  },
  list: { marginTop: Spacing.xs },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: WarshPalette.cream,
  },
  iconCircle: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.highlightBg,
  },
  iconCircleDone: {
    backgroundColor: WarshPalette.sageTintBg,
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
  },
  rowTitleDone: {
    color: WarshPalette.subtleBrown,
    textDecorationLine: "line-through",
    textDecorationColor: WarshPalette.sageSoft,
  },
  rowMeta: {
    marginTop: 1,
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
  },
});
