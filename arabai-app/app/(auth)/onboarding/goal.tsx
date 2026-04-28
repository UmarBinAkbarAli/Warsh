import { View, Text } from "react-native";
import { Link } from "expo-router";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { BrandButton } from "../../components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";

export default function OnboardingGoalScreen() {
  const setGoal = useOnboardingStore((state) => state.setGoal);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>
        Choose your goal
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Select why you want to learn Arabic so Noor can shape your first steps well.
      </Text>
      <BrandButton title="Quranic Arabic" onPress={() => setGoal("QURAN")} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="Travel & Conversation" variant="secondary" onPress={() => setGoal("TRAVEL")} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="Study Arabic" variant="secondary" onPress={() => setGoal("STUDY")} />
      <View style={{ height: Spacing.xl }} />
      <Link href="/(auth)/onboarding/level" style={{ color: Colors.accent.gold, fontWeight: "700", textAlign: "center" }}>
        Continue
      </Link>
    </View>
  );
}
