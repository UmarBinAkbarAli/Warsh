import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";

export default function PreviewA1Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <View style={{ alignItems: "flex-end", paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/preview/a7-cta")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={{ color: Colors.text.muted, fontSize: FontSizes.bodyM }}>Skip preview</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: Spacing.xxl }}>
        <View style={{ alignItems: "center", marginBottom: Spacing.xxxl }}>
          <ArabicText size="lg" style={{ color: Colors.accent.gold, marginBottom: Spacing.xs }}>
            وَرْش
          </ArabicText>
          <Text style={{ color: Colors.text.primary, fontSize: FontSizes.displayL, fontWeight: "700", letterSpacing: 1 }}>
            Warsh
          </Text>
        </View>

        <Text
          style={{
            color: Colors.text.primary,
            fontSize: FontSizes.displayXL,
            fontWeight: "700",
            textAlign: "center",
            lineHeight: LineHeights.displayXL,
            marginBottom: Spacing.lg,
          }}
        >
          Let me show you what Warsh is.
        </Text>

        <Text
          style={{
            color: Colors.text.muted,
            fontSize: FontSizes.bodyL,
            textAlign: "center",
            marginBottom: Spacing.xxxl,
          }}
        >
          Three minutes. No signup yet.
        </Text>

        <View style={{ width: "100%" }}>
          <BrandButton title="Begin" onPress={() => router.push("/(auth)/preview/a2-hook")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
