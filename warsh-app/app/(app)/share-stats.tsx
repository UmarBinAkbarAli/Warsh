import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import api from "@services/api";
import { ArabicText } from "@components/ArabicText";
import {
  WarshPalette,
  Fonts,
  FontSizes,
  LineHeights,
  Spacing,
  Radii,
} from "../../constants/theme";

interface Stats {
  userName: string;
  xp: number;
  streak: number;
  longestStreak: number;
  completedLessons: number;
  vocabTotal: number;
  vocabMastered: number;
  level: string;
}

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  ELEMENTARY: "Elementary",
  INTERMEDIATE: "Intermediate",
};

export default function ShareStatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<View>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api
        .get("/api/progress")
        .then((res) => {
          const d = res.data.data;
          setStats({
            userName: d.userName ?? "Student",
            xp: d.xp ?? 0,
            streak: d.streak ?? 0,
            longestStreak: d.longestStreak ?? 0,
            completedLessons: d.completedLessons?.length ?? 0,
            vocabTotal: d.vocabTotal ?? 0,
            vocabMastered: d.vocabMastered ?? 0,
            level: d.level ?? "BEGINNER",
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  async function handleShare() {
    if (!viewShotRef.current || !stats) return;
    setSharing(true);
    try {
      const uri = await captureRef(viewShotRef, { format: "png", quality: 1 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your Warsh stats" });
      }
    } catch {
      // silently fail
    } finally {
      setSharing(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={WarshPalette.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share your progress</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={WarshPalette.gold} style={{ marginTop: Spacing.xxl }} />
      ) : stats ? (
        <>
          {/* Preview card — ref on inner View, captured via captureRef */}
          <ViewShot style={styles.cardWrapper}>
            <View ref={viewShotRef} style={styles.card}>
              {/* Brand header */}
              <View style={styles.cardBrand}>
                <Text style={styles.cardBrandEn}>Warsh</Text>
                <Text style={styles.cardBrandSep}> · </Text>
                <ArabicText size="sm" style={styles.cardBrandAr}>وَرْش</ArabicText>
              </View>

              {/* User + level */}
              <Text style={styles.cardName}>{stats.userName}</Text>
              <Text style={styles.cardLevel}>{LEVEL_LABEL[stats.level] ?? stats.level}</Text>

              {/* Primary stat — streak */}
              <View style={styles.streakRow}>
                <Text style={styles.streakNum}>{stats.streak}</Text>
                <View>
                  <Text style={styles.streakLabel}>day streak</Text>
                  <Text style={styles.streakSub}>longest: {stats.longestStreak}</Text>
                </View>
              </View>

              {/* Secondary stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{stats.xp}</Text>
                  <Text style={styles.statLabel}>XP earned</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{stats.completedLessons}</Text>
                  <Text style={styles.statLabel}>lessons done</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{stats.vocabTotal}</Text>
                  <Text style={styles.statLabel}>words learned</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{stats.vocabMastered}</Text>
                  <Text style={styles.statLabel}>words mastered</Text>
                </View>
              </View>

              {/* Tagline */}
              <Text style={styles.cardTagline}>Learning Quranic Arabic · warsh.app</Text>
            </View>
          </ViewShot>

          {/* Share button */}
          <TouchableOpacity
            style={[styles.shareBtn, sharing && styles.shareBtnDisabled]}
            onPress={handleShare}
            activeOpacity={0.8}
            disabled={sharing}
          >
            {sharing ? (
              <ActivityIndicator color={WarshPalette.white} size="small" />
            ) : (
              <>
                <Ionicons name="share-social-outline" size={20} color={WarshPalette.white} />
                <Text style={styles.shareBtnText}>Share card</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: WarshPalette.creamBg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: WarshPalette.defaultCardBorder,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: WarshPalette.ink,
  },

  cardWrapper: {
    margin: Spacing.xl,
    borderRadius: Radii.xl,
    overflow: "hidden",
  },
  card: {
    backgroundColor: WarshPalette.ink,
    padding: Spacing.xl,
    borderRadius: Radii.xl,
  },
  cardBrand: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  cardBrandEn: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.h2,
    color: WarshPalette.gold,
    fontWeight: "700",
  },
  cardBrandSep: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.h2,
    color: WarshPalette.gold,
  },
  cardBrandAr: {
    color: WarshPalette.gold,
    fontSize: FontSizes.arabicM,
  },
  cardName: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.h1,
    color: WarshPalette.parchment,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  cardLevel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.subtleBrown,
    marginBottom: Spacing.lg,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  streakNum: {
    fontFamily: Fonts.display,
    fontSize: 64,
    color: WarshPalette.sage,
    fontWeight: "500",
    lineHeight: 70,
  },
  streakLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.parchment,
    marginBottom: 4,
  },
  streakSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statBox: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  statNum: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.arabicM,
    color: WarshPalette.gold,
    fontWeight: "700",
  },
  statLabel: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    marginTop: 2,
  },
  cardTagline: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
    fontStyle: "italic",
  },

  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    backgroundColor: WarshPalette.gold,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  shareBtnDisabled: { opacity: 0.6 },
  shareBtnText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.white,
  },
});
