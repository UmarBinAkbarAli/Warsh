import { View, Text, TextInput } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { useOnboardingStore } from "@stores/onboardingStore";
import { Colors, FontSizes, LineHeights, Radii, Spacing } from "../../../constants/theme";

export default function OnboardingNameScreen() {
  const [name, setName] = useState("");
  const setNameState = useOnboardingStore((state) => state.setName);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center" }}>
      <Text style={{ fontSize: FontSizes.h1, lineHeight: LineHeights.h1, color: Colors.text.primary, fontWeight: "700", marginBottom: Spacing.sm }}>
        What should Ustaad Noor call you?
      </Text>
      <TextInput
        value={name}
        onChangeText={(value) => {
          setName(value);
          setNameState(value);
        }}
        placeholder="Your name"
        placeholderTextColor={Colors.text.muted}
        style={{
          borderWidth: 1,
          borderColor: Colors.border.subtle,
          borderRadius: Radii.md,
          padding: Spacing.md,
          marginBottom: Spacing.xl,
          backgroundColor: Colors.bg.surface,
          color: Colors.text.primary,
        }}
      />
      <Link href="/(auth)/onboarding/language" style={{ color: Colors.accent.gold, fontWeight: "700" }}>
        Continue
      </Link>
    </View>
  );
}
