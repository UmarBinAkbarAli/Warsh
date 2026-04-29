import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { ArabicText } from "./components/ArabicText";
import { BrandButton } from "./components/BrandButton";
import { Colors, FontSizes, LineHeights, Radii, Spacing } from "../constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", backgroundColor: Colors.bg.primary, padding: Spacing.xl }}>
      <View
        style={{
          backgroundColor: Colors.bg.surface,
          borderRadius: Radii.xl,
          padding: Spacing.xxl,
          borderWidth: 1,
          borderColor: Colors.border.subtle,
        }}
      >
        <ArabicText size="lg" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
          نُور
        </ArabicText>
        <Text
          style={{
            color: Colors.text.primary,
            fontSize: FontSizes.displayL,
            lineHeight: LineHeights.displayL,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: Spacing.sm,
          }}
        >
          Noor
        </Text>
        <Text style={{ color: Colors.accent.gold, textAlign: "center", marginBottom: Spacing.lg }}>Light on every word</Text>
        <Text style={{ color: Colors.text.secondary, textAlign: "center", lineHeight: LineHeights.bodyL, marginBottom: Spacing.xxl }}>
          Learn Quranic Arabic with a warm, structured path and an Ustadh who meets you where you are.
        </Text>
        <BrandButton title="Sign In" onPress={() => router.push("/(auth)/login")} />
        <View style={{ height: Spacing.md }} />
        <BrandButton title="Create Account" variant="secondary" onPress={() => router.push("/(auth)/onboarding/welcome")} />
      </View>
    </View>
  );
}
