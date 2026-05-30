import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing } from "../../../constants/theme";

const KAWTHAR_AUDIO_URI = "https://everyayah.com/data/Alafasy_128kbps/108001.mp3";

const WAVEFORM_BARS = 9;

export default function PreviewA2Hook() {
  const router = useRouter();
  const [showCaption, setShowCaption] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const captionOpacity = useRef(new Animated.Value(0)).current;
  const barAnims = useRef(Array.from({ length: WAVEFORM_BARS }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    let sound: Audio.Sound | null = null;

    async function playAudio() {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound: s } = await Audio.Sound.createAsync(
        { uri: KAWTHAR_AUDIO_URI },
        { shouldPlay: true, volume: 1.0 },
      );
      sound = s;
    }

    // Animate waveform bars continuously
    const animations = barAnims.map((anim, i) =>
      Animated.sequence([
        Animated.delay(i * 80),
        Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
      ])
    );
    Animated.loop(Animated.parallel(animations)).start();

    void playAudio();

    // Show caption + continue after 5 seconds (audio is ~3s)
    const timer = setTimeout(() => {
      setShowCaption(true);
      Animated.timing(captionOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      setTimeout(() => setShowContinue(true), 500);
    }, 5000);

    return () => {
      clearTimeout(timer);
      sound?.unloadAsync();
    };
  }, []);

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
