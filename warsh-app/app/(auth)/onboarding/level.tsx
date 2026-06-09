import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@stores/onboardingStore";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";
import { trackOnboardingLevelSelected } from "@services/analytics";
import { useT } from "@i18n/index";

export default function OnboardingLevelScreen() {
  const router = useRouter();
  const { level, setLevel } = useOnboardingStore();
  const t = useT();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", fontFamily: "Lora-Bold", marginBottom: Spacing.sm }}>
        {t("onboarding.levelTitle")}
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL, fontFamily: "Lora-Regular" }}>
        {t("onboarding.levelBody")}
      </Text>
      <BrandButton title={t("onboarding.levelNone")} variant="secondary" onPress={() => setLevel("BEGINNER")} selected={level === "BEGINNER"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title={t("onboarding.levelLittle")} variant="secondary" onPress={() => setLevel("ELEMENTARY")} selected={level === "ELEMENTARY"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title={t("onboarding.levelSome")} variant="secondary" onPress={() => setLevel("INTERMEDIATE")} selected={level === "INTERMEDIATE"} />
      <View style={{ height: Spacing.xl }} />
      <BrandButton title={t("common.continue")} onPress={() => { if (level) trackOnboardingLevelSelected(level); router.push("/(auth)/onboarding/daily-commitment"); }} />
    </View>
  );
}
