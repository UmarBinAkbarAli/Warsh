import { View, Text } from "react-native";
import { Link } from "expo-router";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { BrandButton } from "../../components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";

export default function OnboardingLanguageScreen() {
  const setLanguage = useOnboardingStore((state) => state.setLanguage);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>
        Native language
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Choose the language Noor should use for prompts and explanations.
      </Text>
      <BrandButton title="Urdu" onPress={() => setLanguage("ur")} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="Hindi" variant="secondary" onPress={() => setLanguage("hi")} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="English" variant="secondary" onPress={() => setLanguage("en")} />
      <View style={{ height: Spacing.xl }} />
      <Link href="/(auth)/onboarding/ready" style={{ color: Colors.accent.gold, fontWeight: "700", textAlign: "center" }}>
        Continue
      </Link>
    </View>
  );
}
