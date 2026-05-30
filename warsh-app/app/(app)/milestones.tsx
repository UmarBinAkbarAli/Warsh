import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import { BrandButton } from "@components/BrandButton";
import { FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";

type Achievement = {
  key: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  earned: boolean;
  unlockedAt: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function MilestonesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get("/api/achievements");
        setAchievements(response.data.data.achievements);
      } catch {
        setError("Unable to load milestones.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

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
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xl }]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Your journey</Text>
        <Text style={styles.title}>Milestones</Text>
        <Text style={styles.subtitle}>{earned.length} earned · {remaining.length} remaining</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {earned.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>Earned</Text>
          {earned.map((a) => (
            <View key={a.key} style={[styles.card, styles.cardEarned]}>
              <View style={styles.iconWrap}>
                <Ionicons name={a.icon as any} size={28} color={WarshPalette.gold} />
              </View>
              <View style={styles.cardBody}>
                <ArabicText size="sm" style={styles.cardTitle}>{a.title}</ArabicText>
                <Text style={styles.cardDesc}>{a.description}</Text>
                {a.unlockedAt ? (
                  <Text style={styles.cardDate}>{formatDate(a.unlockedAt)}</Text>
                ) : null}
              </View>
              <Text style={styles.cardXp}>+{a.xpReward} pts</Text>
            </View>
          ))}
        </>
      ) : null}

      {remaining.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>Not yet earned</Text>
          {remaining.map((a) => (
            <View key={a.key} style={[styles.card, styles.cardLocked]}>
              <View style={[styles.iconWrap, styles.iconWrapLocked]}>
                <Ionicons name={a.icon as any} size={28} color={WarshPalette.subtleBrown} />
              </View>
              <View style={styles.cardBody}>
                <ArabicText size="sm" style={styles.cardTitleLocked}>{a.title}</ArabicText>
                <Text style={styles.cardDesc}>{a.description}</Text>
              </View>
              <Text style={styles.cardXpLocked}>+{a.xpReward} pts</Text>
            </View>
          ))}
        </>
      ) : null}

      <BrandButton title="Back" onPress={() => router.back()} style={styles.backButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.parchment,
  },
  screen: {
    flex: 1,
    backgroundColor: WarshPalette.parchment,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  eyebrow: {
    color: WarshPalette.gold,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: LineHeights.label,
    textTransform: "uppercase",
  },
  title: {
    marginTop: Spacing.xs,
    color: WarshPalette.ink,
    fontFamily: Fonts.display,
    fontSize: FontSizes.h1,
    fontWeight: "700",
    lineHeight: LineHeights.h1,
  },
  subtitle: {
    marginTop: Spacing.xs,
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
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    fontWeight: "700",
    lineHeight: LineHeights.caption,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
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
    borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
    opacity: 0.65,
  },
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.sm,
    backgroundColor: "#FEF9E7",
    borderWidth: 0.5,
    borderColor: "#F0D080",
  },
  iconWrapLocked: {
    backgroundColor: WarshPalette.parchmentBg,
    borderColor: WarshPalette.defaultCardBorder,
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
    color: WarshPalette.subtleBrown,
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
    color: WarshPalette.gold,
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    fontStyle: "italic",
    lineHeight: LineHeights.caption,
  },
  cardXp: {
    color: WarshPalette.sage,
    fontFamily: Fonts.display,
    fontSize: FontSizes.caption,
    fontWeight: "500",
    lineHeight: LineHeights.caption,
  },
  cardXpLocked: {
    color: WarshPalette.subtleBrown,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
  },
  backButton: {
    marginTop: Spacing.lg,
  },
});
