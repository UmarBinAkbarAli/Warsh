import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArabicText } from "../../components/ArabicText";
import { BrandButton } from "../../components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";

const WAVEFORM_BARS = 9;

export default function PreviewA2Hook() {
  const router = useRouter();
  const [showCaption, setShowCaption] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const captionOpacity = useRef(new Animated.Value(0)).current;
  const barAnims = useRef(Array.from({ length: WAVEFORM_BARS }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    // Animate waveform bars continuously
    const loopBars = () => {
      const animations = barAnims.map((anim, i) =>
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ])
      );
      Animated.loop(Animated.parallel(animations)).start();
    };
    loopBars();

    // Show caption + continue after 3 seconds
    const timer = setTimeout(() => {
      setShowCaption(true);
      Animated.timing(captionOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      setTimeout(() => setShowContinue(true), 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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
            marginBottom: Spacing.xl,
          }}
        >
          First, listen.
        </Text>

        <ArabicText
          size="xl"
          style={{ textAlign: "center", color: Colors.accent.gold, marginBottom: Spacing.xl }}
        >
          إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ
        </ArabicText>

        {/* Waveform animation */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: Spacing.md }}>
          {barAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={{
                width: 3,
                height: 20,
                borderRadius: 2,
                backgroundColor: Colors.accent.gold,
                opacity: anim,
              }}
            />
          ))}
        </View>

        <Text
          style={{
            color: Colors.text.muted,
            fontSize: FontSizes.caption,
            letterSpacing: 0.5,
            marginBottom: Spacing.xxxl,
          }}
        >
          Surah Al-Kawthar · 108:1
        </Text>

        <Animated.Text
          style={{
            opacity: captionOpacity,
            color: Colors.text.primary,
            fontSize: FontSizes.bodyL,
            lineHeight: LineHeights.bodyL,
            textAlign: "center",
            marginBottom: Spacing.xxl,
          }}
        >
          You've heard this many times.
        </Animated.Text>

        {showContinue && (
          <View style={{ width: "100%" }}>
            <BrandButton title="Continue" onPress={() => router.push("/(auth)/preview/a3-discover")} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
