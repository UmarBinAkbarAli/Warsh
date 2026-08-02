import type { ReactNode } from "react";
import { Image, Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Fonts, Radii, Spacing, WarshPalette } from "../constants/theme";

const LOGO_IMAGE = require("../assets/images/warsh-logo.png");

const PREVIEW_STEPS = [
  "a1-welcome",
  "a2-hook",
  "a3-discover",
  "a4-grammar",
  "a5-noor",
  "a6-tadabbur",
  "a7-cta",
];

const SETUP_STEPS = [
  "welcome",
  "name",
  "language",
  "translation-language",
  "attribution",
  "goal",
  "level",
  "daily-commitment",
  "placement",
  "permissions",
  "ready",
];

const PREVIEW_COPY: Record<string, { eyebrow: string; title: string }> = {
  "a1-welcome": { eyebrow: "WELCOME", title: "From Revelation\nto Conversation" },
  "a2-hook": { eyebrow: "SIMPLY, LISTEN", title: "The Qur'an already\nsounds familiar." },
  "a3-discover": { eyebrow: "NOW, DISCOVER", title: "Meaning begins\nto unfold." },
  "a4-grammar": { eyebrow: "UNDERSTAND", title: "See how Arabic\nholds together." },
  "a5-noor": { eyebrow: "ASK NOOR", title: "A guide whenever\nyou need clarity." },
  "a6-tadabbur": { eyebrow: "REFLECT", title: "Carry each surah\nwith understanding." },
  "a7-cta": { eyebrow: "BEGIN", title: "Your Arabic journey\nstarts here." },
};

function OnboardingHeader({
  current,
  total,
  setup,
}: {
  current: number;
  total: number;
  setup: boolean;
}) {
  const progress = `${Math.max(1, current) / total * 100}%` as const;

  return (
    <View style={styles.header}>
      <View style={styles.headerBrand}>
        <View style={styles.brandMark}>
          <Text style={styles.brandGlyph}>و</Text>
        </View>
        <Text style={styles.headerWordmark}>WARSH</Text>
      </View>

      <View style={styles.progressGroup}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progress }]} />
        </View>
        <Text style={styles.progressText}>
          {setup ? `Step ${current} of ${total}` : `${current} of ${total}`}
        </Text>
      </View>

      <View style={styles.headerEnd}>
        <Text style={styles.headerEndText}>{setup ? "Need help?" : "Preview"}</Text>
      </View>
    </View>
  );
}

function PreviewBrandPanel({ routeName }: { routeName: string }) {
  const copy = PREVIEW_COPY[routeName] ?? PREVIEW_COPY["a1-welcome"];
  const { width } = useWindowDimensions();
  const tablet = width < 1050;

  return (
    <View style={[styles.previewBrandPanel, tablet && styles.tabletBrandPanel]}>
      <Image source={LOGO_IMAGE} resizeMode="contain" style={styles.previewLogo} />
      <Text style={styles.previewWordmark}>WARSH</Text>
      {!tablet && routeName !== "a1-welcome" ? (
        <>
          <View style={styles.goldRule} />
          <Text style={styles.previewEyebrow}>{copy.eyebrow}</Text>
          <Text style={styles.previewTitle}>{copy.title}</Text>
        </>
      ) : null}

      {routeName === "a1-welcome" ? (
        <View style={[styles.journeyGrid, tablet && styles.tabletJourneyGrid]}>
          {["Revelation", "Understand", "Speak", "Fluency"].map((label) => (
            <View key={label} style={styles.journeyItem}>
              <View style={styles.journeyDot} />
              <Text style={styles.journeyLabel}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function WebOnboardingLayout({
  children,
  pathname,
}: {
  children: ReactNode;
  pathname: string;
}) {
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 768;
  const tablet = desktop && width < 1050;
  const preview = pathname.includes("/preview/");
  const setup = pathname.includes("/onboarding/");

  if (!desktop || (!preview && !setup)) return <>{children}</>;

  const routeName = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const steps = preview ? PREVIEW_STEPS : SETUP_STEPS;
  const current = Math.max(1, steps.indexOf(routeName) + 1);

  return (
    <View style={styles.screen}>
      <OnboardingHeader current={current} total={steps.length} setup={setup} />

      {preview ? (
        <View style={[styles.previewBody, tablet && styles.tabletPreviewBody]}>
          <PreviewBrandPanel routeName={routeName} />
          <View style={styles.previewContent}>{children}</View>
        </View>
      ) : (
        <View style={styles.setupBody}>
          <View style={styles.setupFrame}>{children}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: WarshPalette.creamBg,
  },
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    backgroundColor: WarshPalette.white,
    borderBottomWidth: 1,
    borderBottomColor: WarshPalette.defaultCardBorder,
  },
  headerBrand: {
    width: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: WarshPalette.navy,
  },
  brandGlyph: {
    color: WarshPalette.gold,
    fontFamily: Fonts.arabic,
    fontSize: 18,
  },
  headerWordmark: {
    color: WarshPalette.navy,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    letterSpacing: 3,
  },
  progressGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    width: 220,
    height: 4,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: WarshPalette.gold,
  },
  progressText: {
    minWidth: 58,
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: 11,
  },
  headerEnd: {
    minWidth: 96,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: "center",
    borderWidth: 1,
    borderColor: WarshPalette.sageSoft,
    borderRadius: Radii.full,
  },
  headerEndText: {
    color: WarshPalette.ink,
    fontFamily: Fonts.semiBold,
    fontSize: 11,
  },
  previewBody: {
    flex: 1,
    flexDirection: "row",
    minHeight: 0,
  },
  previewBrandPanel: {
    width: "42%",
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: WarshPalette.navy,
  },
  tabletBrandPanel: {
    width: "100%",
    height: 290,
    flexShrink: 0,
    padding: 24,
  },
  previewLogo: {
    width: 168,
    height: 106,
  },
  previewWordmark: {
    marginTop: -10,
    color: WarshPalette.white,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    letterSpacing: 8,
  },
  goldRule: {
    width: 52,
    height: 1,
    marginVertical: 24,
    backgroundColor: WarshPalette.gold,
  },
  previewEyebrow: {
    color: WarshPalette.gold,
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 2,
  },
  previewTitle: {
    marginTop: 10,
    color: WarshPalette.white,
    fontFamily: "CormorantGaramond-SemiBold",
    fontSize: 31,
    lineHeight: 38,
    textAlign: "center",
  },
  journeyGrid: {
    width: 286,
    marginTop: 34,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tabletJourneyGrid: {
    width: 600,
    maxWidth: "94%",
    marginTop: 24,
    flexWrap: "nowrap",
  },
  journeyItem: {
    width: 139,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#FFFFFF22",
    backgroundColor: "#FFFFFF0C",
  },
  journeyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: WarshPalette.gold,
  },
  journeyLabel: {
    color: WarshPalette.white,
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  previewContent: {
    flex: 1,
    minWidth: 0,
    backgroundColor: WarshPalette.creamBg,
  },
  tabletPreviewBody: {
    flexDirection: "column",
  },
  setupBody: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48,
    paddingVertical: 28,
    backgroundColor: WarshPalette.creamBg,
  },
  setupFrame: {
    width: "100%",
    maxWidth: 760,
    height: "100%",
    maxHeight: 720,
    overflow: "hidden",
  },
});
