import { useRef, useState } from "react";
import { ActivityIndicator, View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { BrandButton } from "@components/BrandButton";
import {
  Colors,
  FontSizes,
  Fonts,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../constants/theme";

export default function SurahCelebrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const { surahNameAr, surahNameEn, xpEarned } =
    useLocalSearchParams<{
      surahNameAr: string;
      surahNameEn: string;
      xpEarned: string;
      isFirst: string;
    }>();

  function handleContinue() {
    router.replace("/(app)/(tabs)");
  }

  async function handleShare() {
    if (!viewShotRef.current || sharing) return;
    setSharing(true);
    try {
      const uri = await captureRef(viewShotRef, { format: "png", quality: 1 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your Warsh Surah milestone" });
      }
    } catch {
      // Share failures are non-blocking for the celebration flow.
    } finally {
      setSharing(false);
    }
  }

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      {/* Gold radiance circle */}
      <View style={styles.radiance} pointerEvents="none" />

      {/* Center content */}
      <View ref={viewShotRef} style={styles.centerContent}>
        {/* Surah Arabic name */}
        <Text style={styles.surahAr}>{surahNameAr ?? ""}</Text>

        {/* Surah English name */}
        <Text style={styles.surahEn}>{surahNameEn ?? ""}</Text>

        {/* XP badge */}
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{xpEarned ?? "0"} XP</Text>
        </View>

        {/* Quote */}
        <Text style={styles.quote}>
          {"You now understand this Surah, alhamdulillah.\nCarry it with you in your salah."}
        </Text>

        {/* Stars */}
        <View style={styles.starsRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.star}>★</Text>
          <Text style={styles.star}>★</Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomSection}>
        <BrandButton
          title="Continue →"
          onPress={handleContinue}
          style={styles.ctaButton}
        />
        <Pressable onPress={handleShare} style={styles.sharePressable} disabled={sharing}>
          {sharing ? (
            <ActivityIndicator color={WarshPalette.gold} size="small" />
          ) : (
            <Text style={styles.shareText}>Share this moment</Text>
          )}
        </Pressable>
      </View>
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
    alignSelf: "center",
    top: "25%",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: WarshPalette.parchment,
    opacity: 0.3,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  surahAr: {
    fontFamily: Fonts.arabic,
    fontSize: FontSizes.arabicL + 8,
    color: WarshPalette.gold,
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: LineHeights.arabicL + 8,
  },
  surahEn: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.h2,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    lineHeight: LineHeights.h2,
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
  quote: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
    lineHeight: LineHeights.bodyM * 1.6,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  starsRow: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginTop: Spacing.lg,
  },
  star: {
    fontSize: 28,
    color: WarshPalette.gold,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.md,
  },
  ctaButton: {
    width: "100%",
  },
  sharePressable: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  shareText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM,
    fontWeight: "700",
    color: WarshPalette.gold,
    textAlign: "center",
  },
});
