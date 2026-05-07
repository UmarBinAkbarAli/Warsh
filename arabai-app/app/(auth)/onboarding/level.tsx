import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { BrandButton } from "../../components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";

export default function OnboardingLevelScreen() {
  const router = useRouter();
  const { level, setLevel } = useOnboardingStore();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>
        Your Arabic level
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Help Ustaad Noor calibrate your first lessons.
      </Text>
      <BrandButton title="None" onPress={() => setLevel("BEGINNER")} selected={level === "BEGINNER"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="A little" variant="secondary" onPress={() => setLevel("ELEMENTARY")} selected={level === "ELEMENTARY"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="Some" variant="secondary" onPress={() => setLevel("INTERMEDIATE")} selected={level === "INTERMEDIATE"} />
      <View style={{ height: Spacing.xl }} />
      <BrandButton title="Continue" onPress={() => router.push("/(auth)/onboarding/name")} />
    </View>
  );
}
