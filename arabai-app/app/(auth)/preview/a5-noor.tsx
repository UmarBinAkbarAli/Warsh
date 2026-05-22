import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandButton } from "../../components/BrandButton";
import { Colors, FontSizes, LineHeights, Radii, Spacing } from "../../../constants/theme";

export default function PreviewA5Noor() {
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
        {/* Noor avatar */}
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: Colors.bg.card,
            borderWidth: 2,
            borderColor: Colors.accent.gold,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: Spacing.xl,
          }}
        >
          <Text style={{ fontSize: 28 }}>☀️</Text>
        </View>

        {/* Chat bubble */}
        <View
          style={{
            backgroundColor: Colors.bg.card,
            borderRadius: Radii.lg,
            borderWidth: 1,
            borderColor: Colors.border.subtle,
            padding: Spacing.xl,
            marginBottom: Spacing.xxxl,
            maxWidth: 360,
          }}
        >
          <Text
            style={{
              color: Colors.accent.gold,
              fontSize: FontSizes.caption,
              fontWeight: "700",
              letterSpacing: 1,
              marginBottom: Spacing.md,
            }}
          >
            USTAAD NOOR
          </Text>
          <Text
            style={{
              color: Colors.text.primary,
              fontSize: FontSizes.bodyL,
              lineHeight: LineHeights.bodyL,
            }}
          >
            As-salamu alaykum.{"\n\n"}
            I am Ustaad Noor. I will be your teacher. We will go word by word, ayah by ayah, until what you recite becomes what you understand.{"\n\n"}
            <Text style={{ color: Colors.text.muted, fontStyle: "italic" }}>In shaa Allah.</Text>
          </Text>
        </View>

        <View style={{ width: "100%" }}>
          <BrandButton title="Continue" onPress={() => router.push("/(auth)/preview/a6-tadabbur")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
