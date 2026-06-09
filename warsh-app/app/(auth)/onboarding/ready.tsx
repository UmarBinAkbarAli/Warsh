import { View, Text } from "react-native";
import { Link } from "expo-router";
import { useOnboardingStore } from "@stores/onboardingStore";
import { Colors, FontSizes, LineHeights, Radii, Shadows, Spacing } from "../../../constants/theme";
import { useT } from "@i18n/index";

export default function OnboardingReadyScreen() {
  const { goal, level, name, language, placementType } = useOnboardingStore();
  const t = useT();
  const placementLabels: Record<string, string> = {
    BEGINNER: t("onboarding.readyPlacementBeginner"),
    KNOWS_LETTERS: t("onboarding.readyPlacementLetters"),
    STUDIED_BEFORE: t("onboarding.readyPlacementStudied"),
    CAN_READ_BASIC: t("onboarding.readyPlacementReadBasic"),
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.md }}>
        {t("onboarding.readyTitle")}
      </Text>
      <Text style={{ textAlign: "center", color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        {t("onboarding.readyBody", { name: name ? `${name}, ` : "" })}
      </Text>
      <View
        style={{
          width: "100%",
          padding: Spacing.lg,
          borderRadius: Radii.lg,
          backgroundColor: Colors.bg.card,
          borderWidth: 1,
          borderColor: Colors.border.subtle,
          marginBottom: Spacing.xl,
          ...Shadows.card,
        }}
      >
        <Text style={{ fontSize: FontSizes.h3, lineHeight: LineHeights.h3, color: Colors.text.primary, fontWeight: "600", marginBottom: Spacing.sm }}>
          {t("onboarding.readySummary")}
        </Text>
        <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xs }}>{t("onboarding.readyGoal", { value: goal })}</Text>
        <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xs }}>{t("onboarding.readyLevel", { value: level })}</Text>
        <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xs }}>{t("onboarding.readyLanguage", { value: language })}</Text>
        <Text style={{ color: Colors.text.secondary }}>{t("onboarding.readyStartingPoint", { value: placementLabels[placementType] ?? placementLabels.BEGINNER })}</Text>
      </View>
      <Link
        href="/(auth)/onboarding/attribution"
        style={{
          backgroundColor: Colors.accent.gold,
          color: Colors.bg.primary,
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.md,
          borderRadius: Radii.md + 2,
          fontWeight: "700",
        }}
      >
        {t("common.createAccount")}
      </Link>
    </View>
  );
}
