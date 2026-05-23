import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, LineHeights, Radii, Spacing } from "../../../constants/theme";

export default function PreviewA4Grammar() {
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

      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: Spacing.xxl }}>
        <Text
          style={{
            color: Colors.text.muted,
            fontSize: FontSizes.bodyM,
            letterSpacing: 1,
            textAlign: "center",
            marginBottom: Spacing.xl,
          }}
        >
          And here's something hidden in plain sight.
        </Text>

        <ArabicText size="lg" style={{ textAlign: "center", marginBottom: Spacing.xl }}>
          إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ
        </ArabicText>

        <View
          style={{
            backgroundColor: Colors.bg.card,
            borderRadius: Radii.lg,
            borderWidth: 1,
            borderColor: Colors.border.subtle,
            borderLeftWidth: 3,
            borderLeftColor: Colors.accent.gold,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
          }}
        >
          <Text
            style={{
              color: Colors.text.primary,
              fontSize: FontSizes.bodyL,
              lineHeight: LineHeights.bodyL,
            }}
          >
            <Text style={{ color: Colors.accent.gold, fontWeight: "700" }}>إِنَّا</Text>
            {" "}is{" "}
            <Text style={{ color: Colors.accent.gold, fontWeight: "700" }}>إِنَّ</Text>
            {" "}(a particle of emphasis) +{" "}
            <Text style={{ color: Colors.accent.gold, fontWeight: "700" }}>نَا</Text>
            {" "}(we).{"\n\n"}
            Allah is emphasizing — <Text style={{ fontStyle: "italic" }}>truly</Text>, We have given.
          </Text>
        </View>

        <Text
          style={{
            color: Colors.text.muted,
            fontSize: FontSizes.bodyM,
            textAlign: "center",
            lineHeight: LineHeights.bodyM,
            marginBottom: Spacing.xxxl,
          }}
        >
          This is what Warsh does. It shows you what's already there.
        </Text>

        <BrandButton title="Continue" onPress={() => router.push("/(auth)/preview/a5-noor")} />
      </View>
    </SafeAreaView>
  );
}
