import { useEffect, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useT } from "@i18n/index";
import { Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette, WarshAlpha, WebLayout } from "../constants/theme";

// Same switch point as the app shell: the design system's web-bp-laptop.
export const DESKTOP_WEB_BREAKPOINT = WebLayout.bpLaptop;

export function useIsDesktopWeb() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= DESKTOP_WEB_BREAKPOINT;
}

const SLIDE_DURATION_MS = 5000;

// Composited hero scene, designed on the Claude Design canvas (Welcome slides
// page, WelcomeHero1-3): the phone, plus two floating cards exported as their
// own images so each can drift very slightly. Coordinates are the canvas's,
// in its 618 x 522 frame; each card image carries CARD_PAD of shadow per side.
const ART_WIDTH = 618;
const ART_HEIGHT = 522;
const CARD_PAD = 44;
const SCENE_WIDTH = 360;
const SCALE = SCENE_WIDTH / ART_WIDTH;
const SCENE_HEIGHT = ART_HEIGHT * SCALE;

type CardLayout = { source: number; left: number; top: number; width: number; height: number; rotate: number };

const SLIDES: { key: string; phone: number; cards: [CardLayout, CardLayout] }[] = [
  {
    key: "s1",
    phone: require("../assets/images/welcome-slide-1-phone.png"),
    cards: [
      { source: require("../assets/images/welcome-slide-1-card1.png"), left: 18, top: 96, width: 200, height: 91, rotate: -5 },
      { source: require("../assets/images/welcome-slide-1-card2.png"), left: 350, top: 318, width: 250, height: 130, rotate: 4 },
    ],
  },
  {
    key: "s2",
    phone: require("../assets/images/welcome-slide-2-phone.png"),
    cards: [
      { source: require("../assets/images/welcome-slide-2-card1.png"), left: 388, top: 44, width: 214, height: 127, rotate: 5 },
      { source: require("../assets/images/welcome-slide-2-card2.png"), left: 16, top: 316, width: 300, height: 122, rotate: -4 },
    ],
  },
  {
    key: "s3",
    phone: require("../assets/images/welcome-slide-3-phone.png"),
    cards: [
      { source: require("../assets/images/welcome-slide-3-card1.png"), left: 20, top: 74, width: 206, height: 72, rotate: -5 },
      { source: require("../assets/images/welcome-slide-3-card2.png"), left: 344, top: 286, width: 258, height: 153, rotate: 4 },
    ],
  },
];

// A very subtle wiggle: under a degree of tilt and a few pixels of drift,
// with the two cards on different periods so they never move in step.
const WIGGLE_DEGREES = 0.8;
const WIGGLE_DRIFT = 3;
const WIGGLE_PERIODS_MS = [2800, 3600];

function FloatingCard({ card, index, still }: { card: CardLayout; index: number; still: boolean }) {
  const [phase] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (still) return undefined;
    const half = WIGGLE_PERIODS_MS[index] / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(phase, { toValue: 1, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(phase, { toValue: 0, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [index, phase, still]);

  const direction = index === 0 ? 1 : -1;
  const rotate = phase.interpolate({
    inputRange: [0, 1],
    outputRange: [`${card.rotate - WIGGLE_DEGREES * direction}deg`, `${card.rotate + WIGGLE_DEGREES * direction}deg`],
  });
  const translateY = phase.interpolate({ inputRange: [0, 1], outputRange: [0, -WIGGLE_DRIFT] });

  return (
    <Animated.Image
      source={card.source}
      resizeMode="contain"
      style={[
        styles.card,
        {
          left: (card.left - CARD_PAD) * SCALE,
          top: (card.top - CARD_PAD) * SCALE,
          width: (card.width + CARD_PAD * 2) * SCALE,
          height: (card.height + CARD_PAD * 2) * SCALE,
          transform: [{ translateY }, { rotate }],
        },
      ]}
    />
  );
}

function HeroScene({ phone, cards }: { phone: number; cards: CardLayout[] }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReduceMotion(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.scene}>
      <Image source={phone} style={styles.phone} resizeMode="contain" />
      {cards.map((card, index) => (
        <FloatingCard key={index} card={card} index={index} still={reduceMotion} />
      ))}
    </View>
  );
}

// Slides cross-fade rather than cut: all three stay mounted (so their images
// are already loaded) and stack in a box tall enough for the longest copy.
const FADE_MS = 600;
const SLIDE_HEIGHT = SCENE_HEIGHT + 200;

function BrandCarousel() {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [fades] = useState(() => SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fade = Animated.parallel(
      fades.map((value, i) =>
        Animated.timing(value, {
          toValue: i === index ? 1 : 0,
          duration: FADE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        })
      )
    );
    fade.start();
    return () => fade.stop();
  }, [fades, index]);

  return (
    <View style={styles.carousel}>
      <View style={styles.slides}>
        {SLIDES.map((slide, i) => (
          <Animated.View
            key={slide.key}
            aria-hidden={i !== index}
            pointerEvents="none"
            style={[styles.slide, { opacity: fades[i] }]}
          >
            <HeroScene phone={slide.phone} cards={slide.cards} />
            <Text style={styles.title}>{t(`onboarding.slide${i + 1}Title`)}</Text>
            <Text style={styles.body}>{t(`onboarding.slide${i + 1}Body`)}</Text>
          </Animated.View>
        ))}
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
  slides: {
    width: "100%",
    height: SLIDE_HEIGHT,
  },
  slide: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: Spacing.md,
  },
  scene: {
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
  },
  phone: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
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
    backgroundColor: WarshAlpha.goldTint,
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
    maxWidth: WebLayout.formMax,
  },
});
