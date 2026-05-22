import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArabicText } from "../../components/ArabicText";
import { BrandButton } from "../../components/BrandButton";
import { Colors, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../../../constants/theme";

const AN_NAS_WORDS = [
  "قُلْ",
  "أَعُوذُ",
  "بِرَبِّ",
  "النَّاسِ",
  "مَلِكِ",
  "النَّاسِ",
  "إِلَٰهِ",
  "النَّاسِ",
];

type WordState = "dim" | "learning" | "mastered";

export default function PreviewA6Tadabbur() {
  const router = useRouter();
  const [wordStates, setWordStates] = useState<WordState[]>(AN_NAS_WORDS.map(() => "dim"));
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    AN_NAS_WORDS.forEach((_, i) => {
      // First pass: dim → learning
      timers.push(
        setTimeout(() => {
          setWordStates((prev) => {
            const next = [...prev];
            next[i] = "learning";
            return next;
          });
        }, 400 + i * 450)
      );
      // Second pass: learning → mastered
      timers.push(
        setTimeout(() => {
          setWordStates((prev) => {
            const next = [...prev];
            next[i] = "mastered";
            return next;
          });
        }, 800 + i * 450)
      );
    });

    // Show continue after animation completes
    const totalMs = 800 + AN_NAS_WORDS.length * 450 + 400;
    timers.push(setTimeout(() => setShowContinue(true), totalMs));

    return () => timers.forEach(clearTimeout);
  }, []);

  function wordColor(state: WordState): string {
    if (state === "mastered") return WarshPalette.gold;
    if (state === "learning") return WarshPalette.ink;
    return WarshPalette.subtleBrown;
  }

  function wordOpacity(state: WordState): number {
    if (state === "dim") return 0.35;
    return 1;
  }

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
        <Text
          style={{
            color: Colors.text.muted,
            fontSize: FontSizes.bodyM,
            letterSpacing: 1,
            textAlign: "center",
            marginBottom: Spacing.xl,
          }}
        >
          And here's where you're going.
        </Text>

        {/* Surah label */}
        <Text
          style={{
            color: Colors.text.muted,
            fontSize: FontSizes.caption,
            letterSpacing: 1,
            marginBottom: Spacing.lg,
          }}
        >
          Surah An-Nas · 114
        </Text>

        {/* Words visualization */}
        <View
          style={{
            backgroundColor: Colors.bg.card,
            borderRadius: Radii.xl,
            borderWidth: 1,
            borderColor: Colors.border.subtle,
            padding: Spacing.xl,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: Spacing.md,
            marginBottom: Spacing.lg,
            width: "100%",
          }}
        >
          {AN_NAS_WORDS.map((word, i) => (
            <View
              key={i}
              style={{
                backgroundColor:
                  wordStates[i] === "mastered"
                    ? `${WarshPalette.gold}20`
                    : wordStates[i] === "learning"
                    ? `${WarshPalette.sage}15`
                    : "transparent",
                borderRadius: Radii.sm,
                paddingHorizontal: Spacing.sm,
                paddingVertical: Spacing.xs,
              }}
            >
              <ArabicText
                size="md"
                style={{
                  color: wordColor(wordStates[i]),
                  opacity: wordOpacity(wordStates[i]),
                }}
              >
                {word}
              </ArabicText>
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={{ flexDirection: "row", gap: Spacing.lg, marginBottom: Spacing.xl }}>
          {([["dim", "Not yet"], ["learning", "Learning"], ["mastered", "Mastered"]] as const).map(
            ([state, label]) => (
              <View key={state} style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: wordColor(state),
                    opacity: wordOpacity(state),
                  }}
                />
                <Text style={{ color: Colors.text.muted, fontSize: FontSizes.label }}>
                  {label}
                </Text>
              </View>
            )
          )}
        </View>

        <Text
          style={{
            color: Colors.text.secondary,
            fontSize: FontSizes.bodyL,
            lineHeight: LineHeights.bodyL,
            textAlign: "center",
            marginBottom: Spacing.xxxl,
          }}
        >
          Word by word, Surah by Surah, the Quran becomes yours.
        </Text>

        {showContinue && (
          <View style={{ width: "100%" }}>
            <BrandButton title="Continue" onPress={() => router.push("/(auth)/preview/a7-cta")} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
