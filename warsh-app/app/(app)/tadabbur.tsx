import { useCallback, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { PlayButton } from "@components/PlayButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette, WarshAlpha } from "../../constants/theme";
import { getTadabbur, getTadabburSurah, isSubscriptionRequiredError, subscriptionRequiredRoute } from "@services/api";
import { pickLocalized, useTranslationLanguage } from "@services/language";
import { getEveryAyahAudioUrl } from "@services/quranAudio";
import { ScreenHeader } from "@components/ScreenHeader";
import { BottomSheetModal } from "@components/BottomSheetModal";
import { BrandButton } from "@components/BrandButton";
import { useT } from "@i18n/index";

// ─── types ────────────────────────────────────────────────────────────────────

type WordState = "sage" | "ink" | "gold";

interface WordData {
  pos: number;
  arabic: string;
  arabicPlain: string;
  vocabId: string | null;
  state: WordState;
  meaningEn?: string;
  meaningUr?: string | null;
  root?: string | null;
}

interface AyahData {
  ayahNumber: number;
  arabic: string;
  translationEn: string;
  translationUr?: string | null;
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

// ─── word state ───────────────────────────────────────────────────────────────
// Every word stays in full ink so the ayah is always legible; the learner's
// state is an underline instead of a faded colour (finding H8).

function wordMarkStyle(state: WordState) {
  if (state === "gold") return styles.wordMarkMastered;
  if (state === "ink") return styles.wordMarkLearning;
  return null;
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
  const translationLanguage = useTranslationLanguage();
  return (
    <View style={styles.ayahBlock}>
      <View style={styles.ayahWordWrap}>
        {ayah.words.map((w) => (
          <TouchableOpacity
            key={w.pos}
            onPress={() => w.vocabId && onWordPress(w)}
            activeOpacity={w.vocabId ? 0.65 : 1}
          >
            <Text style={styles.ayahWord}>{w.arabic}</Text>
            <View style={[styles.wordMark, wordMarkStyle(w.state)]} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.ayahMeta}>
        <PlayButton
          text={ayah.arabic}
          cacheKey={`ayah_${surahNumber}_${ayah.ayahNumber}`}
          category="lessons"
          audioUrl={getEveryAyahAudioUrl(surahNumber, ayah.ayahNumber)}
          size={14}
        />
        <Text style={styles.ayahRef}>{surahNumber}:{ayah.ayahNumber}</Text>
      </View>
      <Text style={styles.ayahTranslation}>{pickLocalized(ayah.translationEn, ayah.translationUr, translationLanguage)}</Text>
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
  const insets = useSafeAreaInsets();
  const translationLanguage = useTranslationLanguage();
  const t = useT();
  const known = word?.state === "gold" || word?.state === "ink";
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onDismiss}
      scrimStyle={styles.sheetScrim}
      sheetStyle={[styles.sheetContainer, { paddingBottom: Spacing.xl * 2 + insets.bottom }]}
    >
      <View>
          <View style={styles.sheetHandle} />
          {word ? (
            <>
              <View style={styles.sheetArabicRow}>
                <ArabicText size="xl" style={styles.sheetArabic}>
                  {word.arabic}
                </ArabicText>
                <PlayButton text={word.arabic} cacheKey={word.arabicPlain} category="words" wordId={word.vocabId ?? undefined} size={24} />
              </View>
              {word.meaningEn ? (
                <Text style={[styles.sheetMeaning, translationLanguage === "ur" && styles.sheetMeaningUrdu]}>
                  {pickLocalized(word.meaningEn, word.meaningUr, translationLanguage)}
                </Text>
              ) : null}
              <View style={styles.sheetChips}>
                {word.root ? (
                  <View style={styles.sheetRootChip}>
                    <Text style={styles.sheetRootLabel}>{t("tadabbur.root")} </Text>
                    <ArabicText size="sm" style={styles.sheetRoot}>{word.root}</ArabicText>
                  </View>
                ) : null}
                <View style={[styles.sheetStateBadge, known && styles.sheetStateBadgeKnown]}>
                  <Text style={[styles.sheetStateBadgeText, known && styles.sheetStateBadgeTextKnown]}>
                    {word.state === "gold" ? t("tadabbur.mastered") : word.state === "ink" ? t("tadabbur.inVocabulary") : t("tadabbur.notLearned")}
                  </Text>
                </View>
              </View>
              {word.vocabId ? (
                <BrandButton title={t("tadabbur.viewDetails")} onPress={onViewDetail} style={styles.sheetDetailBtn} />
              ) : null}
              <TouchableOpacity style={styles.sheetDismissBtn} onPress={onDismiss} accessibilityRole="button">
                <Text style={styles.sheetDismissBtnText}>{t("common.close")}</Text>
              </TouchableOpacity>
            </>
          ) : null}
      </View>
    </BottomSheetModal>
  );
}

// ─── progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, percent || 0))}%` as any }]} />
    </View>
  );
}

// ─── main screen ─────────────────────────────────────────────────────────────

export default function TadabburScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktopWeb = Platform.OS === "web" && width >= 960;
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
          if (targetId) loadSurahAyat(targetId, surahs);
        })
        .catch((loadError) => {
          if (isSubscriptionRequiredError(loadError)) {
            void subscriptionRequiredRoute().then((route) => router.replace(route));
          }
        })
        .finally(() => setLoading(false));
    }, [params.surahId, router])
  );

  // `surahs` is passed on first load: `allSurahs` state is still empty in this
  // closure, and the fallback used to lack comprehensionPercent (finding H8).
  async function loadSurahAyat(surahId: string, surahs: SurahMeta[] = allSurahs) {
    setLoadingAyat(true);
    try {
      const res = await getTadabburSurah(surahId);
      const surah: SurahMeta = surahs.find((s) => s.id === surahId) ?? res.data.data.surah;
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
              isFirst: surahs.filter((s) => s.completedAt).length === 0 ? "true" : "false",
            },
          });
        }
      }
    } catch (loadError) {
      if (isSubscriptionRequiredError(loadError)) {
        router.replace(await subscriptionRequiredRoute());
      }
    }
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
      <ScreenHeader title="Tadabbur · تَدَبُّر" style={desktopWeb ? styles.webHeaderRow : null} />

      <ScrollView contentContainerStyle={[styles.content, desktopWeb && styles.webRow]}>

        {/* Current focus Surah header */}
        {surahMeta ? (
          <View style={styles.focusHeader}>
            <Text style={styles.focusEyebrow}>Currently exploring</Text>
            <ArabicText size="xl" style={styles.focusNameAr}>{surahMeta.nameAr}</ArabicText>
            <Text style={styles.focusNameEn}>{surahMeta.nameEn} · {surahMeta.meaningEn}</Text>
            <View style={styles.focusProgressRow}>
              <ProgressBar percent={surahMeta.comprehensionPercent} />
              <Text style={styles.focusPercent}>{surahMeta.comprehensionPercent ?? 0}% understood</Text>
            </View>
          </View>
        ) : null}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendMark, styles.wordMarkMastered]} />
            <Text style={styles.legendText}>Mastered</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendMark, styles.wordMarkLearning]} />
            <Text style={styles.legendText}>In vocabulary</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendMark} />
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
  backBtn: { color: WarshPalette.goldText, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL, width: 60 },
  headerTitle: { color: WarshPalette.ink, fontFamily: Fonts.display, fontSize: FontSizes.h3 },

  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl * 3 },
  webRow: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  webHeaderRow: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    borderBottomWidth: 0,
    paddingTop: 36,
  },

  // Focus header
  focusHeader: { alignItems: "flex-end", paddingVertical: Spacing.xl },
  focusEyebrow: { color: WarshPalette.goldText, fontFamily: Fonts.bold, fontSize: FontSizes.caption, textTransform: "uppercase", marginBottom: Spacing.xs },
  focusNameAr: { color: WarshPalette.ink, textAlign: "right" },
  focusNameEn: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyL, marginTop: Spacing.xs, textAlign: "right" },
  focusProgressRow: { width: "100%", marginTop: Spacing.md },
  progressTrack: { height: 6, backgroundColor: WarshPalette.cream, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: WarshPalette.gold, borderRadius: 3 },
  focusPercent: { color: WarshPalette.goldText, fontFamily: Fonts.regular, fontSize: FontSizes.caption, marginTop: 4, textAlign: "right" },

  // Legend
  legend: { flexDirection: "row", gap: Spacing.lg, marginBottom: Spacing.lg, justifyContent: "flex-end" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendMark: { width: 16, height: 3, borderRadius: 2, backgroundColor: WarshPalette.cream },
  legendText: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.caption },

  // Surah text
  surahBlock: {
    borderRadius: Radii.md, borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
    padding: Spacing.lg, marginBottom: Spacing.xl,
  },
  ayahBlock: { marginBottom: Spacing.lg },
  ayahWordWrap: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 4, justifyContent: "flex-start" },
  ayahWord: { fontFamily: Fonts.arabic, fontSize: 22, lineHeight: 38, color: WarshPalette.ink },
  wordMark: { height: 3, borderRadius: 2, marginTop: -2, backgroundColor: "transparent" },
  wordMarkMastered: { backgroundColor: WarshPalette.gold },
  wordMarkLearning: { backgroundColor: WarshPalette.sageSoft },
  sheetMeaning: { color: WarshPalette.ink, fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 28, textAlign: "center", marginTop: Spacing.xs },
  sheetMeaningUrdu: { fontFamily: Fonts.urduFallback, fontSize: 20, lineHeight: 36 },
  sheetRoot: { color: WarshPalette.goldText },
  ayahMeta: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: 4 },
  ayahRef: { color: WarshPalette.goldText, fontFamily: Fonts.regular, fontSize: FontSizes.caption },
  ayahTranslation: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, fontStyle: "italic", marginTop: 2, lineHeight: LineHeights.bodyM },

  loadingText: { color: WarshPalette.subtleBrown, fontFamily: Fonts.regular, fontSize: FontSizes.bodyM, textAlign: "center", marginTop: Spacing.xl },

  // Sections
  section: { marginBottom: Spacing.xl },
  sectionTitle: { color: WarshPalette.goldText, fontFamily: Fonts.bold, fontSize: FontSizes.caption, textTransform: "uppercase", marginBottom: Spacing.md },
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
  sheetScrim: { backgroundColor: WarshAlpha.sheetScrim },
  sheetContainer: {
    backgroundColor: WarshPalette.creamBg, borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.gutter, paddingTop: Spacing.md, paddingBottom: Spacing.xl * 2,
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: WarshPalette.parchment, borderRadius: 2, alignSelf: "center", marginBottom: Spacing.lg },
  sheetChips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: Spacing.sm, marginTop: Spacing.lg },
  sheetRootChip: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: 2,
    borderRadius: Radii.full, borderWidth: 1, borderColor: WarshPalette.cream, backgroundColor: WarshPalette.highlightBgSoft,
  },
  sheetRootLabel: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: 13 },
  sheetArabicRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.md, marginBottom: Spacing.sm },
  sheetArabic: { textAlign: "center" },
  sheetStateBadge: {
    justifyContent: "center", paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radii.full, backgroundColor: WarshPalette.parchmentBg,
    borderWidth: 1, borderColor: WarshPalette.cream,
  },
  sheetStateBadgeKnown: { backgroundColor: WarshPalette.correctBg, borderColor: WarshPalette.correctBg },
  sheetStateBadgeText: { color: WarshPalette.bodyBrown, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
  sheetStateBadgeTextKnown: { color: WarshPalette.sageDeep, fontFamily: Fonts.bold },
  sheetDetailBtn: { marginTop: Spacing.xl },
  sheetDismissBtn: { minHeight: 48, marginTop: 6, alignItems: "center", justifyContent: "center" },
  sheetDismissBtnText: { color: WarshPalette.navy, fontFamily: Fonts.semiBold, fontSize: FontSizes.bodyL },
});
