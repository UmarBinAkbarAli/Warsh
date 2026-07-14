import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { PlayButton } from "@components/PlayButton";
import { Colors, FontSizes, Fonts, LineHeights, Radii, Spacing, WarshPalette } from "../../../../constants/theme";
import { getVocabularyWordDetail, updateUserVocabularyWord } from "@services/api";
import { useTranslationLanguage, pickTranslation, pickLocalized } from "@services/language";
import { useT } from "@i18n/index";

interface QuranicExample {
  surahNumber: number;
  surahNameEn: string;
  surahNameAr?: string;
  ayahNumber: number;
  ayahArabic: string;
  translationEn: string;
  translationUr?: string;
}

interface VocabWord {
  id: string;
  arabic: string;
  arabicPlain: string;
  transliteration: string;
  translationEn: string;
  translationUr: string;
  wordType: string;
  gender?: string | null;
  pluralForm?: string | null;
  rootLetters?: string | null;
  topicCategories: string[];
  chapterIntroduced: number;
  frequencyInQuran?: number | null;
  quranicExample?: QuranicExample | null;
  imageUrl?: string | null;
}

interface UserWord {
  isFavorite: boolean;
  isHidden: boolean;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string;
}

interface RelatedWord {
  id: string;
  arabic: string;
  arabicPlain: string;
  transliteration: string;
  translationEn: string;
  translationUr: string;
}

function highlightWordInAyah(ayah: string, arabicPlain: string, arabic: string) {
  // Try exact match first, then strip harakat from both for matching
  const stripHarakat = (s: string) => s.replace(/[ً-ٰٟ]/g, "");
  const plainAyah = stripHarakat(ayah);
  const plainTarget = stripHarakat(arabic) || arabicPlain;

  const idx = plainAyah.indexOf(plainTarget);
  if (idx === -1) {
    return [{ text: ayah, gold: false }];
  }

  // Map position from plain back to original — character counts won't match due to harakat.
  // Fallback: split on the target word in the original string.
  const parts = ayah.split(arabic);
  if (parts.length >= 2) {
    const result: { text: string; gold: boolean }[] = [];
    parts.forEach((part, i) => {
      if (part) result.push({ text: part, gold: false });
      if (i < parts.length - 1) result.push({ text: arabic, gold: true });
    });
    return result;
  }

  return [{ text: ayah, gold: false }];
}

export default function WordDetailScreen() {
  const { wordId } = useLocalSearchParams<{ wordId: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const language = useTranslationLanguage();
  const t = useT();

  const [word, setWord] = useState<VocabWord | null>(null);
  const [userWord, setUserWord] = useState<UserWord | null>(null);
  const [relatedWords, setRelatedWords] = useState<RelatedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!wordId) return;
      setLoading(true);
      getVocabularyWordDetail(wordId)
        .then((res) => {
          setWord(res.data.data.word);
          setUserWord(res.data.data.userWord);
          setRelatedWords(res.data.data.relatedWords);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [wordId])
  );

  function wordTypeLabel(wordType: string) {
    switch (wordType) {
      case "NOUN":
        return t("vocabulary.typeNoun");
      case "VERB_PAST":
        return t("vocabulary.typeVerbPast");
      case "VERB_PRESENT":
        return t("vocabulary.typeVerbPresent");
      case "VERB_IMPERATIVE":
        return t("vocabulary.typeVerbImperative");
      case "ADJECTIVE":
        return t("vocabulary.typeAdjective");
      case "PRONOUN":
        return t("vocabulary.typePronoun");
      case "DEMONSTRATIVE":
        return t("vocabulary.typeDemonstrative");
      case "PREPOSITION":
        return t("vocabulary.typePreposition");
      case "PARTICLE":
        return t("vocabulary.typeParticle");
      case "INTERROGATIVE":
        return t("vocabulary.typeInterrogative");
      case "ADVERB":
        return t("vocabulary.typeAdverb");
      case "PROPER_NOUN":
        return t("vocabulary.typeProperNoun");
      case "NUMBER":
        return t("vocabulary.typeNumber");
      case "CONJUNCTION":
        return t("vocabulary.typeConjunction");
      default:
        return wordType;
    }
  }

  async function toggleFavorite() {
    if (!word || saving) return;
    const newVal = !(userWord?.isFavorite ?? false);
    setSaving(true);
    try {
      const res = await updateUserVocabularyWord(word.id, { isFavorite: newVal });
      setUserWord(res.data.data);
    } finally {
      setSaving(false);
    }
  }

  async function toggleHidden() {
    if (!word || saving) return;
    const newVal = !(userWord?.isHidden ?? false);
    setSaving(true);
    try {
      const res = await updateUserVocabularyWord(word.id, { isHidden: newVal });
      setUserWord(res.data.data);
    } finally {
      setSaving(false);
    }
  }

  async function markForReview() {
    if (!word || saving) return;
    setSaving(true);
    try {
      const res = await updateUserVocabularyWord(word.id, { markForReview: true });
      setUserWord(res.data.data);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !word) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + Spacing.xl }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: Spacing.xl }}>
          <Text style={styles.backBtn}>‹ {t("common.back")}</Text>
        </TouchableOpacity>
        <ActivityIndicator color={WarshPalette.gold} style={{ marginTop: Spacing.xl * 2 }} />
      </View>
    );
  }

  const isMastered = (userWord?.repetitions ?? 0) >= 5 && (userWord?.easeFactor ?? 0) >= 2.5;
  const ayahParts = word.quranicExample
    ? highlightWordInAyah(word.quranicExample.ayahArabic, word.arabicPlain, word.arabic)
    : [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ {t("common.back")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} disabled={saving}>
          <Ionicons
            name={userWord?.isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={userWord?.isFavorite ? WarshPalette.gold : WarshPalette.bodyBrown}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Arabic display */}
        <View style={styles.arabicSection}>
          {word.imageUrl ? (
            <Image
              source={{ uri: word.imageUrl }}
              style={styles.wordImage}
              contentFit="contain"
              cachePolicy="disk"
              transition={150}
            />
          ) : null}
          <ArabicText size="xl" style={styles.arabicMain}>{word.arabic}</ArabicText>
          <View style={{ marginTop: Spacing.sm }}>
            <PlayButton text={word.arabic} wordId={word.id} size={32} />
          </View>
          <Text style={styles.translit}>{word.transliteration}</Text>
          <Text style={styles.translation}>{pickTranslation(word, language)}</Text>
        </View>

        {/* Type badge */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {wordTypeLabel(word.wordType)}
              {word.gender ? ` (${word.gender.toLowerCase()})` : ""}
            </Text>
          </View>
          {isMastered ? (
            <View style={[styles.badge, styles.masteredBadge]}>
              <Text style={[styles.badgeText, styles.masteredBadgeText]}>{t("vocabulary.filterMastered")}</Text>
            </View>
          ) : null}
        </View>

        {/* Grammar info */}
        {(word.pluralForm || word.rootLetters || word.gender) ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("vocabulary.grammar")}</Text>
            {word.gender ? (
              <View style={styles.grammarRow}>
                <Text style={styles.grammarLabel}>{t("vocabulary.gender")}</Text>
                <Text style={styles.grammarValue}>{word.gender}</Text>
              </View>
            ) : null}
            {word.pluralForm ? (
              <View style={styles.grammarRow}>
                <Text style={styles.grammarLabel}>{t("vocabulary.plural")}</Text>
                <View style={styles.grammarValueRow}>
                  <ArabicText size="sm" style={styles.grammarArabic}>{word.pluralForm}</ArabicText>
                </View>
              </View>
            ) : null}
            {word.rootLetters ? (
              <View style={styles.grammarRow}>
                <Text style={styles.grammarLabel}>{t("vocabulary.rootLabel")}</Text>
                <ArabicText size="sm" style={styles.rootText}>{word.rootLetters}</ArabicText>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Quranic example */}
        {word.quranicExample ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("vocabulary.fromQuran")}</Text>
            <View style={styles.ayahContainer}>
              <Text style={styles.ayahText}>
                {ayahParts.map((part, i) => (
                  <Text key={i} style={part.gold ? styles.ayahWordGold : styles.ayahWordDefault}>
                    {part.text}
                  </Text>
                ))}
              </Text>
            </View>
            <View style={styles.ayahMeta}>
              <PlayButton
                text={word.quranicExample.ayahArabic}
                cacheKey={`ayah_${word.quranicExample.surahNumber}_${word.quranicExample.ayahNumber}`}
                category="lessons"
                size={18}
              />
              <Text style={styles.ayahRef}>
                {word.quranicExample.surahNameEn} · {word.quranicExample.surahNumber}:{word.quranicExample.ayahNumber}
              </Text>
            </View>
            <Text style={styles.ayahTranslation}>{pickLocalized(word.quranicExample.translationEn, word.quranicExample.translationUr, language)}</Text>
          </View>
        ) : null}

        {/* Frequency */}
        {word.frequencyInQuran ? (
          <View style={styles.frequencyRow}>
            <Ionicons name="book-outline" size={14} color={WarshPalette.gold} />
            <Text style={styles.frequencyText}>
              {t("vocabulary.frequency", {
                count: word.frequencyInQuran,
                suffix: word.frequencyInQuran !== 1 ? "s" : "",
              })}
            </Text>
          </View>
        ) : null}

        {/* Chapter introduced */}
        <View style={styles.frequencyRow}>
          <Ionicons name="layers-outline" size={14} color={WarshPalette.subtleBrown} />
          <Text style={styles.chapterText}>{t("vocabulary.introducedInChapter", { count: word.chapterIntroduced })}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionRow} onPress={markForReview} disabled={saving}>
            <Ionicons name="repeat-outline" size={20} color={WarshPalette.sage} />
            <Text style={styles.actionText}>{t("vocabulary.markForReview")}</Text>
            <Ionicons name="chevron-forward" size={16} color={WarshPalette.subtleBrown} />
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionRow} onPress={toggleHidden} disabled={saving}>
            <Ionicons
              name={userWord?.isHidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={WarshPalette.bodyBrown}
            />
            <Text style={styles.actionText}>
              {userWord?.isHidden ? t("vocabulary.unhideFromReview") : t("vocabulary.hideFromReview")}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={WarshPalette.subtleBrown} />
          </TouchableOpacity>
        </View>

        {/* Related words */}
        {relatedWords.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("vocabulary.sameRoot")} · {word.rootLetters}</Text>
            {relatedWords.map((rw) => (
              <TouchableOpacity
                key={rw.id}
                style={styles.relatedRow}
                onPress={() => router.replace(`/(app)/vocabulary/word/${rw.id}`)}
                activeOpacity={0.7}
              >
                <ArabicText size="sm" style={styles.relatedArabic}>{rw.arabic}</ArabicText>
                <View style={styles.relatedRight}>
                  <Text style={styles.relatedMeaning}>{pickTranslation(rw, language)}</Text>
                  <Text style={styles.relatedTranslit}>{rw.transliteration}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={WarshPalette.subtleBrown} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.primary },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: WarshPalette.parchmentCardBorder,
  },
  backBtn: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyL,
  },

  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl * 3 },

  arabicSection: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  wordImage: {
    width: 160,
    height: 160,
    marginBottom: Spacing.lg,
    borderRadius: Radii.lg,
  },
  arabicMain: { color: WarshPalette.ink, textAlign: "center" },
  translit: {
    marginTop: Spacing.sm, color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular, fontSize: FontSizes.bodyL,
    fontStyle: "italic", textAlign: "center",
  },
  translation: {
    marginTop: Spacing.xs, color: WarshPalette.ink,
    fontFamily: Fonts.display, fontSize: FontSizes.h3,
    fontWeight: "700", textAlign: "center",
  },
  translationUr: {
    marginTop: Spacing.xs, color: WarshPalette.bodyBrown,
    fontFamily: Fonts.regular, fontSize: FontSizes.bodyM,
    textAlign: "center",
  },

  badgeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  badge: {
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderRadius: Radii.full ?? 999,
    borderWidth: 1, borderColor: WarshPalette.defaultCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  badgeText: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
  },
  masteredBadge: {
    borderColor: WarshPalette.gold + "88",
    backgroundColor: WarshPalette.cream,
  },
  masteredBadgeText: { color: WarshPalette.gold },

  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.parchmentBg,
  },
  cardTitle: {
    color: WarshPalette.gold, fontFamily: Fonts.display,
    fontSize: FontSizes.label, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },

  grammarRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: Spacing.sm,
  },
  grammarLabel: {
    color: WarshPalette.subtleBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
  },
  grammarValue: {
    color: WarshPalette.ink, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM, fontWeight: "600",
  },
  grammarValueRow: { alignItems: "flex-end" },
  grammarArabic: { color: WarshPalette.ink },
  rootText: { color: WarshPalette.gold },

  ayahContainer: { marginBottom: Spacing.sm },
  ayahText: { textAlign: "right" },
  ayahWordDefault: {
    fontFamily: Fonts.arabic, fontSize: 20,
    color: WarshPalette.ink, lineHeight: 34,
  },
  ayahWordGold: {
    fontFamily: Fonts.arabic, fontSize: 20,
    color: WarshPalette.gold, lineHeight: 34,
  },
  ayahMeta: {
    flexDirection: "row", alignItems: "center",
    gap: Spacing.sm, marginBottom: Spacing.sm,
  },
  ayahRef: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
  },
  ayahTranslation: {
    color: WarshPalette.bodyBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM, fontStyle: "italic",
  },

  frequencyRow: {
    flexDirection: "row", alignItems: "center",
    gap: 6, marginBottom: Spacing.sm,
  },
  frequencyText: {
    color: WarshPalette.gold, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
  },
  chapterText: {
    color: WarshPalette.subtleBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
  },

  actionsCard: {
    marginVertical: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 0.5,
    borderColor: WarshPalette.parchmentCardBorder,
    backgroundColor: WarshPalette.white,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row", alignItems: "center",
    padding: Spacing.md, gap: Spacing.md,
  },
  actionText: {
    flex: 1, color: WarshPalette.ink,
    fontFamily: Fonts.regular, fontSize: FontSizes.bodyL,
  },
  actionDivider: {
    height: 0.5, backgroundColor: WarshPalette.parchmentCardBorder,
    marginHorizontal: Spacing.md,
  },

  relatedRow: {
    flexDirection: "row-reverse", alignItems: "center",
    gap: Spacing.sm, paddingVertical: Spacing.sm,
    borderTopWidth: 0.5, borderTopColor: WarshPalette.parchmentCardBorder,
  },
  relatedArabic: { color: WarshPalette.ink },
  relatedRight: { flex: 1 },
  relatedMeaning: {
    color: WarshPalette.ink, fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM, fontWeight: "600",
  },
  relatedTranslit: {
    color: WarshPalette.subtleBrown, fontFamily: Fonts.regular,
    fontSize: FontSizes.caption, fontStyle: "italic",
  },
});
