import { useCallback, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { PlayButton } from "@components/PlayButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { getTadabbur, getTadabburSurah } from "@services/api";

// ─── types ────────────────────────────────────────────────────────────────────

type WordState = "sage" | "ink" | "gold";

interface WordData {
  pos: number;
  arabic: string;
  arabicPlain: string;
  vocabId: string | null;
  state: WordState;
}

interface AyahData {
  ayahNumber: number;
  arabic: string;
  translationEn: string;
  words: WordData[];
}

interface SurahMeta {
  id: string;
  orderInProg: number;
  surahNumber: number;
  nameAr: string;
  nameEn: string;
  meaningEn: string;
  totalAyat: number;
  comprehensionPercent: number;
  completedAt: string | null;
}

// ─── word color ───────────────────────────────────────────────────────────────

function wordColor(state: WordState): string {
  if (state === "gold") return WarshPalette.gold;
  if (state === "ink") return WarshPalette.ink;
  return WarshPalette.sage + "80"; // sage dim
}

// ─── color-coded ayah row ─────────────────────────────────────────────────────

function AyahRow({
  ayah,
  surahNumber,
  onWordPress,
}: {
  ayah: AyahData;
  surahNumber: number;
  onWordPress: (w: WordData) => void;
}) {
  return (
    <View style={styles.ayahBlock}>
      <View style={styles.ayahWordWrap}>
        {ayah.words.map((w) => (
          <TouchableOpacity
            key={w.pos}
            onPress={() => w.vocabId && onWordPress(w)}
            activeOpacity={w.vocabId ? 0.65 : 1}
          >
            <Text style={[styles.ayahWord, { color: wordColor(w.state) }]}>{w.arabic}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.ayahMeta}>
        <PlayButton
          text={ayah.arabic}
          cacheKey={`ayah_${surahNumber}_${ayah.ayahNumber}`}
          category="lessons"
          size={14}
        />
        <Text style={styles.ayahRef}>{surahNumber}:{ayah.ayahNumber}</Text>
      </View>
      <Text style={styles.ayahTranslation}>{ayah.translationEn}</Text>
    </View>
  );
}

// ─── word bottom sheet ────────────────────────────────────────────────────────

function WordSheet({
  word,
  visible,
  onDismiss,
  onViewDetail,
}: {
  word: WordData | null;
  visible: boolean;
  onDismiss: () => void;
  onViewDetail: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.sheetOverlay} onPress={onDismiss}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />
          {word ? (
            <>
              <View style={styles.sheetArabicRow}>
                <ArabicText size="xl" style={StyleSheet.flatten([styles.sheetArabic, { color: wordColor(word.state) }])}>
                  {word.arabic}
                </ArabicText>
                <PlayButton text={word.arabic} cacheKey={word.arabicPlain} category="words" size={24} />
              </View>
              <View style={styles.sheetStateBadge}>
                <Text style={styles.sheetStateBadgeText}>
                  {word.state === "gold" ? "Mastered" : word.state === "ink" ? "In vocabulary" : "Not yet learned"}
                </Text>
              </View>
              {word.vocabId ? (
                <TouchableOpacity style={styles.sheetDetailBtn} onPress={onViewDetail}>
                  <Text style={styles.sheetDetailBtnText}>View full details ›</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.sheetDismissBtn} onPress={onDismiss}>
                <Text style={styles.sheetDismissBtnText}>Close</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(100, percent)}%` as any }]} />
    </View>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export default function TadabburScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ surahId?: string }>();

  const [allSurahs, setAllSurahs] = useState<SurahMeta[]>([]);
  const [focusSurahId, setFocusSurahId] = useState<string | null>(null);
  const [activeSurahId, setActiveSurahId] = useState<string | null>(params.surahId ?? null);
  const [ayat, setAyat] = useState<AyahData[]>([]);
  const [surahMeta, setSurahMeta] = useState<SurahMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAyat, setLoadingAyat] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getTadabbur()
        .then((res) => {
          const { surahs, focusSurahId: fid } = res.data.data;
          setAllSurahs(surahs);
          setFocusSurahId(fid);
          const targetId = params.surahId ?? fid;
          setActiveSurahId(targetId);
          const meta = surahs.find((s: SurahMeta) => s.id === targetId);
          if (meta) setSurahMeta(meta);
          if (targetId) loadSurahAyat(targetId);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [params.surahId])
  );

  async function loadSurahAyat(surahId: string) {
    setLoadingAyat(true);
    try {
      const res = await getTadabburSurah(surahId);
      const surah: SurahMeta = allSurahs.find((s) => s.id === surahId) ?? res.data.data.surah;
      setAyat(res.data.data.ayat);
      setSurahMeta(surah);

      if (surah.comprehensionPercent >= 100) {
        const celebKey = `warsh_surah_celebrated_${surahId}`;
        const alreadyCelebrated = await AsyncStorage.getItem(celebKey);
        if (!alreadyCelebrated) {
          await AsyncStorage.setItem(celebKey, "1");
          router.push({
            pathname: "/(app)/surah-celebration",
            params: {
              surahNameAr: surah.nameAr,
              surahNameEn: surah.nameEn,
              xpEarned: "50",
              isFirst: allSurahs.filter((s) => s.completedAt).length === 0 ? "true" : "false",
            },
          });
        }
      }
    } catch {}
    finally { setLoadingAyat(false); }
  }

  function handleWordPress(w: WordData) {
    setSelectedWord(w);
    setSheetVisible(true);
  }

  const completedSurahs = allSurahs.filter((s) => s.completedAt);
  const upcomingSurahs = allSurahs.filter(
    (s) => !s.completedAt && s.id !== activeSurahId
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tadabbur · تَدَبُّر</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Current focus Surah header */}
        {surahMeta ? (
          <View style={styles.focusHeader}>
            <Text style={styles.focusEyebrow}>Currently exploring</Text>
            <ArabicText size="xl" style={styles.focusNameAr}>{surahMeta.nameAr}</ArabicText>
            <Text style={styles.focusNameEn}>{surahMeta.nameEn} · {surahMeta.meaningEn}</Text>
            <View style={styles.focusProgressRow}>
              <ProgressBar percent={surahMeta.comprehensionPercent} />
              <Text style={styles.focusPercent}>{surahMeta.comprehensionPercent}% understood</Text>
            </View>
          </View>
        ) : null}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: WarshPalette.gold }]} />
            <Text style={styles.legendText}>Mastered</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: WarshPalette.ink }]} />
            <Text style={styles.legendText}>In vocabulary</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: WarshPalette.sage + "80" }]} />
            <Text style={styles.legendText}>Not yet learned</Text>
          </View>
        </View>

        {/* Color-coded Surah ayat */}
        {loadingAyat ? (
          <Text style={styles.loadingText}>Loading…</Text>
        ) : (
          <View style={styles.surahBlock}>
            {ayat.map((ayah) => (
              <AyahRow
                key={ayah.ayahNumber}
                ayah={ayah}
                surahNumber={surahMeta?.surahNumber ?? 1}
                onWordPress={handleWordPress}
              />
            ))}
          </View>
        )}

        {/* Completed Surahs */}
        {completedSurahs.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Surahs you've understood</Text>
            {completedSurahs.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.surahRow}
                onPress={() => {
                  setActiveSurahId(s.id);
                  setSurahMeta(s);
                  loadSurahAyat(s.id);
                }}
                activeOpacity={0.75}
              >
                <View style={styles.surahRowLeft}>
                  <ArabicText size="sm" style={styles.surahRowAr}>{s.nameAr}</ArabicText>
                  <Text style={styles.surahRowEn}>{s.nameEn}</Text>
                </View>
                <View style={styles.surahRowRight}>
                  <Ionicons name="checkmark-circle" size={20} color={WarshPalette.gold} />
                  {s.completedAt ? (
                    <Text style={styles.surahRowDate}>
                      {new Date(s.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Upcoming Surahs */}
        {upcomingSurahs.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coming up</Text>
            {upcomingSurahs.map((s) => (
              <View key={s.id} style={[styles.surahRow, styles.surahRowLocked]}>
                <View style={styles.surahRowLeft}>
                  <ArabicText size="sm" style={StyleSheet.flatten([styles.surahRowAr, { color: WarshPalette.subtleBrown }])}>{s.nameAr}</ArabicText>
                  <Text style={styles.surahRowEn}>{s.nameEn} · {s.meaningEn}</Text>
                </View>
                <Ionicons name="lock-closed-outline" size={16} color={WarshPalette.subtleBrown} />
              </View>
            ))}
          </View>
        ) : null}

        {/* Footer */}
        <Text style={styles.footer}>
          When you complete all 11 Surahs of Phase 2, Phase 3 begins, in shaa Allah.
        </Text>
      </ScrollView>

      {/* Word bottom sheet */}
      <WordSheet
        word={selectedWord}
        visible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
        onViewDetail={() => {
          setSheetVisible(false);
          if (selectedWord?.vocabId) {
            router.push(`/(app)/vocabulary/word/${selectedWord.vocabId}`);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },

  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: WarshPalette.parchmentCardBorder,
  },
  backBtn: { color: WarshPalette.gold, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL, width: 60 },
  headerTitle: { color: WarshPalette.ink, fontFamily: Fonts.display, fontSize: FontSizes.h3, fontWeight: "700" },

  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl * 3 },

  // Focus header
  focusHeader: { alignItems: "flex-end", paddingVertical: Spacing.xl },
  focusEyebrow: { color: WarshPalette.gold, fontFamily: Fonts.regular, fontSize: FontSizes.caption, fontWeight: "700", textTransform: "uppercase", marginBottom: Spacing.xs },
  focusNameAr: { color: WarshPalette.ink, textAlign: "right" },
  focusNameEn: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL, marginTop: Spacing.xs, textAlign: "right" },
  focusProgressRow: { width: "100%", marginTop: Spacing.md },
  progressTrack: { height: 6, backgroundColor: WarshPalette.cream, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: WarshPalette.gold, borderRadius: 3 },
  focusPercent: { color: WarshPalette.gold, fontFamily: Fonts.regular, fontSize: FontSizes.caption, marginTop: 4, textAlign: "right" },

  // Legend
  legend: { flexDirection: "row", gap: Spacing.lg, marginBottom: Spacing.lg, justifyContent: "flex-end" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption },

  // Surah text
  surahBlock: {
    borderRadius: Radii.lg, borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
    padding: Spacing.lg, marginBottom: Spacing.xl,
  },
  ayahBlock: { marginBottom: Spacing.lg },
  ayahWordWrap: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 4, justifyContent: "flex-start" },
  ayahWord: { fontFamily: Fonts.arabic, fontSize: 22, lineHeight: 38 },
  ayahMeta: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: 4 },
  ayahRef: { color: WarshPalette.gold, fontFamily: Fonts.regular, fontSize: FontSizes.caption },
  ayahTranslation: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, fontStyle: "italic", marginTop: 2, lineHeight: LineHeights.bodyM },

  loadingText: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, textAlign: "center", marginTop: Spacing.xl },

  // Sections
  section: { marginBottom: Spacing.xl },
  sectionTitle: { color: WarshPalette.gold, fontFamily: Fonts.regular, fontSize: FontSizes.caption, fontWeight: "700", textTransform: "uppercase", marginBottom: Spacing.md },
  surahRow: {
    flexDirection: "row", alignItems: "center",
    padding: Spacing.md, borderRadius: Radii.md,
    borderWidth: 0.5, borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg, marginBottom: Spacing.sm,
  },
  surahRowLocked: { opacity: 0.6 },
  surahRowLeft: { flex: 1, alignItems: "flex-end" },
  surahRowAr: { color: WarshPalette.ink, textAlign: "right" },
  surahRowEn: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM },
  surahRowRight: { alignItems: "center", gap: 2, marginLeft: Spacing.sm },
  surahRowDate: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption },

  footer: { textAlign: "center", color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption, fontStyle: "italic", marginTop: Spacing.lg },

  // Word sheet
  sheetOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheetContainer: {
    backgroundColor: WarshPalette.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, paddingBottom: Spacing.xl * 2,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: WarshPalette.cream, borderRadius: 2, alignSelf: "center", marginBottom: Spacing.lg },
  sheetArabicRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.md, marginBottom: Spacing.sm },
  sheetArabic: { textAlign: "center" },
  sheetStateBadge: {
    alignSelf: "center", paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderRadius: Radii.full ?? 999, backgroundColor: WarshPalette.parchmentBg,
    borderWidth: 1, borderColor: WarshPalette.parchmentCardBorder, marginBottom: Spacing.lg,
  },
  sheetStateBadgeText: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption },
  sheetDetailBtn: {
    borderRadius: Radii.md, borderWidth: 1, borderColor: WarshPalette.gold,
    padding: Spacing.md, alignItems: "center", marginBottom: Spacing.sm,
  },
  sheetDetailBtnText: { color: WarshPalette.gold, fontFamily: Fonts.display, fontSize: FontSizes.bodyL, fontWeight: "700" },
  sheetDismissBtn: { padding: Spacing.md, alignItems: "center" },
  sheetDismissBtnText: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM },
});
