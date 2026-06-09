import { useState, useEffect, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@services/api";
import { useLanguage, pickTranslation } from "@services/language";
import { useT } from "@i18n/index";
import {
  WarshPalette,
  Fonts,
  FontSizes,
  LineHeights,
  Spacing,
  Radii,
} from "../../../constants/theme";

const RECENT_KEY = "warsh_vocab_searches";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 350;

interface SearchWord {
  id: string;
  arabic: string;
  arabicPlain: string;
  transliteration: string;
  translationEn: string;
  translationUr: string;
  wordType: string;
}

export default function VocabularySearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useLanguage();
  const t = useT();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchWord[]>([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, MAX_RECENT));
        }
      })
      .catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(
          `/api/vocabulary/words?search=${encodeURIComponent(query)}`
        );
        setResults(res.data.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const saveRecentSearch = useCallback(
    async (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      const updated = [
        trimmed,
        ...recentSearches.filter((r) => r !== trimmed),
      ].slice(0, MAX_RECENT);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recentSearches]
  );

  const handleWordPress = useCallback(
    async (word: SearchWord) => {
      await saveRecentSearch(query);
      router.push(`/(app)/vocabulary/word/${word.id}`);
    },
    [query, router, saveRecentSearch]
  );

  const handleRecentPress = (term: string) => {
    setQuery(term);
  };

  const renderWord = ({ item }: { item: SearchWord }) => (
    <TouchableOpacity
      onPress={() => handleWordPress(item)}
      activeOpacity={0.75}
    >
      <View style={styles.wordCard}>
        <View style={styles.wordRow}>
          <View style={styles.wordLeft}>
            <Text style={styles.arabic}>{item.arabic}</Text>
            <Text style={styles.translit}>{item.transliteration}</Text>
            <Text style={styles.translation}>{pickTranslation(item, language)}</Text>
          </View>
          <Ionicons
            name="volume-medium-outline"
            size={18}
            color={WarshPalette.gold}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const showRecent = query.length < 2 && recentSearches.length > 0;
  const showResults = query.length >= 2;
  const showEmpty =
    showResults && !searching && results.length === 0;

  return (
    <View style={styles.container}>
      {/* Header with search input */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.sm },
        ]}
      >
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder={t("vocabulary.searchPlaceholder")}
          placeholderTextColor={WarshPalette.subtleBrown}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75}>
          <Text style={styles.cancelBtn}>{t("vocabulary.searchCancel")}</Text>
        </TouchableOpacity>
      </View>

      {/* Recent searches */}
      {showRecent && (
        <View>
          <Text style={styles.recentTitle}>{t("vocabulary.searchRecent")}</Text>
          {recentSearches.map((term) => (
            <TouchableOpacity
              key={term}
              onPress={() => handleRecentPress(term)}
              activeOpacity={0.75}
              style={styles.recentRow}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={WarshPalette.subtleBrown}
              />
              <Text style={styles.recentText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Loading indicator */}
      {searching && (
        <ActivityIndicator
          color={WarshPalette.gold}
          style={{ marginTop: Spacing.xl }}
        />
      )}

      {/* Empty state */}
      {showEmpty && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t("vocabulary.searchNoMatch")}</Text>
        </View>
      )}

      {/* Results */}
      {showResults && !searching && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderWord}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WarshPalette.creamBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: WarshPalette.parchmentBg,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.ink,
  },
  cancelBtn: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.gold,
  },
  recentTitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  recentText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  wordCard: {
    backgroundColor: WarshPalette.parchmentBg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 0.5,
    borderColor: WarshPalette.defaultCardBorder,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  wordLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  arabic: {
    fontFamily: Fonts.arabic,
    fontSize: FontSizes.arabicM,
    color: WarshPalette.ink,
    textAlign: "right",
    writingDirection: "rtl",
  },
  translit: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.caption,
    color: WarshPalette.subtleBrown,
    marginTop: 2,
  },
  translation: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontFamily: Fonts.italic,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.bodyBrown,
    textAlign: "center",
  },
});
