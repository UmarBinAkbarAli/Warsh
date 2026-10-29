import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { ScreenHeader } from "@components/ScreenHeader";
import { StatusBarBacking } from "@components/StatusBarBacking";
import { useLanguage } from "@services/language";
import { useT } from "@i18n/index";
import { FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { isDesktopWeb } from "@components/WebPage";

type Achievement = {
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  earned: boolean;
  unlockedAt: string | null;
};

function formatDate(iso: string | null, language: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(language === "ur" ? "ur-PK" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function MilestonesScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();
  const language = useLanguage();
  const { width } = useWindowDimensions();
  const desktopWeb = isDesktopWeb(width);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get("/api/achievements");
        setAchievements(response.data.data.achievements);
      } catch {
        setError(t("milestones.loadError"));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [t]);

  const earned = achievements.filter((a) => a.earned);
  const remaining = achievements.filter((a) => !a.earned);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={WarshPalette.gold} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: desktopWeb ? 0 : insets.top }]}>
      <ScreenHeader title={t("milestones.title")} showBack={!desktopWeb} style={desktopWeb ? styles.webHeader : null} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, desktopWeb && styles.webRow]}
      >
        <Text style={styles.subtitle}>
          {t("milestones.summary", { earned: earned.length, remaining: remaining.length })}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {earned.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>{t("milestones.earned")}</Text>
            {earned.map((a) => (
              <View key={a.key} style={[styles.card, styles.cardEarned]}>
                <View style={styles.iconWrap}>
                  <Ionicons name={a.icon as any} size={28} color={WarshPalette.gold} />
                </View>
                <View style={styles.cardBody}>
                  <ArabicText size="sm" style={styles.cardTitle}>{a.title}</ArabicText>
                  <Text style={styles.cardDesc}>{a.description}</Text>
                  {a.unlockedAt ? (
                    <Text style={styles.cardDate}>{formatDate(a.unlockedAt, language)}</Text>
                  ) : null}
                </View>
                <Text style={styles.cardXp}>{t("milestones.points", { count: a.xpReward })}</Text>
              </View>
            ))}
          </>
        ) : null}

        {remaining.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>{t("milestones.notYet")}</Text>
            {remaining.map((a) => (
              <View key={a.key} style={[styles.card, styles.cardLocked]}>
                <View style={[styles.iconWrap, styles.iconWrapLocked]}>
                  <Ionicons name={a.icon as any} size={28} color={WarshPalette.subtleBrown} />
                </View>
                <View style={styles.cardBody}>
                  <ArabicText size="sm" style={styles.cardTitleLocked}>{a.title}</ArabicText>
                  <Text style={styles.cardDesc}>{a.description}</Text>
                </View>
                <Text style={styles.cardXpLocked}>{t("milestones.points", { count: a.xpReward })}</Text>
              </View>
            ))}
          </>
        ) : null}

      </ScrollView>
      <StatusBarBacking />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.creamBg,
  },
  screen: {
    flex: 1,
    backgroundColor: WarshPalette.creamBg,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  webHeader: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingTop: 36,
  },
  webRow: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },
  subtitle: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
  },
  errorText: {
    color: WarshPalette.wrongText,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 28,
  },
  sectionLabelSpaced: { marginTop: Spacing.xl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 0.5,
    gap: Spacing.md,
  },
  cardEarned: {
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.white,
  },
  cardLocked: {
    borderColor: WarshPalette.lockedRing,
    backgroundColor: WarshPalette.lockedSurface,
  },
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: WarshPalette.parchmentSoft,
    borderWidth: 0.5,
    borderColor: WarshPalette.highlightBorder,
  },
  iconWrapLocked: {
    backgroundColor: WarshPalette.creamBg,
    borderColor: WarshPalette.lockedRing,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: WarshPalette.ink,
    fontSize: FontSizes.arabicM,
    lineHeight: LineHeights.arabicM,
    textAlign: "left",
  },
  cardTitleLocked: {
    color: WarshPalette.metaGrey,
    fontSize: FontSizes.arabicM,
    lineHeight: LineHeights.arabicM,
    textAlign: "left",
  },
  cardDesc: {
    color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  cardDate: {
    marginTop: 2,
    color: WarshPalette.goldText,
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    fontStyle: "italic",
    lineHeight: LineHeights.caption,
  },
  cardXp: {
    color: WarshPalette.sageDeep,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    fontVariant: ["lining-nums", "tabular-nums"],
  },
  cardXpLocked: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
});
