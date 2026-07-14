import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import {
  Animation,
  Colors,
  FontSizes,
  Fonts,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../../constants/theme";

const AN_NAS_WORDS = [
  { arabic: "قُلْ", en: "Say", ur: "کہہ دیجیے" },
  { arabic: "أَعُوذُ", en: "I seek refuge", ur: "میں پناہ مانگتا ہوں" },
  { arabic: "بِرَبِّ", en: "in the Lord", ur: "رب کی" },
  { arabic: "النَّاسِ", en: "of mankind", ur: "لوگوں کے" },
] as const;

const TRANSLATIONS = {
  en: "Say, I seek refuge in the Lord of mankind.",
  ur: "کہہ دیجیے: میں لوگوں کے رب کی پناہ مانگتا ہوں۔",
} as const;

export default function PreviewA6Tadabbur() {
  const router = useRouter();
  const [language, setLanguage] = useState<"en" | "ur">("en");
  const [revealedCount, setRevealedCount] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const translationOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timers = AN_NAS_WORDS.map((_, index) =>
      setTimeout(() => setRevealedCount(index + 1), 550 + index * 650),
    );

    timers.push(
      setTimeout(() => {
        Animated.timing(translationOpacity, {
          toValue: 1,
          duration: Animation.slow,
          useNativeDriver: true,
        }).start();
      }, 550 + AN_NAS_WORDS.length * 650),
    );
    timers.push(
      setTimeout(() => setShowContinue(true), 900 + AN_NAS_WORDS.length * 650),
    );

    return () => timers.forEach(clearTimeout);
  }, [translationOpacity]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <View
        style={{
          height: 48,
          alignItems: "flex-end",
          justifyContent: "center",
          paddingHorizontal: Spacing.lg,
        }}
      >
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/preview/a7-cta")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={{ color: Colors.text.muted, fontSize: FontSizes.bodyM }}>
            Skip preview
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.xl,
        }}
      >
        <Text
          style={{
            color: WarshPalette.navy,
            fontFamily: Fonts.bold,
            fontSize: FontSizes.displayL,
            lineHeight: LineHeights.displayL,
            textAlign: "center",
            marginBottom: Spacing.xs,
          }}
        >
          From reciting to understanding
        </Text>
        <Text
          style={{
            color: Colors.text.muted,
            fontSize: FontSizes.bodyM,
            lineHeight: LineHeights.bodyM,
            textAlign: "center",
            marginBottom: Spacing.xl,
          }}
        >
          Every lesson unlocks more of the Qur'an.
        </Text>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: Spacing.md,
          }}
        >
          <Text
            style={{
              color: Colors.text.muted,
              fontSize: FontSizes.caption,
              letterSpacing: 1,
            }}
          >
            SURAH AN-NAS · 114:1
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
            {(["en", "ur"] as const).map((option) => {
              const selected = language === option;
              return (
                <TouchableOpacity
                  key={option}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option === "en" ? "Show English meanings" : "Show Urdu meanings"}
                  onPress={() => setLanguage(option)}
                  style={{
                    minHeight: 32,
                    minWidth: 50,
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
                      fontFamily: option === "ur" ? Fonts.urduFallback : Fonts.semiBold,
                      fontSize: option === "ur" ? FontSizes.bodyM : FontSizes.caption,
                      lineHeight: option === "ur" ? LineHeights.bodyM : LineHeights.caption,
                    }}
                  >
                    {option === "en" ? "English" : "اردو"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ArabicText
          size="lg"
          style={{
            color: Colors.text.primary,
            textAlign: "center",
            marginBottom: Spacing.lg,
          }}
        >
          قُلْ أَعُوذُ بِرَبِّ النَّاسِ
        </ArabicText>

        <View
          style={{
            width: "100%",
            flexDirection: "row-reverse",
            flexWrap: "wrap",
            justifyContent: "space-between",
            rowGap: Spacing.sm,
            marginBottom: Spacing.lg,
          }}
        >
          {AN_NAS_WORDS.map((word, index) => {
            const revealed = index < revealedCount;
            return (
              <View
                key={word.arabic}
                style={{
                  width: "48.5%",
                  minHeight: 104,
                  backgroundColor: revealed ? `${WarshPalette.gold}18` : Colors.bg.card,
                  borderWidth: 1,
                  borderColor: revealed ? Colors.border.gold : Colors.border.subtle,
                  borderRadius: Radii.lg,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: Spacing.sm,
                  paddingVertical: Spacing.sm,
                }}
              >
                <ArabicText
                  size="md"
                  style={{
                    color: revealed ? Colors.text.primary : Colors.text.muted,
                    opacity: revealed ? 1 : 0.35,
                    textAlign: "center",
                  }}
                >
                  {word.arabic}
                </ArabicText>
                <Text
                  style={{
                    minHeight: language === "ur" ? 28 : 20,
                    color: revealed ? Colors.text.secondary : "transparent",
                    fontFamily: language === "ur" ? Fonts.urduFallback : Fonts.regular,
                    fontSize: language === "ur" ? FontSizes.bodyM : FontSizes.caption,
                    lineHeight: language === "ur" ? 24 : LineHeights.caption,
                    textAlign: "center",
                    writingDirection: language === "ur" ? "rtl" : "ltr",
                  }}
                >
                  {language === "en" ? word.en : word.ur}
                </Text>
              </View>
            );
          })}
        </View>

        <Animated.View
          style={{
            opacity: translationOpacity,
            width: "100%",
            backgroundColor: Colors.bg.card,
            borderLeftWidth: 3,
            borderLeftColor: Colors.accent.gold,
            borderRadius: Radii.md,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            marginBottom: Spacing.lg,
          }}
        >
          <Text
            style={{
              color: Colors.text.primary,
              fontFamily: language === "ur" ? Fonts.urduFallback : Fonts.italic,
              fontSize: language === "ur" ? FontSizes.bodyL : FontSizes.bodyM,
              lineHeight: language === "ur" ? 28 : LineHeights.bodyM,
              textAlign: language === "ur" ? "right" : "center",
              writingDirection: language === "ur" ? "rtl" : "ltr",
            }}
          >
            {TRANSLATIONS[language]}
          </Text>
        </Animated.View>

        <Text
          style={{
            color: Colors.text.secondary,
            fontSize: FontSizes.bodyM,
            lineHeight: LineHeights.bodyM,
            textAlign: "center",
            marginBottom: Spacing.xl,
          }}
        >
          You already recite it. Warsh helps you understand it.
        </Text>

        {showContinue && (
          <View style={{ width: "100%" }}>
            <BrandButton
              title="Continue"
              onPress={() => router.push("/(auth)/preview/a7-cta")}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
