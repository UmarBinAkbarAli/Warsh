import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing } from "../../../constants/theme";

export default function PreviewA5Noor() {
  const router = useRouter();
  const [messageLanguage, setMessageLanguage] = useState<"en" | "ur">("en");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <View style={{ height: 48, alignItems: "flex-end", justifyContent: "center", paddingHorizontal: Spacing.lg }}>
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/preview/a7-cta")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={{ color: Colors.text.muted, fontSize: FontSizes.bodyM }}>Skip preview</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: Spacing.xxl, paddingBottom: 60 }}>
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: Spacing.md,
              marginBottom: Spacing.md,
            }}
          >
            <Text
              style={{
                color: Colors.accent.gold,
                fontSize: FontSizes.caption,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              USTAAD NOOR
            </Text>

            <View
              accessibilityRole="tablist"
              style={{
                flexDirection: "row",
                borderWidth: 1,
                borderColor: Colors.border.gold,
                borderRadius: Radii.full,
                padding: 2,
              }}
            >
              {(["en", "ur"] as const).map((language) => {
                const selected = messageLanguage === language;
                return (
                  <TouchableOpacity
                    key={language}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    accessibilityLabel={language === "en" ? "Show English message" : "Show Urdu message"}
                    onPress={() => setMessageLanguage(language)}
                    style={{
                      minHeight: 32,
                      minWidth: 54,
                      paddingHorizontal: Spacing.sm,
                      borderRadius: Radii.full,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? Colors.accent.gold : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? Colors.bg.card : Colors.text.muted,
                        fontFamily: language === "ur" ? Fonts.urduFallback : undefined,
                        fontSize: language === "ur" ? FontSizes.bodyM : FontSizes.caption,
                        lineHeight: language === "ur" ? LineHeights.bodyM : LineHeights.caption,
                        fontWeight: language === "en" ? "700" : "400",
                      }}
                    >
                      {language === "en" ? "English" : "اردو"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {messageLanguage === "en" ? (
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
          ) : (
            <Text
              style={{
                color: Colors.text.primary,
                fontFamily: Fonts.urduFallback,
                fontSize: FontSizes.bodyL,
                lineHeight: 30,
                textAlign: "right",
                writingDirection: "rtl",
              }}
            >
              السلام علیکم۔{"\n\n"}
              میں اُستاد نور ہوں۔ میں آپ کو سکھاؤں گا۔ ہم لفظ بہ لفظ اور آیت بہ آیت آگے بڑھیں گے، یہاں تک کہ آپ جو تلاوت کرتے ہیں اسے سمجھنے لگیں۔{"\n\n"}
              <Text style={{ color: Colors.text.muted }}>ان شاء اللہ۔</Text>
            </Text>
          )}
        </View>

        <View style={{ width: "100%" }}>
          <BrandButton title="Continue" onPress={() => router.push("/(auth)/preview/a6-tadabbur")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
