import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandButton } from "@components/BrandButton";
import { CelebrationEmblem } from "@components/CelebrationEmblem";
import { useT } from "@i18n/index";
import { trackCommitmentSet } from "@services/analytics";
import { updateUserProfile } from "@services/api";
import { useAuthStore } from "@stores/authStore";
import {
  COMMITMENT_PROMPT_SHOWN_KEY,
  DAILY_UNIT_MINUTES,
  type CommitmentSource,
} from "../../constants/commitment";
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

const GOALS = [
  { days: 3, sublabelKey: "commitment.goal3" },
  { days: 7, sublabelKey: "commitment.goal7" },
  { days: 14, sublabelKey: "commitment.goal14" },
  { days: 30, sublabelKey: "commitment.goal30" },
];

export default function StreakCommitmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useT();
  const userId = useAuthStore((state) => state.user?.id);
  const { source: sourceParam } = useLocalSearchParams<{ source?: string }>();
  const source: CommitmentSource = sourceParam === "celebration" ? "celebration" : "checklist";
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (source === "celebration" && userId) {
      void AsyncStorage.setItem(`${COMMITMENT_PROMPT_SHOWN_KEY}_${userId}`, "1");
    }
  }, [source, userId]);

  function leave() {
    if (source === "celebration") {
      router.replace("/(app)/(tabs)");
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(app)/(tabs)");
    }
  }

  async function handleCommit() {
    if (selected === null || saving) return;
    setSaving(true);
    try {
      await updateUserProfile({ streakGoalDays: selected });
      trackCommitmentSet(selected, source);
      leave();
    } catch {
      Alert.alert(t("settings.errorTitle"), t("commitment.saveError"));
    } finally {
      setSaving(false);
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
        <View style={styles.header}>
          <CelebrationEmblem icon="flame-outline" />
          <Text style={styles.eyebrow}>{t("commitment.eyebrow")}</Text>
          <Text style={styles.title}>{t("commitment.title")}</Text>
          <Text style={styles.subtitle}>{t("commitment.subtitle")}</Text>
        </View>

        <View style={styles.dailyUnitCard}>
          <View style={styles.dailyUnitIcon}>
            <Ionicons name="book-outline" size={20} color={WarshPalette.navy} />
          </View>
          <View style={styles.dailyUnitCopy}>
            <Text style={styles.dailyUnitEyebrow}>{t("commitment.eachDay")}</Text>
            <Text style={styles.dailyUnitValue}>
              {t("commitment.dailyUnit", { minutes: DAILY_UNIT_MINUTES })}
            </Text>
            <Text style={styles.dailyUnitHint}>{t("commitment.dailyUnitHint")}</Text>
          </View>
        </View>

        <View style={styles.goalsCard}>
          <Text style={styles.groupLabel}>{t("commitment.keepGoing")}</Text>
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
                      {t("settings.streakGoalDays", { days: goal.days })}
                    </Text>
                    <Text
                      style={[
                        styles.goalSublabel,
                        isSelected ? styles.goalSublabelSelected : null,
                      ]}
                    >
                      {t(goal.sublabelKey)}
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
            {selected !== null ? t("commitment.tipSelected") : t("commitment.tipEmpty")}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <BrandButton
          title={t("commitment.cta")}
          onPress={handleCommit}
          disabled={selected === null}
          loading={saving}
          style={styles.cta}
        />
        {source === "celebration" ? (
          <Pressable onPress={leave} hitSlop={8} accessibilityRole="button" style={styles.laterButton}>
            <Text style={styles.laterText}>{t("commitment.maybeLater")}</Text>
          </Pressable>
        ) : null}
      </View>
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
    gap: Spacing.md,
  },
  header: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
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
  dailyUnitCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    width: "100%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.highlightBg,
  },
  dailyUnitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.parchment,
  },
  dailyUnitCopy: {
    flex: 1,
    gap: 2,
  },
  dailyUnitEyebrow: {
    color: WarshPalette.goldDeep,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    letterSpacing: 1.2,
  },
  dailyUnitValue: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyL,
    fontWeight: "600",
    color: WarshPalette.navy,
    lineHeight: LineHeights.bodyL,
  },
  dailyUnitHint: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.bodyBrown,
    lineHeight: LineHeights.caption,
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
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    letterSpacing: 1.2,
  },
  goals: {
    gap: Spacing.sm,
  },
  goalRow: {
    minHeight: 60,
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
  footer: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cta: {
    width: "100%",
  },
  laterButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  laterText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.subtleBrown,
  },
});
