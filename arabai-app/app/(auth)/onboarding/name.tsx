import { View, Text, StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";
import { useState } from "react";
import { Link } from "expo-router";
import { useOnboardingStore } from "@stores/onboardingStore";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";

export default function OnboardingNameScreen() {
  const [name, setName] = useState("");
  const setNameState = useOnboardingStore((state) => state.setName);

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>What should Ustaad Noor call you?</Text>
      <TextInput
        label="Your name"
        value={name}
        onChangeText={(value) => {
          setName(value);
          setNameState(value);
        }}
        mode="outlined"
        autoCapitalize="words"
        style={styles.input}
      />
      <Link href="/(auth)/onboarding/language" style={{ color: Colors.accent.gold, fontWeight: "700" }}>
        Continue
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    padding: Spacing.xl,
    justifyContent: "center",
  },
  heading: {
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    color: Colors.text.primary,
    fontWeight: "700",
    fontFamily: "Lora-Bold",
    marginBottom: Spacing.sm,
  },
  input: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.bg.surface,
  },
});
