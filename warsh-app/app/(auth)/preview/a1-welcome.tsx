import { Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

const HERO_IMAGE = require("../../../assets/images/a1-welcome-hero.png");
const LOGO_IMAGE = require("../../../assets/images/warsh-logo.png");

const GOLD = "#C49B4D";
const GOLD_TEXT = "#A88648";
const GOLD_LIGHT = "#D4B06A";
const NAVY = "#071B44";
const CREAM = "#F7F1E6";
const INK = "#0B1630";
const BODY = "#303030";
const SAGE = "#6E8A66";
const INACTIVE = "#EEE8DC";
const INACTIVE_BORDER = "#DED6C7";

export default function PreviewA1Welcome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const frameWidth = Math.min(width, 412);
  const contentWidth = Math.max(0, frameWidth - 56);
  const heroWidth = Math.min(348, frameWidth - 56);
  const scale = heroWidth / 348;

  return (
    <SafeAreaView edges={["top"]} style={[styles.safeArea, isWeb ? styles.safeAreaWeb : null]}>
      <StatusBar style="dark" backgroundColor={CREAM} />
      <View style={[styles.background, isWeb ? styles.backgroundWeb : null, isWeb ? { width: frameWidth } : null]}>
        <ParchmentGrain />
        <CornerOrnament corner="topLeft" />
        <CornerOrnament corner="topRight" />
        <CornerOrnament corner="bottomLeft" />
        <CornerOrnament corner="bottomRight" />

        <View style={[styles.screenContent, { width: contentWidth }, isWeb ? styles.screenContentWeb : null]}>
          <View style={styles.topBar}>
            <View>
              <ProgressRail />
              <Text style={styles.previewLabel}>3 MINUTE PREVIEW</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/(auth)/preview/a7-cta")}
              hitSlop={14}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          <View style={styles.brandSection}>
            <Image source={LOGO_IMAGE} style={styles.arabicLogo} resizeMode="contain" />
            <Text style={styles.wordmark}>WARSH</Text>
            <OrnamentDivider width={142} />
          </View>

          <View style={[styles.heroShell, { width: heroWidth, height: Math.round(heroWidth * 0.678) }]}>
            <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="cover" />
          </View>

          <View style={[styles.headlineBlock, { width: heroWidth }]}>
            <Text style={[styles.headlineLine, { fontSize: 52 * scale, lineHeight: 54 * scale }]}>From Revelation</Text>
            <Text style={[styles.headlineLine, { fontSize: 52 * scale, lineHeight: 54 * scale }]}>to Conversation</Text>
          </View>

          <OrnamentDivider width={98} compact />

          <Text style={styles.description}>
            Discover how Warsh helps you{"\n"}
            understand the Qur'an, speak{"\n"}
            Arabic naturally, and build{"\n"}
            confidence one lesson at a time.
          </Text>

          <JourneyRow />

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(auth)/preview/a2-hook")}
            style={({ pressed }) => [styles.cta, { width: heroWidth }, pressed ? styles.ctaPressed : null]}
          >
            <View style={styles.ctaInnerBorder} pointerEvents="none" />
            <Text style={[styles.ctaText, { fontSize: 28 * scale }]}>Begin the Journey</Text>
            <Feather name="arrow-right" size={27 * scale} color={GOLD_LIGHT} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ProgressRail() {
  return (
    <View style={styles.progressRail}>
      {[0, 1, 2, 3].map((dot) => (
        <View key={dot} style={styles.progressDotWrap}>
          {dot > 0 ? <View style={styles.progressLine} /> : null}
          <View style={[styles.progressDot, dot === 0 ? styles.progressDotActive : styles.progressDotInactive]} />
        </View>
      ))}
    </View>
  );
}

function OrnamentDivider({ width, compact = false }: { width: number; compact?: boolean }) {
  return (
    <View style={[styles.divider, { width }, compact ? styles.dividerCompact : null]}>
      <View style={styles.dividerLine} />
      <View style={styles.dividerDot} />
      <Text style={[styles.dividerMark, compact ? styles.dividerMarkCompact : null]}>✥</Text>
      <View style={styles.dividerDot} />
      <View style={styles.dividerLine} />
    </View>
  );
}

function JourneyRow() {
  const steps = [
    { label: "Revelation", active: false, icon: "book-open" },
    { label: "Understand", active: false, icon: "geometry" },
    { label: "Speak", active: true, icon: "microphone" },
    { label: "Fluency", active: false, icon: "fire" },
  ] as const;

  return (
    <View style={styles.journey}>
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
            <View style={[styles.stepCircle, step.active ? styles.stepCircleActive : styles.stepCircleInactive]}>
              <JourneyIcon name={step.icon} active={step.active} />
            </View>
            <Text style={styles.stepLabel}>{step.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function JourneyIcon({ name, active }: { name: "book-open" | "geometry" | "microphone" | "fire"; active: boolean }) {
  const color = active ? GOLD : name === "fire" ? "#5B6470" : SAGE;

  if (name === "book-open") {
    return <FontAwesome5 name="book-open" size={18} color={color} />;
  }

  if (name === "geometry") {
    return <MaterialCommunityIcons name="star-four-points-outline" size={27} color={color} />;
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

function CornerOrnament({ corner }: { corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" }) {
  const vertical = corner.startsWith("top") ? { top: 82 } : { bottom: 2 };
  const horizontal = corner.endsWith("Left") ? { left: -24 } : { right: -24 };
  const flip = corner.endsWith("Right") ? [{ scaleX: -1 }] : [];
  const rotate = corner.startsWith("bottom") ? [{ rotate: "180deg" }] : [];

  return (
    <View pointerEvents="none" style={[styles.corner, vertical, horizontal, { transform: [...flip, ...rotate] }]}>
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
  safeAreaWeb: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  background: {
    flex: 1,
    alignItems: "center",
    backgroundColor: CREAM,
    overflow: "hidden",
  },
  backgroundWeb: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 915,
    height: 915,
    borderRadius: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
  },
  screenContent: {
    alignItems: "center",
    paddingTop: 31,
  },
  screenContentWeb: {
    position: "absolute",
    top: 44,
    paddingTop: 0,
  },
  topBar: {
    width: "100%",
    height: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  progressRail: {
    width: 121,
    height: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  progressDotWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressLine: {
    width: 31,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.75,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressDotActive: {
    backgroundColor: GOLD,
    borderWidth: 1,
    borderColor: "#B98A17",
  },
  progressDotInactive: {
    backgroundColor: CREAM,
    borderWidth: 2,
    borderColor: GOLD,
  },
  previewLabel: {
    marginTop: 8,
    fontFamily: "CormorantGaramond-SemiBold",
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 3,
    color: GOLD_TEXT,
  },
  skipButton: {
    minWidth: 48,
    minHeight: 40,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  skipText: {
    fontFamily: "CormorantGaramond-Regular",
    fontSize: 20,
    lineHeight: 25,
    color: GOLD_TEXT,
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
    color: "#5C492A",
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
    backgroundColor: "#E9DAC4",
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
    shadowColor: "#7C6A47",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  stepCircleInactive: {
    backgroundColor: INACTIVE,
    borderWidth: 1,
    borderColor: INACTIVE_BORDER,
  },
  stepCircleActive: {
    backgroundColor: "#FFFDF8",
    borderWidth: 2,
    borderColor: GOLD,
  },
  stepLabel: {
    marginTop: 6,
    fontFamily: "CormorantGaramond-Regular",
    fontSize: 15,
    lineHeight: 18,
    color: "#191919",
    textAlign: "center",
  },
  cta: {
    height: 56,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: NAVY,
    borderWidth: 2,
    borderColor: GOLD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  ctaInnerBorder: {
    position: "absolute",
    inset: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 176, 106, 0.45)",
  },
  ctaText: {
    marginRight: 20,
    fontFamily: "CormorantGaramond-SemiBold",
    lineHeight: 34,
    color: GOLD_LIGHT,
    letterSpacing: 0,
  },
  ctaPressed: {
    transform: [{ scale: 0.985 }],
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
