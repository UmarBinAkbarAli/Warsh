import { useEffect, useState, type ReactNode } from "react";
import { Image, Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { useT } from "@i18n/index";
import { Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../constants/theme";

export const DESKTOP_WEB_BREAKPOINT = 900;

export function useIsDesktopWeb() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= DESKTOP_WEB_BREAKPOINT;
}

const SLIDE_DURATION_MS = 5000;

// Composited hero scene: the phone mockup plus two app-card cutouts
// scattered on top at an angle, like they've been tossed onto the screen.
const PHONE_ASPECT = 418 / 861;
const PHONE_WIDTH = 168;
const PHONE_HEIGHT = PHONE_WIDTH / PHONE_ASPECT;

const CARD_ART = {
  alifBaaTaa: { source: require("../assets/images/hero-card-alif-baa-taa.png"), aspect: 887 / 314 },
  ayah: { source: require("../assets/images/hero-card-ayah.png"), aspect: 877 / 345 },
  surah: { source: require("../assets/images/hero-card-surah.png"), aspect: 887 / 314 },
  vocab: { source: require("../assets/images/hero-card-vocab.png"), aspect: 564 / 272 },
} as const;

type CardKey = keyof typeof CARD_ART;
type CardLayout = { card: CardKey; width: number; top: number; left: number; rotate: string };

const SCENE_WIDTH = 300;
const SCENE_HEIGHT = 360;
const PHONE_LEFT = (SCENE_WIDTH - PHONE_WIDTH) / 2;
const PHONE_TOP = 10;

const SLIDES: { key: string; cards: CardLayout[] }[] = [
  {
    key: "s1",
    cards: [
      { card: "alifBaaTaa", width: 186, top: 46, left: 2, rotate: "-7deg" },
      { card: "surah", width: 172, top: 244, left: 112, rotate: "6deg" },
    ],
  },
  {
    key: "s2",
    cards: [
      { card: "ayah", width: 184, top: 40, left: 108, rotate: "6deg" },
      { card: "vocab", width: 150, top: 250, left: 0, rotate: "-8deg" },
    ],
  },
  {
    key: "s3",
    cards: [
      { card: "vocab", width: 150, top: 44, left: 118, rotate: "8deg" },
      { card: "alifBaaTaa", width: 186, top: 246, left: 6, rotate: "-6deg" },
    ],
  },
];

function HeroScene({ cards }: { cards: CardLayout[] }) {
  return (
    <View style={styles.scene}>
      <Image
        source={require("../assets/images/hero-phone.png")}
        style={[styles.phone, { left: PHONE_LEFT, top: PHONE_TOP }]}
        resizeMode="contain"
      />
      {cards.map(({ card, width, top, left, rotate }) => {
        const art = CARD_ART[card];
        return (
          <Image
            key={card}
            source={art.source}
            resizeMode="contain"
            style={[
              styles.card,
              { width, height: width / art.aspect, top, left, transform: [{ rotate }] },
            ]}
          />
        );
      })}
    </View>
  );
}

function BrandCarousel() {
  const t = useT();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  return (
    <View style={styles.carousel}>
      <View style={styles.slide}>
        <HeroScene cards={slide.cards} />
        <Text style={styles.title}>{t(`onboarding.slide${index + 1}Title`)}</Text>
        <Text style={styles.body}>{t(`onboarding.slide${index + 1}Body`)}</Text>
      </View>

      <View style={styles.pager}>
        {SLIDES.map((s, i) => (
          <View key={s.key} style={[styles.dot, i === index ? styles.dotActive : null]} />
        ))}
      </View>
    </View>
  );
}

export function WebAuthLayout({ children }: { children: ReactNode }) {
  const desktop = useIsDesktopWeb();

  if (!desktop) return <>{children}</>;

  return (
    <View style={styles.screen}>
      <View style={styles.brandPanel}>
        <BrandCarousel />
      </View>
      <View style={styles.formPanel}>
        <View style={styles.formFrame}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: WarshPalette.creamBg,
  },
  brandPanel: {
    width: "39%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.navy,
    paddingHorizontal: Spacing.xxl,
  },
  carousel: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  slide: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },
  scene: {
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
  },
  phone: {
    position: "absolute",
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
  },
  card: {
    position: "absolute",
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.display,
    lineHeight: LineHeights.display,
    color: WarshPalette.white,
    textAlign: "center",
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.parchment,
    textAlign: "center",
  },
  pager: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.xxl,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radii.full,
    backgroundColor: "rgba(196, 155, 77, 0.27)",
  },
  dotActive: {
    width: 24,
    backgroundColor: WarshPalette.gold,
  },
  formPanel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  formFrame: {
    width: "100%",
    maxWidth: 440,
  },
});
