import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ArabicText } from "@components/ArabicText";
import { getApiErrorMessage, getCore500Words } from "@services/api";
import { useTranslationLanguage } from "@services/language";
import { useT } from "@i18n/index";
import {
  Fonts,
  FontSizes,
  LineHeights,
  Radii,
  Spacing,
  WarshPalette,
} from "../../../constants/theme";

interface CoreWord {
  id: string;
  arabic: string;
  transliteration: string;
  translationEn: string;
  translationUr: string;
  frequencyInQuran: number | null;
  quranicRank: number | null;
  known: boolean;
  learnedAt: string | null;
}

type Filter = "known" | "all";

export default function Core500WordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktopWeb = Platform.OS === "web" && width >= 960;
  const t = useT();
  const language = useTranslationLanguage();

  const [words, setWords] = useState<CoreWord[]>([]);
  const [knownCount, setKnownCount] = useState(0);
  const [filter, setFilter] = useState<Filter>("known");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextFilter: Filter) => {
      setLoading(true);
      try {
        setError(null);
        const response = await getCore500Words(nextFilter);
        setWords(response.data.data.words);
        setKnownCount(response.data.data.knownCount);
      } catch (err) {
        setError(getApiErrorMessage(err, t("core500.loadFailed")));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return words;
    return words.filter(
      (w) =>
        w.arabic.includes(query) ||
        w.transliteration.toLowerCase().includes(query) ||
        w.translationEn.toLowerCase().includes(query) ||
        w.translationUr.includes(query),
    );
  }, [search, words]);

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
        <Text style={styles.headerTitle}>{t("core500.wordsYouKnow")}</Text>
      </View>

      <View style={styles.controls}>
        <TextInput
          mode="outlined"
          dense
          value={search}
          onChangeText={setSearch}
          placeholder={t("core500.searchWords", { count: knownCount })}
          left={<TextInput.Icon icon="magnify" />}
          outlineColor={WarshPalette.sageSoft}
          activeOutlineColor={WarshPalette.gold}
          style={styles.search}
        />

        <View style={styles.chipRow}>
          {(["known", "all"] as Filter[]).map((key) => {
            const selected = filter === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setFilter(key)}
                activeOpacity={0.75}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {key === "known"
                    ? t("core500.filterAll", { count: knownCount })
                    : t("core500.filterRecent")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={WarshPalette.gold} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t("core500.noWordsYet")}</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + Spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push(`/(app)/vocabulary/word/${item.id}`)}
              style={[styles.row, !item.known && styles.rowUnknown]}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{item.quranicRank}</Text>
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowMeaning}>
                  {language === "ur" ? item.translationUr : item.translationEn}
                </Text>
                <Text style={styles.rowSub}>
                  {item.transliteration}
                  {item.frequencyInQuran !== null
                    ? `  ·  ${t("core500.inQuran", { count: item.frequencyInQuran })}`
                    : ""}
                </Text>
              </View>
              <ArabicText size="md" style={styles.rowArabic}>
                {item.arabic}
              </ArabicText>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WarshPalette.creamBg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.gutter },
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
  controls: { paddingHorizontal: Spacing.gutter, gap: Spacing.md },
  search: { backgroundColor: WarshPalette.white },
  chipRow: { flexDirection: "row", gap: Spacing.sm },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.parchmentBg,
  },
  chipSelected: { backgroundColor: WarshPalette.navy },
  chipText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.caption,
    color: WarshPalette.bodyBrown,
  },
  chipTextSelected: { color: WarshPalette.parchment },

  list: { paddingHorizontal: Spacing.gutter, paddingTop: Spacing.lg, gap: Spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: WarshPalette.parchmentBg,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  rowUnknown: { opacity: 0.55 },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: Radii.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.cream,
  },
  rankText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.label,
    color: WarshPalette.goldDeep,
  },
  rowCopy: { flex: 1, gap: 2 },
  rowMeaning: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
  },
  rowSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    color: WarshPalette.subtleBrown,
  },
  rowArabic: { color: WarshPalette.ink },

  errorText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.wrongText,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.subtleBrown,
    textAlign: "center",
  },
});
