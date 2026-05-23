import { View, Text } from "react-native";
import { Link } from "expo-router";
import { ArabicText } from "@components/ArabicText";
import { Colors, FontSizes, LineHeights, Radii, Spacing } from "../../../constants/theme";

export default function WelcomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg.primary, padding: Spacing.xl, justifyContent: "center", alignItems: "center" }}>
      <ArabicText size="sm" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </ArabicText>
      <ArabicText size="lg" style={{ textAlign: "center", marginBottom: Spacing.xs }}>
        وَرْش
      </ArabicText>
      <Text style={{ color: Colors.text.primary, fontSize: FontSizes.displayL, lineHeight: LineHeights.displayL, fontWeight: "700", marginBottom: Spacing.md, textAlign: "center" }}>
        Welcome to Warsh
      </Text>
      <Text style={{ fontSize: FontSizes.bodyL, color: Colors.text.secondary, textAlign: "center", marginBottom: Spacing.xl, lineHeight: LineHeights.bodyL }}>
        Light on every word. Learn Quranic Arabic with Ustaad Noor, build a streak, and keep moving one lesson at a time.
      </Text>
      <Link href="/(auth)/onboarding/goal" style={{ backgroundColor: Colors.accent.gold, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radii.md + 2 }}>
        <Text style={{ color: Colors.bg.primary, fontWeight: "700" }}>Start</Text>
      </Link>
    </View>
  );
}
