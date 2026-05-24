import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@stores/onboardingStore";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";

export default function OnboardingLanguageScreen() {
  const router = useRouter();
  const { language, setLanguage } = useOnboardingStore();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", fontFamily: "Lora-Bold", marginBottom: Spacing.sm }}>
        Native language
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL, fontFamily: "Lora-Regular" }}>
        Choose the language Ustaad Noor should use for prompts and explanations.
      </Text>
      <BrandButton title="Urdu" variant="secondary" onPress={() => setLanguage("ur")} selected={language === "ur"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="Hindi" variant="secondary" onPress={() => setLanguage("hi")} selected={language === "hi"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="English" variant="secondary" onPress={() => setLanguage("en")} selected={language === "en"} />
      <View style={{ height: Spacing.xl }} />
      <BrandButton title="Continue" onPress={() => router.push("/(auth)/onboarding/placement")} />
    </View>
  );
}
