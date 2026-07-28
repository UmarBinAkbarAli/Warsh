import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { CelebrationEmblem } from "@components/CelebrationEmblem";
import {
  Colors,
  FontSizes,
  Fonts,
  LineHeights,
  Radii,
  Shadows,
  Spacing,
  WarshPalette,
} from "../../constants/theme";

type Achievement = {
  key: string;
  title: string;
  titleAr?: string;
  xpReward: number;
};

type IconName = ComponentProps<typeof Ionicons>["name"];

const BADGE_MAP: Record<string, IconName> = {
  first_lesson: "book-outline",
  first_chapter: "sparkles-outline",
  streak_3: "flame-outline",
  streak_7: "flame-outline",
  streak_30: "trophy-outline",
  streak_100: "ribbon-outline",
  xp_100: "sparkles-outline",
  xp_500: "star-outline",
  xp_1000: "moon-outline",
  lessons_10: "library-outline",
  lessons_50: "school-outline",
  lessons_100: "medal-outline",
  first_noor: "leaf-outline",
  first_shadow_repeat: "mic-outline",
  first_spoken_lesson: "chatbubble-ellipses-outline",
  phrases_10: "chatbubble-outline",
  phrases_50: "chatbubbles-outline",
  phrases_100: "ribbon-outline",
};

function getBadge(key: string): IconName {
  return BADGE_MAP[key] ?? "sparkles-outline";
}

export default function MilestoneCelebrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { achievements: achievementsParam, nextRoute, streak } =
    useLocalSearchParams<{
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
        friction: 6,
        tension: 54,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacityAnim, scaleAnim]);

  function handleContinue() {
    if (!isLast) {
      setIndex((value) => value + 1);
      return;
    }
    if (nextRoute === "streak-celebration") {
      router.replace({
        pathname: "/(app)/streak-celebration",
        params: { streak: streak ?? "1" },
      });
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
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.eyebrow}>MILESTONE UNLOCKED</Text>

        <Animated.View
          style={[
            styles.milestoneCard,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <View style={styles.cornerLineLeft} />
          <View style={styles.cornerLineRight} />
          <CelebrationEmblem icon={getBadge(current.key)} tone="dark" />

          {current.titleAr ? (
            <ArabicText size="lg" style={styles.arabicTitle}>
              {current.titleAr}
            </ArabicText>
          ) : null}
          <Text style={styles.titleEn}>{current.title}</Text>
          <View style={styles.xpBadge}>
            <Ionicons name="sparkles" size={14} color={WarshPalette.navy} />
            <Text style={styles.xpText}>+{current.xpReward} XP</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.blessingCard, { opacity: opacityAnim }]}>
          <ArabicText size="md" style={styles.blessingArabic}>
            بَارَكَ اللهُ فِيكَ
          </ArabicText>
          <Text style={styles.encouragement}>May Allah bless your effort.</Text>
        </Animated.View>

        {achievements.length > 1 ? (
          <View style={styles.progress}>
            <Text style={styles.progressLabel}>
              {index + 1} of {achievements.length}
            </Text>
            <View style={styles.dots}>
              {achievements.map((_, dotIndex) => (
                <View
                  key={dotIndex}
                  style={[
                    styles.dot,
                    dotIndex === index ? styles.dotActive : null,
                  ]}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <BrandButton
          title={isLast ? "Continue" : "Next milestone"}
          onPress={handleContinue}
          style={styles.cta}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.gutter,
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
  },
  eyebrow: {
    color: WarshPalette.goldDeep,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    letterSpacing: 1.7,
  },
  milestoneCard: {
    width: "100%",
    minHeight: 300,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    backgroundColor: WarshPalette.navy,
    ...Shadows.card,
  },
  cornerLineLeft: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 38,
    height: 38,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: WarshPalette.gold,
    borderTopLeftRadius: Radii.sm,
  },
  cornerLineRight: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 38,
    height: 38,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: WarshPalette.gold,
    borderBottomRightRadius: Radii.sm,
  },
  arabicTitle: {
    marginTop: Spacing.lg,
    color: WarshPalette.parchment,
    textAlign: "center",
  },
  titleEn: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.displayL,
    fontWeight: "700",
    color: WarshPalette.white,
    textAlign: "center",
    lineHeight: LineHeights.displayL,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: WarshPalette.parchment,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    marginTop: Spacing.lg,
  },
  xpText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    fontWeight: "600",
    color: WarshPalette.navy,
  },
  blessingCard: {
    width: "100%",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
    ...Shadows.card,
  },
  blessingArabic: {
    color: WarshPalette.sageDeep,
    textAlign: "center",
  },
  encouragement: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    lineHeight: LineHeights.bodyM,
  },
  progress: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressLabel: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
  },
  dots: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  dot: {
    width: 20,
    height: 3,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.cream,
  },
  dotActive: {
    backgroundColor: WarshPalette.gold,
  },
  footer: {
    width: "100%",
    maxWidth: 440,
  },
  cta: {
    width: "100%",
  },
});
