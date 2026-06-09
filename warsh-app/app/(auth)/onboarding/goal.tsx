import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@stores/onboardingStore";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";
import { trackOnboardingGoalSelected } from "@services/analytics";
import { useT } from "@i18n/index";

export default function OnboardingGoalScreen() {
  const router = useRouter();
  const { goal, setGoal } = useOnboardingStore();
  const t = useT();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", fontFamily: "Lora-Bold", marginBottom: Spacing.sm }}>
        {t("onboarding.goalTitle")}
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL, fontFamily: "Lora-Regular" }}>
        {t("onboarding.goalBody")}
      </Text>
      <BrandButton title={t("onboarding.goalQuran")} variant="secondary" onPress={() => setGoal("QURAN")} selected={goal === "QURAN"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title={t("onboarding.goalTravel")} variant="secondary" onPress={() => setGoal("TRAVEL")} selected={goal === "TRAVEL"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title={t("onboarding.goalStudy")} variant="secondary" onPress={() => setGoal("STUDY")} selected={goal === "STUDY"} />
      <View style={{ height: Spacing.xl }} />
      <BrandButton title={t("common.continue")} onPress={() => { if (goal) trackOnboardingGoalSelected(goal); router.push("/(auth)/onboarding/level"); }} />
    </View>
  );
}
