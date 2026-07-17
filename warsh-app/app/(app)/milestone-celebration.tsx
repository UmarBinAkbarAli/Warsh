import { useState, useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandButton } from "@components/BrandButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";

type Achievement = {
  key: string;
  title: string;
  titleAr?: string;
  xpReward: number;
};

const BADGE_MAP: Record<string, string> = {
  first_lesson: "📖",
  first_chapter: "🌟",
  streak_3: "🔥",
  streak_7: "🔥",
  streak_30: "🏆",
  streak_100: "🕌",
  xp_100: "✨",
  xp_500: "💫",
  xp_1000: "🌙",
  lessons_10: "📚",
  lessons_50: "🎓",
  lessons_100: "🏅",
  first_noor: "🌿",
  first_shadow_repeat: "🎙️",
  first_spoken_lesson: "🗣️",
  phrases_10: "💬",
  phrases_50: "🗣️",
  phrases_100: "🎖️",
};

function getBadge(key: string) {
  return BADGE_MAP[key] ?? "🌟";
}

export default function MilestoneCelebrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { achievements: achievementsParam, nextRoute, streak } = useLocalSearchParams<{
    achievements: string;
    nextRoute: string;
    streak: string;
  }>();

  const achievements: Achievement[] = (() => {
    try {
      return JSON.parse(achievementsParam ?? "[]");
    } catch {
      return [];
    }
  })();

  const [index, setIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const current = achievements[index];
  const isLast = index === achievements.length - 1;

  useEffect(() => {
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  function handleContinue() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    if (nextRoute === "streak-celebration") {
      router.replace({ pathname: "/(app)/streak-celebration", params: { streak: streak ?? "1" } });
    } else if (nextRoute === "chat") {
      router.replace("/(app)/(tabs)/chat");
    } else {
      router.replace("/(app)/(tabs)");
    }
  }

  if (!current) {
    router.replace("/(app)/(tabs)");
    return null;
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
      {/* Gold radiance */}
      <View style={styles.radiance} />

      {/* Badge */}
      <Animated.View
        style={[
          styles.badgeWrap,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        <View style={styles.badgeCircle}>
          <Text style={styles.badgeEmoji}>{getBadge(current.key)}</Text>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View style={{ opacity: opacityAnim, alignItems: "center", gap: Spacing.sm }}>
        {current.titleAr ? (
          <Text style={styles.arabicTitle}>{current.titleAr}</Text>
        ) : null}
        <Text style={styles.titleEn}>{current.title}</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{current.xpReward} XP</Text>
        </View>
      </Animated.View>

      {/* Encouragement */}
      <Text style={styles.encouragement}>
        بَارَكَ اللهُ فِيكَ{"\n"}May Allah bless your effort.
      </Text>

      {/* Counter dots if multiple */}
      {achievements.length > 1 ? (
        <View style={styles.dots}>
          {achievements.map((_, i) => (
            <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
          ))}
        </View>
      ) : null}

      <BrandButton
        title={isLast ? "Continue" : `Next (${index + 1}/${achievements.length})`}
        onPress={handleContinue}
        style={styles.cta}
      />

      {isLast ? (
        <Pressable onPress={handleContinue} style={styles.skipLink}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "space-between",
  },
  radiance: {
    position: "absolute",
    top: "25%",
    alignSelf: "center",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: WarshPalette.parchment,
    opacity: 0.25,
  },
  badgeWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  badgeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: WarshPalette.cream,
    borderWidth: 3,
    borderColor: WarshPalette.gold,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: WarshPalette.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeEmoji: {
    fontSize: 52,
    textAlign: "center",
  },
  arabicTitle: {
    fontFamily: Fonts.arabic,
    fontSize: FontSizes.arabicL,
    color: WarshPalette.ink,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: LineHeights.arabicL,
  },
  titleEn: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h1,
    fontWeight: "700",
    color: WarshPalette.ink,
    textAlign: "center",
    lineHeight: LineHeights.h1,
  },
  xpBadge: {
    backgroundColor: WarshPalette.gold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    marginTop: Spacing.xs,
  },
  xpText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    fontWeight: "600",
    color: WarshPalette.white,
  },
  encouragement: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.bodyL,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    lineHeight: LineHeights.bodyL * 1.6,
  },
  dots: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WarshPalette.cream,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
  },
  dotActive: {
    backgroundColor: WarshPalette.gold,
    borderColor: WarshPalette.gold,
  },
  cta: {
    width: "100%",
  },
  skipLink: {
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
  },
});
