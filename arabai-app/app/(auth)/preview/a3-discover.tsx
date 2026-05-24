import { useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, LineHeights, Spacing, Animation } from "../../../constants/theme";

export default function PreviewA3Discover() {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  function handleReveal() {
    if (revealed) return;
    setRevealed(true);
    Animated.parallel([
      Animated.timing(revealOpacity, { toValue: 1, duration: Animation.normal, useNativeDriver: true }),
      Animated.timing(underlineWidth, { toValue: 1, duration: Animation.slow, useNativeDriver: false }),
    ]).start();
  }

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
          Now, the first word.
        </Text>

        <ArabicText size="xl" style={{ textAlign: "center", marginBottom: Spacing.md }}>
          إِنَّا
        </ArabicText>

        <Text
          style={{
            color: Colors.text.muted,
            fontSize: FontSizes.bodyM,
            fontStyle: "italic",
            letterSpacing: 0.5,
            marginBottom: Spacing.xl,
          }}
        >
          innā
        </Text>

        {!revealed ? (
          <TouchableOpacity
            onPress={handleReveal}
            style={{
              borderWidth: 1,
              borderColor: Colors.border.gold,
              borderRadius: 20,
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
              marginBottom: Spacing.xxxl,
            }}
          >
            <Text style={{ color: Colors.accent.gold, fontSize: FontSizes.bodyM }}>
              Tap to reveal meaning
            </Text>
          </TouchableOpacity>
        ) : (
          <Animated.View
            style={{ opacity: revealOpacity, alignItems: "center", marginBottom: Spacing.xxl }}
          >
            <Text
              style={{
                color: Colors.text.primary,
                fontSize: FontSizes.displayXL,
                fontWeight: "700",
                lineHeight: LineHeights.displayXL,
                marginBottom: Spacing.xs,
              }}
            >
              Indeed, We
            </Text>
            <Animated.View
              style={{
                height: 3,
                backgroundColor: Colors.accent.gold,
                borderRadius: 2,
                width: underlineWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 160] }),
              }}
            />
          </Animated.View>
        )}

        {revealed && (
          <View style={{ width: "100%" }}>
            <BrandButton title="Continue" onPress={() => router.push("/(auth)/preview/a4-grammar")} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
