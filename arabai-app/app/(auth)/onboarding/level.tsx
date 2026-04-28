import { View, Text } from "react-native";
import { Link } from "expo-router";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { BrandButton } from "../../components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";

export default function OnboardingLevelScreen() {
  const setLevel = useOnboardingStore((state) => state.setLevel);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>
        Your Arabic level
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Help Ustadh Noor calibrate your first lessons.
      </Text>
      <BrandButton title="None" onPress={() => setLevel("BEGINNER")} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="A little" variant="secondary" onPress={() => setLevel("ELEMENTARY")} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="Some" variant="secondary" onPress={() => setLevel("INTERMEDIATE")} />
      <View style={{ height: Spacing.xl }} />
      <Link href="/(auth)/onboarding/name" style={{ color: Colors.accent.gold, fontWeight: "700", textAlign: "center" }}>
        Continue
      </Link>
    </View>
  );
}
