import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { getCore500Overview, getApiErrorMessage } from "@services/api";
import { useT } from "@i18n/index";
import {
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../../constants/theme";

interface CoreSet {
  setNumber: number;
  wordCount: number;
  knownCount: number;
  completed: boolean;
  unlocked: boolean;
  preview: string[];
  coverageGain: number;
  coverageValue: number;
}

interface Overview {
  coveragePercent: number;
  knownCount: number;
  totalCount: number;
  setSize: number;
  setCount: number;
  completedSetCount: number;
  nextSetNumber: number | null;
  sets: CoreSet[];
}

// The list is 100 sets long; rendering it all at once is wasteful when the
// learner only ever acts on the next one. Show a window around their place.
const VISIBLE_SETS = 12;

export default function Core500Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktopWeb = Platform.OS === "web" && width >= 960;
  const t = useT();

  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await getCore500Overview();
      setOverview(response.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err, t("core500.loadFailed")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={WarshPalette.gold} />
      </View>
    );
  }

  if (error || !overview) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error ?? t("core500.loadFailed")}</Text>
        <TouchableOpacity onPress={() => void load()} style={styles.retryButton}>
          <Text style={styles.retryText}>{t("common.retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Centre the window on the set they are about to do.
  const nextSet = overview.nextSetNumber ?? overview.setCount;
  const windowStart = Math.max(0, Math.min(nextSet - 3, overview.setCount - VISIBLE_SETS));
  const visibleSets = overview.sets.slice(windowStart, windowStart + VISIBLE_SETS);
  const nextSetData = overview.sets.find((s) => s.setNumber === overview.nextSetNumber);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          desktopWeb ? styles.webHeaderRow : { paddingTop: insets.top + Spacing.xl },
        ]}
      >
        {!desktopWeb ? (
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={WarshPalette.ink} />
          </TouchableOpacity>
        ) : null}
        <Text style={styles.headerTitle}>{t("core500.title")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Coverage is the headline: the top words are so frequent that a
            handful of sets already moves this number a lot. */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>{t("core500.eyebrow")}</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroPercent}>{overview.coveragePercent}%</Text>
            <Text style={styles.heroCaption}>{t("core500.ofEveryWord")}</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.trackFill,
                { width: `${Math.min(100, overview.coveragePercent)}%` },
              ]}
            />
          </View>
          <Text style={styles.heroFootnote}>
            {t(
              overview.completedSetCount === 1
                ? "core500.wordsLearnedOneSet"
                : "core500.wordsLearned",
              {
                known: overview.knownCount,
                total: overview.totalCount,
                sets: overview.completedSetCount,
              },
            )}
          </Text>
        </View>

        {overview.nextSetNumber !== null ? (
          <Pressable
            onPress={() => router.push(`/(app)/core-500/set/${overview.nextSetNumber}`)}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaTitle}>
              {t("core500.continue", { set: overview.nextSetNumber })}
            </Text>
            <Text style={styles.ctaSub}>
              {t("core500.continueSub", {
                count: (nextSetData?.wordCount ?? overview.setSize) - (nextSetData?.knownCount ?? 0),
              })}
            </Text>
          </Pressable>
        ) : null}

        <Text style={styles.sectionTitle}>{t("core500.yourSets")}</Text>

        {visibleSets.map((set) => {
          const isCurrent = set.setNumber === overview.nextSetNumber;
          return (
            <Pressable
              key={set.setNumber}
              disabled={!set.unlocked}
              onPress={() => router.push(`/(app)/core-500/set/${set.setNumber}`)}
              style={({ pressed }) => [
                styles.setRow,
                isCurrent && styles.setRowCurrent,
                !set.unlocked && styles.setRowLocked,
                pressed && set.unlocked && styles.setRowPressed,
              ]}
            >
              <View
                style={[
                  styles.setBadge,
                  set.completed && styles.setBadgeDone,
                  isCurrent && styles.setBadgeCurrent,
                ]}
              >
                {set.completed ? (
                  <Ionicons name="checkmark" size={16} color={WarshPalette.white} />
                ) : (
                  <Text
                    style={[
                      styles.setBadgeText,
                      isCurrent && styles.setBadgeTextCurrent,
                    ]}
                  >
                    {set.setNumber}
                  </Text>
                )}
              </View>

              <View style={styles.setCopy}>
                {set.unlocked ? (
                  <ArabicText size="sm" style={styles.setPreview}>
                    {set.preview.join("  ·  ")}
                  </ArabicText>
                ) : (
                  <Text style={styles.setTitleLocked}>
                    {t("core500.setLabel", { set: set.setNumber })}
                  </Text>
                )}
                <Text style={styles.setSub}>
                  {set.completed
                    ? t("core500.setDone", { gain: set.coverageValue })
                    : set.unlocked
                      ? t("core500.setCurrent", {
                          count: set.wordCount - set.knownCount,
                          gain: set.coverageGain,
                        })
                      : t("core500.setLocked", { previous: set.setNumber - 1 })}
                </Text>
              </View>

              <Ionicons
                name={set.unlocked ? "chevron-forward" : "lock-closed-outline"}
                size={18}
                color={set.unlocked ? WarshPalette.goldDeep : WarshPalette.disabledIcon}
              />
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => router.push("/(app)/core-500/words")}
          style={({ pressed }) => [styles.wordsRow, pressed && styles.setRowPressed]}
        >
          <View style={styles.setCopy}>
            <Text style={styles.wordsTitle}>{t("core500.wordsYouKnow")}</Text>
            <Text style={styles.setSub}>
              {t("core500.wordsYouKnowSub", { count: overview.knownCount })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={WarshPalette.goldDeep} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WarshPalette.creamBg },
  centered: { alignItems: "center", justifyContent: "center", padding: Spacing.gutter },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.lg,
  },
  webHeaderRow: { paddingTop: Spacing.xl },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    color: WarshPalette.ink,
  },
  content: { paddingHorizontal: Spacing.gutter, gap: Spacing.md },

  hero: {
    backgroundColor: WarshPalette.parchmentSoft,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.parchmentCardBorder,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  heroEyebrow: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    letterSpacing: 1.2,
    color: WarshPalette.subtleBrown,
  },
  heroRow: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.sm },
  heroPercent: {
    fontFamily: Fonts.display,
    fontSize: 48,
    lineHeight: 54,
    color: WarshPalette.navy,
  },
  heroCaption: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    paddingBottom: Spacing.sm,
  },
  track: {
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.cream,
    overflow: "hidden",
  },
  trackFill: { height: 8, borderRadius: Radii.full, backgroundColor: WarshPalette.gold },
  heroFootnote: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.subtleBrown,
  },

  cta: {
    backgroundColor: WarshPalette.navy,
    borderRadius: Radii.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    gap: 2,
  },
  ctaPressed: { backgroundColor: WarshPalette.navyDeep },
  ctaTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.h3,
    color: WarshPalette.parchment,
  },
  ctaSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.cream,
  },

  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: WarshPalette.ink,
    marginTop: Spacing.sm,
  },

  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: WarshPalette.parchmentBg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
    padding: Spacing.lg,
  },
  setRowCurrent: {
    backgroundColor: WarshPalette.highlightBg,
    borderColor: WarshPalette.highlightBorder,
  },
  setRowLocked: { opacity: 0.6 },
  setRowPressed: { backgroundColor: WarshPalette.highlightBgSoft },
  setBadge: {
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.cream,
  },
  setBadgeDone: { backgroundColor: WarshPalette.sage },
  setBadgeCurrent: { backgroundColor: WarshPalette.gold },
  setBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
  },
  setBadgeTextCurrent: { color: WarshPalette.white },
  setCopy: { flex: 1, gap: 2 },
  setPreview: { color: WarshPalette.ink },
  setTitleLocked: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.disabledText,
  },
  setSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.subtleBrown,
  },

  wordsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: WarshPalette.parchmentDeep,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  wordsTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
  },

  errorText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.wrongText,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.navy,
  },
  retryText: { fontFamily: Fonts.semiBold, color: WarshPalette.parchment },
});
