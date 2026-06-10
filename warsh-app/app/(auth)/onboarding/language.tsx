import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@stores/onboardingStore";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";
import { useT } from "@i18n/index";

export default function OnboardingLanguageScreen() {
  const router = useRouter();
  const { language, setLanguage } = useOnboardingStore();
  const t = useT();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", fontFamily: "Lora-Bold", marginBottom: Spacing.sm }}>
        {t("onboarding.languageTitle")}
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL, fontFamily: "Lora-Regular" }}>
        {t("onboarding.languageBody")}
      </Text>
      <BrandButton title={t("onboarding.languageUrdu")} variant="secondary" onPress={() => setLanguage("ur")} selected={language === "ur"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title={t("onboarding.languageEnglish")} variant="secondary" onPress={() => setLanguage("en")} selected={language === "en"} />
      <View style={{ height: Spacing.xl }} />
      <BrandButton title={t("common.continue")} onPress={() => router.push("/(auth)/register")} />
    </View>
  );
}
