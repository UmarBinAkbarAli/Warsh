import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArabicText } from "../../components/ArabicText";
import { BrandButton } from "../../components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";
import { PREVIEW_SEEN_KEY } from "../../index";
import { trackPreviewCompleted } from "../../services/analytics";

export default function PreviewA7Cta() {
  const router = useRouter();

  useEffect(() => {
    // Mark preview as seen the moment this screen mounts — even if user closes app now,
    // the preview won't replay on next launch.
    AsyncStorage.setItem(PREVIEW_SEEN_KEY, "1");
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: Spacing.xxl }}>
        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: Spacing.xxxl }}>
          <ArabicText size="xl" style={{ color: Colors.accent.gold, marginBottom: Spacing.xs }}>
            وَرْش
          </ArabicText>
          <Text
            style={{
              color: Colors.text.primary,
              fontSize: FontSizes.displayXL,
              fontWeight: "700",
              letterSpacing: 1.5,
            }}
          >
            Warsh
          </Text>
        </View>

        {/* Headline */}
        <Text
          style={{
            color: Colors.text.primary,
            fontSize: FontSizes.displayXL,
            fontWeight: "700",
            textAlign: "center",
            lineHeight: LineHeights.displayXL,
            marginBottom: Spacing.md,
          }}
        >
          Begin your journey.
        </Text>

        <Text
          style={{
            color: Colors.text.muted,
            fontSize: FontSizes.bodyL,
            textAlign: "center",
            lineHeight: LineHeights.bodyL,
            marginBottom: Spacing.xxxl,
          }}
        >
          Seven days free. Then $1/month, or $10/year.{"\n"}Less than a cup of chai.
        </Text>

        {/* CTA */}
        <View style={{ width: "100%", marginBottom: Spacing.lg }}>
          <BrandButton
            title="Begin"
            onPress={() => { trackPreviewCompleted(); router.replace("/(auth)/onboarding/welcome"); }}
          />
        </View>

        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text
            style={{
              color: Colors.text.muted,
              fontSize: FontSizes.bodyM,
              textDecorationLine: "underline",
            }}
          >
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
