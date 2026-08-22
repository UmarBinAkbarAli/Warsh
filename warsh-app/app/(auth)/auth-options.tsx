import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { GoogleAuthSection } from "@components/GoogleAuthSection";
import { LanguageSheet } from "@components/LanguageSheet";
import { useIsDesktopWeb, WebAuthLayout } from "@components/WebAuthLayout";
import { useOnboardingStore } from "@stores/onboardingStore";
import { WEB_BASE_URL } from "@services/api";
import { useLanguage } from "@services/language";
import { useT } from "@i18n/index";
import {
  Colors,
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../constants/theme";

// Hero art is a flat illustration exported from Figma at 3x (412 x 348).
const HERO_ASPECT = 412 / 348;

const SLIDES = [
  { key: "s1", art: require("../../assets/images/onboarding-hero-1.png") },
  { key: "s2", art: require("../../assets/images/onboarding-hero-2.png") },
  { key: "s3", art: require("../../assets/images/onboarding-hero-3.png") },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useT();
  const { width } = useWindowDimensions();
  const language = useOnboardingStore((s) => s.language);
  const isUrdu = useLanguage() === "ur";
  // The desktop-web left panel (WebAuthLayout) already shows this slider,
  // so avoid rendering it twice on the right/form side.
  const desktop = useIsDesktopWeb();

  const [index, setIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const listRef = useRef<FlatList>(null);

  // The slide track is laid out against the rendered content width, which on
  // web is the phone column rather than the window.
  const trackWidth = Platform.OS === "web" ? Math.min(width, 480) : width;

  function onMomentumEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / trackWidth);
    if (next !== index) setIndex(next);
  }

  return (
    <WebAuthLayout>
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {/* Top bar — logo left, language pill right */}
        <View style={styles.topBar}>
          <Image
            source={require("../../assets/images/warsh-logo.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Warsh"
          />
          <Pressable
            onPress={() => setSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t("language.sheetTitle")}
            style={styles.langPill}
            hitSlop={8}
          >
            <Ionicons name="globe-outline" size={16} color={WarshPalette.gold} />
            <Text style={styles.langCode}>{language === "ur" ? "UR" : "EN"}</Text>
            <Ionicons name="chevron-down" size={13} color={WarshPalette.subtleBrown} />
          </Pressable>
        </View>

        {/* Slides — hero art plus its copy move together. Desktop web shows
            this in the WebAuthLayout left panel instead. */}
        {!desktop ? (
          <>
            <FlatList
              ref={listRef}
              data={SLIDES}
              keyExtractor={(item) => item.key}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumEnd}
              style={styles.track}
              renderItem={({ item, index: i }) => (
                <View style={[styles.slide, { width: trackWidth }]}>
                  <Image
                    source={item.art}
                    style={{ width: trackWidth, height: trackWidth / HERO_ASPECT }}
                    resizeMode="contain"
                  />
                  <View style={styles.copy}>
                    <Text style={styles.title}>{t(`onboarding.slide${i + 1}Title`)}</Text>
                    <Text style={styles.body}>{t(`onboarding.slide${i + 1}Body`)}</Text>
                  </View>
                </View>
              )}
            />

            {/* Pager dots */}
            <View style={styles.pager}>
              {SLIDES.map((slide, i) => (
                <View key={slide.key} style={[styles.dot, i === index ? styles.dotActive : null]} />
              ))}
            </View>
          </>
        ) : null}

        {/* Auth choices */}
        <View style={styles.actions}>
          <GoogleAuthSection />
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            accessibilityRole="button"
            style={({ pressed }) => [styles.emailBtn, pressed ? styles.emailBtnPressed : null]}
          >
            <Ionicons name="mail-outline" size={24} color={WarshPalette.ink} />
            <Text style={styles.emailLabel}>{t("auth.continueEmail")}</Text>
          </Pressable>
        </View>

        {/* Legal */}
        <View style={[styles.legal, { marginBottom: insets.bottom + Spacing.md }]}>
          <Text style={styles.legalLine}>{t("auth.legalPrefix")}</Text>
          <View style={[styles.legalLinks, isUrdu ? styles.legalLinksRtl : null]}>
            <Text
              style={styles.legalLink}
              onPress={() => void Linking.openURL(`${WEB_BASE_URL}/terms`)}
            >
              {t("auth.terms")}
            </Text>
            <Text style={styles.legalLine}>{t("auth.legalAnd")}</Text>
            <Text
              style={styles.legalLink}
              onPress={() => void Linking.openURL(`${WEB_BASE_URL}/privacy`)}
            >
              {t("auth.privacy")}
            </Text>
          </View>
        </View>

        <LanguageSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
      </View>
    </WebAuthLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 6,
    height: 48,
  },
  logo: {
    width: 41,
    height: 28,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    height: 28,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.neutralChip,
  },
  langCode: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    fontWeight: "600",
    letterSpacing: 0.6,
    color: WarshPalette.navy,
  },
  track: {
    flexGrow: 0,
  },
  slide: {
    alignItems: "center",
  },
  copy: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl - 8,
    gap: 10,
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.display,
    lineHeight: LineHeights.display,
    color: WarshPalette.ink,
    textAlign: "center",
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
  },
  pager: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.xl,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radii.full,
    backgroundColor: "rgba(196, 155, 77, 0.27)", // gold @ 27%
  },
  dotActive: {
    width: 24,
    backgroundColor: WarshPalette.gold,
  },
  actions: {
    marginTop: "auto",
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.sm,
  },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 56,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    borderRadius: Radii.sm,
  },
  emailBtnPressed: {
    backgroundColor: WarshPalette.highlightBgSoft,
  },
  emailLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    fontWeight: "600",
    color: WarshPalette.subtleBrown,
  },
  legal: {
    alignItems: "center",
    gap: 2,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
  },
  legalLine: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: 17,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legalLinksRtl: {
    flexDirection: "row-reverse",
  },
  legalLink: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: 15,
    color: WarshPalette.goldDeep,
  },
});
