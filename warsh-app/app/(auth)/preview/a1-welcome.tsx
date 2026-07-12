import {
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandButton } from "../../../components/BrandButton";
import { Colors, Fonts, WarshPalette } from "../../../constants/theme";

const HERO_IMAGE = require("../../../assets/images/a1-welcome-hero.png");
const LOGO_IMAGE = require("../../../assets/images/warsh-logo.png");

// This screen's palette was promoted into the design system (2026-07-08):
// its gold family and navy now live in WarshPalette. Local names kept for
// readability; every value is a token.
const GOLD = WarshPalette.gold;
const GOLD_TEXT = WarshPalette.goldDeep;
const CREAM = Colors.bg.primary;
const INK = WarshPalette.navy;
const BODY = WarshPalette.bodyBrown;
const SAGE = WarshPalette.sage;
const INACTIVE = WarshPalette.cream;
const INACTIVE_BORDER = WarshPalette.parchmentCardBorder;

export default function PreviewA1Welcome() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const frameWidth = Math.min(width, 412);
  // Scale the whole composition continuously from the available viewport.
  // 920 keeps the established mobile proportions at common phone heights
  // while leaving enough room for the journey row + CTA in short browsers.
  const viewportScale = Math.max(0.55, Math.min(1, height / 920));
  const compactHeight = viewportScale < 0.94;
  const horizontalGutter = frameWidth < 380 ? 48 : 56;
  const contentWidth = Math.max(0, frameWidth - horizontalGutter);
  const heroWidth = Math.min(
    Math.round(328 * viewportScale),
    frameWidth - horizontalGutter,
  );
  const headlineSize = Math.min(
    48,
    Math.max(28, heroWidth * 0.128),
  );
  const headlineLineHeight = headlineSize + 3;
  const descriptionSize = Math.max(14, Math.round(20 * viewportScale));
  const descriptionLineHeight = Math.max(18, Math.round(24 * viewportScale));

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={CREAM} />
      <View style={styles.background}>
        <ParchmentGrain />
        <CornerOrnament corner="topLeft" />
        <CornerOrnament corner="topRight" />
        <CornerOrnament corner="bottomLeft" />
        <CornerOrnament corner="bottomRight" />

        <View
          style={[
            styles.scrollContent,
            {
              paddingTop: Math.max(8, Math.round(31 * viewportScale)),
              paddingBottom: Math.max(8, Math.round(24 * viewportScale)),
            },
          ]}
        >
          <View style={[styles.screenContent, { width: contentWidth }]}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace("/(auth)/preview/a7-cta")}
                hitSlop={14}
                style={styles.skipButton}
              >
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.brandSection,
                {
                  height: Math.round(144 * viewportScale),
                  marginTop: viewportScale < 0.8 ? -4 : 2,
                },
              ]}
            >
              <Image
                source={LOGO_IMAGE}
                style={[
                  styles.arabicLogo,
                  {
                    width: Math.round(170 * viewportScale),
                    height: Math.round(98 * viewportScale),
                  },
                ]}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.wordmark,
                  {
                    marginTop: Math.round(-8 * viewportScale),
                    fontSize: Math.max(18, Math.round(27 * viewportScale)),
                    lineHeight: Math.max(21, Math.round(30 * viewportScale)),
                    letterSpacing: Math.max(7, Math.round(12 * viewportScale)),
                    paddingLeft: Math.max(7, Math.round(12 * viewportScale)),
                  },
                ]}
              >
                WARSH
              </Text>
              <OrnamentDivider
                width={compactHeight ? 126 : 142}
                compact={compactHeight}
              />
            </View>

            <View
              style={[
                styles.heroShell,
                { width: heroWidth, height: Math.round(heroWidth * 0.678) },
              ]}
            >
              <Image
                source={HERO_IMAGE}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>

            <View
              style={[
                styles.headlineBlock,
                {
                  width: heroWidth,
                  marginTop: Math.max(6, Math.round(20 * viewportScale)),
                },
              ]}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
                style={[
                  styles.headlineLine,
                  { fontSize: headlineSize, lineHeight: headlineLineHeight },
                ]}
              >
                From Revelation
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
                style={[
                  styles.headlineLine,
                  { fontSize: headlineSize, lineHeight: headlineLineHeight },
                ]}
              >
                to Conversation
              </Text>
            </View>

            <OrnamentDivider width={98} compact />

            <Text
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
              style={[
                styles.description,
                {
                  width: heroWidth,
                  fontSize: descriptionSize,
                  lineHeight: descriptionLineHeight,
                },
              ]}
            >
              Discover how Warsh helps you understand the Qur'an, speak Arabic
              naturally, and build confidence one lesson at a time.
            </Text>

            <JourneyRow compact={compactHeight} scale={viewportScale} />

            <BrandButton
              title="Begin the Journey"
              onPress={() => router.push("/(auth)/preview/a2-hook")}
              style={StyleSheet.flatten([
                styles.cta,
                compactHeight ? styles.ctaCompact : null,
                { width: heroWidth },
              ])}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function OrnamentDivider({
  width,
  compact = false,
}: {
  width: number;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.divider,
        { width },
        compact ? styles.dividerCompact : null,
      ]}
    >
      <View style={styles.dividerLine} />
      <View style={styles.dividerDot} />
      <Text
        style={[styles.dividerMark, compact ? styles.dividerMarkCompact : null]}
      >
        ✥
      </Text>
      <View style={styles.dividerDot} />
      <View style={styles.dividerLine} />
    </View>
  );
}

function JourneyRow({
  compact = false,
  scale = 1,
}: {
  compact?: boolean;
  scale?: number;
}) {
  const steps = [
    { label: "Revelation", icon: "book-open" },
    { label: "Understand", icon: "geometry" },
    { label: "Speak", icon: "microphone" },
    { label: "Fluency", icon: "fire" },
  ] as const;

  return (
    <View
      style={[
        styles.journey,
        compact ? styles.journeyCompact : null,
        { marginTop: Math.max(4, Math.round(13 * scale)) },
      ]}
    >
      {steps.map((step, index) => (
        <View key={step.label} style={styles.stepGroup}>
          {index > 0 ? (
            <View style={styles.stepConnector}>
              <View style={styles.stepConnectorLine} />
              <View style={styles.stepConnectorDot} />
              <View style={styles.stepConnectorLine} />
            </View>
          ) : null}
          <View style={styles.step}>
            <View
              style={[
                styles.stepCircle,
                compact ? styles.stepCircleCompact : null,
                styles.stepCircleInactive,
              ]}
            >
              <JourneyIcon name={step.icon} />
            </View>
            <Text
              style={[
                styles.stepLabel,
                compact ? styles.stepLabelCompact : null,
              ]}
            >
              {step.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function JourneyIcon({
  name,
}: {
  name: "book-open" | "geometry" | "microphone" | "fire";
}) {
  const color = SAGE;

  if (name === "book-open") {
    return <FontAwesome5 name="book-open" size={18} color={color} />;
  }

  if (name === "geometry") {
    return (
      <MaterialCommunityIcons
        name="star-four-points-outline"
        size={27}
        color={color}
      />
    );
  }

  if (name === "microphone") {
    return <FontAwesome5 name="microphone" size={21} color={color} />;
  }

  return <MaterialCommunityIcons name="fire" size={24} color={color} />;
}

function ParchmentGrain() {
  return (
    <View pointerEvents="none" style={styles.grainLayer}>
      {Array.from({ length: 34 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.grainMark,
            {
              left: `${(index * 37) % 100}%`,
              top: `${(index * 23) % 100}%`,
              width: 34 + (index % 5) * 10,
              transform: [{ rotate: `${(index * 19) % 90}deg` }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function CornerOrnament({
  corner,
}: {
  corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}) {
  const vertical = corner.startsWith("top") ? { top: 82 } : { bottom: 2 };
  const horizontal = corner.endsWith("Left") ? { left: -24 } : { right: -24 };
  const flip = corner.endsWith("Right") ? [{ scaleX: -1 }] : [];
  const rotate = corner.startsWith("bottom") ? [{ rotate: "180deg" }] : [];

  return (
    <View
      pointerEvents="none"
      style={[
        styles.corner,
        vertical,
        horizontal,
        { transform: [...flip, ...rotate] },
      ]}
    >
      {Array.from({ length: 16 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.cornerTile,
            {
              left: (index % 4) * 20,
              top: Math.floor(index / 4) * 20,
              opacity: 0.08 + (index % 4) * 0.018,
            },
          ]}
        />
      ))}
      <View style={styles.cornerStem} />
      <View style={styles.cornerStemShort} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CREAM,
  },
  background: {
    flex: 1,
    alignItems: "center",
    backgroundColor: CREAM,
    overflow: "hidden",
  },
  scrollContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: 31,
    paddingBottom: 24,
  },
  screenContent: {
    alignItems: "center",
  },
  topBar: {
    width: "100%",
    height: 38,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  skipButton: {
    minWidth: 66,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: WarshPalette.sage,
    backgroundColor: WarshPalette.parchmentBg,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: WarshPalette.ink,
  },
  brandSection: {
    alignItems: "center",
    height: 144,
    marginTop: 2,
  },
  arabicLogo: {
    width: 170,
    height: 98,
  },
  wordmark: {
    marginTop: -8,
    fontFamily: "CormorantGaramond-SemiBold",
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: 12,
    color: GOLD_TEXT,
    paddingLeft: 12,
  },
  divider: {
    height: 24,
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.86,
  },
  dividerCompact: {
    height: 22,
    marginTop: 5,
    marginBottom: 3,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: GOLD,
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginHorizontal: 9,
  },
  dividerMark: {
    fontFamily: "CormorantGaramond-Bold",
    fontSize: 25,
    lineHeight: 28,
    color: GOLD,
  },
  dividerMarkCompact: {
    fontSize: 21,
    lineHeight: 24,
  },
  heroShell: {
    borderRadius: 21,
    overflow: "hidden",
    backgroundColor: WarshPalette.cream,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  headlineBlock: {
    marginTop: 20,
    alignItems: "center",
  },
  headlineLine: {
    fontFamily: "CormorantGaramond-Bold",
    color: INK,
    textAlign: "center",
    letterSpacing: 0,
  },
  description: {
    width: 310,
    fontFamily: "CormorantGaramond-Regular",
    fontSize: 20,
    lineHeight: 24,
    color: BODY,
    textAlign: "center",
  },
  journey: {
    width: 348,
    maxWidth: "100%",
    height: 72,
    marginTop: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  journeyCompact: {
    height: 62,
    marginTop: 9,
  },
  stepGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepConnector: {
    width: 32,
    height: 48,
    marginLeft: -15,
    marginRight: -15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  stepConnectorLine: {
    width: 13,
    height: 1,
    backgroundColor: GOLD,
  },
  stepConnectorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginHorizontal: 2,
  },
  step: {
    width: 78,
    alignItems: "center",
    zIndex: 1,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GOLD_TEXT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  stepCircleCompact: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  stepCircleInactive: {
    backgroundColor: INACTIVE,
    borderWidth: 1,
    borderColor: INACTIVE_BORDER,
  },
  stepLabel: {
    marginTop: 6,
    fontFamily: "CormorantGaramond-Regular",
    fontSize: 15,
    lineHeight: 18,
    color: WarshPalette.ink,
    textAlign: "center",
  },
  stepLabelCompact: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 16,
  },
  cta: {
    marginTop: 8,
  },
  ctaCompact: {
    marginTop: 4,
  },
  grainLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  grainMark: {
    position: "absolute",
    height: 1,
    backgroundColor: "rgba(124, 89, 35, 0.045)",
  },
  corner: {
    position: "absolute",
    width: 132,
    height: 184,
  },
  cornerTile: {
    position: "absolute",
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: GOLD,
    transform: [{ rotate: "45deg" }],
  },
  cornerStem: {
    position: "absolute",
    left: 40,
    top: 5,
    width: 1,
    height: 150,
    backgroundColor: GOLD,
    opacity: 0.11,
    transform: [{ rotate: "-28deg" }],
  },
  cornerStemShort: {
    position: "absolute",
    left: 66,
    top: 28,
    width: 1,
    height: 118,
    backgroundColor: GOLD,
    opacity: 0.11,
    transform: [{ rotate: "-42deg" }],
  },
});
