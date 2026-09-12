import { Ionicons } from "@expo/vector-icons";
import { useT } from "@i18n/index";
import { useLanguage } from "@services/language";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { PLAY_SUBSCRIPTION_URL, type SubscriptionHealthState } from "../constants/subscription";
import { Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../constants/theme";

type SubscriptionBannerProps = {
  state: SubscriptionHealthState;
  // Google extends the paid period to the end of the grace window, so this is
  // the date the retries stop; shown only for "in_grace".
  activeUntil?: string | null;
  onCtaPress?: (state: SubscriptionHealthState) => void;
};

type Tone = {
  background: string;
  border: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  body: string;
  ctaBackground: string;
  ctaText: string;
  secondary: string;
};

/**
 * One slot at the top of the Learn tab that names the Google Play state a
 * paying learner's subscription is in — grace period, account hold, paused or
 * pending — with a single action into Play's subscription page. It never claims
 * a lock the server does not enforce; access rules stay in `lib/subscription.ts`.
 *
 * Designed in warsh-app-UI-v2.pen — "23 — Subscription Health · Learn Tab Banners".
 */
export function SubscriptionBanner({ state, activeUntil, onCtaPress }: SubscriptionBannerProps) {
  const t = useT();
  const language = useLanguage();
  const rtl = language === "ur";

  const tones: Record<SubscriptionHealthState, Tone> = {
    in_grace: {
      background: WarshPalette.parchmentSoft,
      border: WarshPalette.parchmentCardBorder,
      icon: "card-outline",
      iconColor: WarshPalette.goldDeep,
      title: WarshPalette.ink,
      body: WarshPalette.bodyBrown,
      ctaBackground: WarshPalette.navy,
      ctaText: WarshPalette.white,
      secondary: WarshPalette.subtleBrown,
    },
    on_hold: {
      background: WarshPalette.ink,
      border: WarshPalette.ink,
      icon: "lock-closed-outline",
      iconColor: WarshPalette.gold,
      title: WarshPalette.white,
      body: WarshPalette.cream,
      ctaBackground: WarshPalette.gold,
      ctaText: WarshPalette.ink,
      secondary: WarshPalette.disabledText,
    },
    paused: {
      background: WarshPalette.sageTintBg,
      border: WarshPalette.sageSoft,
      icon: "pause-circle-outline",
      iconColor: WarshPalette.sageDeep,
      title: WarshPalette.ink,
      body: WarshPalette.bodyBrown,
      ctaBackground: WarshPalette.navy,
      ctaText: WarshPalette.white,
      secondary: WarshPalette.subtleBrown,
    },
    pending: {
      background: WarshPalette.parchmentBg,
      border: WarshPalette.defaultCardBorder,
      icon: "time-outline",
      iconColor: WarshPalette.subtleBrown,
      title: WarshPalette.ink,
      body: WarshPalette.bodyBrown,
      ctaBackground: WarshPalette.navy,
      ctaText: WarshPalette.white,
      secondary: WarshPalette.subtleBrown,
    },
  };
  const tone = tones[state];

  const graceDate = state === "in_grace" ? formatDate(activeUntil ?? null, language) : null;
  const body =
    state === "in_grace"
      ? graceDate
        ? t("subscriptionBanner.graceBody", { date: graceDate })
        : t("subscriptionBanner.graceBodyNoDate")
      : t(`subscriptionBanner.${state}Body`);
  const ctaLabel = state === "paused" ? t("subscriptionBanner.resumeCta") : t("subscriptionBanner.updateCta");
  const showCta = state !== "pending";

  function openPlay() {
    onCtaPress?.(state);
    void Linking.openURL(PLAY_SUBSCRIPTION_URL).catch(() => {
      Alert.alert(t("settings.errorTitle"), t("manageSub.openPlayError"));
    });
  }

  return (
    <View
      style={[styles.banner, { backgroundColor: tone.background, borderColor: tone.border }]}
      accessibilityRole="alert"
    >
      <View style={[styles.top, rtl && styles.rtlRow]}>
        <Ionicons name={tone.icon} size={20} color={tone.iconColor} style={styles.icon} />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: tone.title }, rtl && styles.rtlText]}>
            {t(`subscriptionBanner.${state}Title`)}
          </Text>
          <Text style={[styles.body, { color: tone.body }, rtl && styles.rtlText]}>{body}</Text>
        </View>
      </View>
      {showCta ? (
        <View style={[styles.ctaRow, rtl && styles.rtlRow]}>
          <Pressable
            onPress={openPlay}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: tone.ctaBackground },
              rtl && styles.rtlRow,
              pressed && styles.ctaPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
          >
            <Text style={[styles.ctaLabel, { color: tone.ctaText }]}>{ctaLabel}</Text>
            <Ionicons
              name="open-outline"
              size={12}
              color={state === "on_hold" ? WarshPalette.ink : WarshPalette.parchment}
            />
          </Pressable>
          <Text style={[styles.secondary, { color: tone.secondary }]}>
            {t("subscriptionBanner.opensPlay")}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function formatDate(iso: string | null, language: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toLocaleDateString(language === "ur" ? "ur-PK" : "en-GB", { day: "numeric", month: "short" });
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm + 2,
  },
  icon: {
    marginTop: 1,
  },
  copy: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    paddingStart: 30,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs + 2,
    borderRadius: Radii.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md + 2,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  secondary: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label + 1,
    lineHeight: LineHeights.label,
  },
  rtlRow: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
