import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@stores/onboardingStore";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";
import { trackOnboardingGoalSelected } from "@services/analytics";

export default function OnboardingGoalScreen() {
  const router = useRouter();
  const { goal, setGoal } = useOnboardingStore();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", fontFamily: "Lora-Bold", marginBottom: Spacing.sm }}>
        Choose your goal
      </Text>
      <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL, fontFamily: "Lora-Regular" }}>
        Select why you want to learn Arabic so Ustaad Noor can shape your first steps well.
      </Text>
      <BrandButton title="Quranic Arabic" variant="secondary" onPress={() => setGoal("QURAN")} selected={goal === "QURAN"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="Travel & Conversation" variant="secondary" onPress={() => setGoal("TRAVEL")} selected={goal === "TRAVEL"} />
      <View style={{ height: Spacing.md }} />
      <BrandButton title="Study Arabic" variant="secondary" onPress={() => setGoal("STUDY")} selected={goal === "STUDY"} />
      <View style={{ height: Spacing.xl }} />
      <BrandButton title="Continue" onPress={() => { if (goal) trackOnboardingGoalSelected(goal); router.push("/(auth)/onboarding/level"); }} />
    </View>
  );
}
