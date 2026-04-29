import { View, Text } from "react-native";
import { Link } from "expo-router";
import { useOnboardingStore } from "../../stores/onboardingStore";
import { Colors, FontSizes, LineHeights, Radii, Shadows, Spacing } from "../../../constants/theme";

const placementLabels: Record<string, string> = {
  BEGINNER: "Start from Chapter 1",
  KNOWS_LETTERS: "Skip Chapters 1-3",
  STUDIED_BEFORE: "Skip Chapters 1-5",
  CAN_READ_BASIC: "Skip Chapters 1-7",
};

export default function OnboardingReadyScreen() {
  const { goal, level, name, language, placementType } = useOnboardingStore();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.md }}>
        You're all set
      </Text>
      <Text style={{ textAlign: "center", color: Colors.text.secondary, marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        {name ? `${name}, ` : ""}your learning profile is ready.
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
          Your onboarding summary
        </Text>
        <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xs }}>Goal: {goal}</Text>
        <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xs }}>Level: {level}</Text>
        <Text style={{ color: Colors.text.secondary, marginBottom: Spacing.xs }}>Language: {language}</Text>
        <Text style={{ color: Colors.text.secondary }}>Starting point: {placementLabels[placementType] ?? placementLabels.BEGINNER}</Text>
      </View>
      <Link
        href="/(auth)/register"
        style={{
          backgroundColor: Colors.accent.gold,
          color: Colors.bg.primary,
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.md,
          borderRadius: Radii.md + 2,
          fontWeight: "700",
        }}
      >
        Create Account
      </Link>
    </View>
  );
}
