import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useT } from "@i18n/index";
import { useQuranStore } from "@stores/quranStore";
import { Colors, Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { hasTajweed, isIndoPak, segmentsOf, wordText, type MushafLayout, type QuranWord } from "../../services/quran/data";
import { TAJWEED_LEGEND, TAJWEED_RULES, rulesInWord } from "../../services/quran/tajweed";
import { TRANSLATIONS, type QuranTranslation } from "../../services/quran/translations";
import { INDOPAK_FONT, QURAN_FONT } from "./MushafPage";

function BottomSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.handle} />
        {children}
      </View>
    </Modal>
  );
}

// Built layouts are selectable; the rest are listed as coming soon.
const LAYOUTS: { key: string; titleKey: string; subKey: string; layout?: MushafLayout }[] = [
  { key: "indopak15", titleKey: "quran.layout.indopak15", subKey: "quran.layout.indopak15Sub", layout: "indopak15" },
  { key: "madani15", titleKey: "quran.layout.madani15", subKey: "quran.layout.madani15Sub", layout: "madani15" },
  { key: "indopak16", titleKey: "quran.layout.indopak16", subKey: "quran.layout.indopak16Sub", layout: "indopak16" },
  { key: "indopak13", titleKey: "quran.layout.indopak13", subKey: "quran.layout.indopak13Sub" },
];

export function QuranSettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useT();
  const current = useQuranStore((s) => s.layout);
  const setLayout = useQuranStore((s) => s.setLayout);
  const tajweed = useQuranStore((s) => s.tajweed);
  const keepAwake = useQuranStore((s) => s.keepAwake);
  const tajweedAvailable = hasTajweed(current);
  const setTajweed = useQuranStore((s) => s.setTajweed);
  const setKeepAwake = useQuranStore((s) => s.setKeepAwake);
  const translation = useQuranStore((s) => s.translation);
  const setTranslation = useQuranStore((s) => s.setTranslation);
  const translationOptions: { key: QuranTranslation | null; titleKey: string; subKey: string }[] = [
    { key: null, titleKey: "quran.translation.off", subKey: "quran.translation.offSub" },
    ...TRANSLATIONS,
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.headRow}>
        <Text style={styles.title}>{t("quran.settings.title")}</Text>
        <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("common.close")}>
          <Ionicons name="close" size={22} color={WarshPalette.subtleBrown} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
        <Text style={styles.label}>{t("quran.settings.layout")}</Text>
        {LAYOUTS.map(({ key, titleKey, subKey, layout }) => {
          const selected = layout === current;
          return (
            <Pressable
              key={key}
              onPress={layout ? () => setLayout(layout) : undefined}
              disabled={!layout}
              style={[styles.option, selected && styles.optionSelected, !layout && styles.optionDisabled]}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: !layout }}
            >
              <View style={[styles.radio, selected && styles.radioOn]} />
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{t(titleKey)}</Text>
                <Text style={styles.optionSub}>{t(subKey)}</Text>
              </View>
              {!layout ? (
                <View style={styles.soonPill}>
                  <Text style={styles.soonText}>{t("quran.settings.comingSoon")}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}

        <Text style={[styles.label, styles.labelSpaced]}>{t("quran.settings.translation")}</Text>
        {translationOptions.map(({ key, titleKey, subKey }) => {
          const selected = key === translation;
          return (
            <Pressable
              key={key ?? "off"}
              onPress={() => setTranslation(key)}
              style={[styles.option, selected && styles.optionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={[styles.radio, selected && styles.radioOn]} />
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{t(titleKey)}</Text>
                <Text style={styles.optionSub}>{t(subKey)}</Text>
              </View>
            </Pressable>
          );
        })}

        <Text style={[styles.label, styles.labelSpaced]}>{t("quran.settings.whileReading")}</Text>
        <View style={styles.toggleCard}>
          <ToggleRow
            title={t("quran.settings.tajweed")}
            subtitle={t(tajweedAvailable ? "quran.settings.tajweedSub" : "quran.settings.tajweedMadaniOnly")}
            value={tajweed && tajweedAvailable}
            onChange={setTajweed}
            disabled={!tajweedAvailable}
          />
          <View style={styles.divider} />
          <ToggleRow
            title={t("quran.settings.keepAwake")}
            subtitle={t("quran.settings.keepAwakeSub")}
            value={keepAwake}
            onChange={setKeepAwake}
          />
        </View>

        <Text style={styles.footnote}>{t("quran.settings.footnote")}</Text>
        <Text style={styles.footnote}>{t("quran.settings.sources")}</Text>
      </ScrollView>
    </BottomSheet>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onChange,
  disabled = false,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: WarshPalette.cream, true: WarshPalette.navy }}
        thumbColor={WarshPalette.white}
        accessibilityLabel={title}
      />
    </View>
  );
}

/** Explains the tajweed rules in a tapped word (Pen 27, screen 4). */
export function TajweedRuleSheet({
  word,
  layout,
  onClose,
}: {
  word: QuranWord | null;
  layout: MushafLayout;
  onClose: () => void;
}) {
  const t = useT();
  const codes = word ? rulesInWord(word) : [];
  const segments = word ? segmentsOf(word) : null;

  return (
    <BottomSheet visible={word !== null} onClose={onClose}>
      {word ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
          <View style={styles.wordRow}>
            <Text style={[styles.wordArabic, isIndoPak(layout) && styles.wordIndoPak]}>
              {segments
                ? segments.map(([text, code], index) => (
                    <Text key={index} style={code && TAJWEED_RULES[code].color ? { color: TAJWEED_RULES[code].color } : null}>
                      {text}
                    </Text>
                  ))
                : wordText(word)}
            </Text>
          </View>
          {codes.map((code) => {
            const rule = TAJWEED_RULES[code];
            return (
              <View key={code} style={styles.ruleBlock}>
                <View style={styles.headRow}>
                  <View style={styles.ruleNameRow}>
                    <View style={[styles.ruleDot, { backgroundColor: rule.color ?? WarshPalette.ink }]} />
                    <Text style={styles.ruleName}>{t(rule.nameKey)}</Text>
                  </View>
                  <Text style={[styles.ruleArabic, { color: rule.color ?? WarshPalette.ink }]}>{rule.nameAr}</Text>
                </View>
                <Text style={styles.ruleBody}>{t(rule.bodyKey)}</Text>
              </View>
            );
          })}
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}

export function TajweedLegend() {
  const t = useT();
  return (
    <View style={styles.legend}>
      {TAJWEED_LEGEND.map((item) => (
        <View key={item.group} style={styles.legendChip}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{t(item.labelKey)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    maxHeight: "85%",
    backgroundColor: Colors.bg.primary,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.cream,
    marginBottom: Spacing.lg,
  },
  sheetBody: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.displayL,
    lineHeight: LineHeights.displayL,
    color: WarshPalette.navy,
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    letterSpacing: 1,
    color: WarshPalette.goldDeep,
  },
  labelSpaced: {
    marginTop: Spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
  },
  optionSelected: {
    backgroundColor: WarshPalette.white,
    borderColor: WarshPalette.gold,
    borderWidth: 1.5,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: WarshPalette.disabledText,
  },
  radioOn: {
    borderWidth: 6,
    borderColor: WarshPalette.navy,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM,
    color: WarshPalette.ink,
  },
  optionSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.subtleBrown,
  },
  soonPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.parchmentDeep,
  },
  soonText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    color: WarshPalette.goldDeep,
  },
  toggleCard: {
    backgroundColor: WarshPalette.white,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: WarshPalette.cream,
    marginHorizontal: Spacing.lg,
  },
  footnote: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.subtleBrown,
    marginTop: Spacing.sm,
  },
  wordRow: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    backgroundColor: WarshPalette.white,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
  },
  wordIndoPak: {
    fontFamily: INDOPAK_FONT,
  },
  wordArabic: {
    fontFamily: QURAN_FONT,
    fontSize: 34,
    lineHeight: 64,
    color: WarshPalette.ink,
  },
  ruleBlock: {
    gap: Spacing.xs,
    paddingTop: Spacing.md,
  },
  ruleNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexShrink: 1,
  },
  ruleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ruleName: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.displayL,
    lineHeight: LineHeights.displayL,
    color: WarshPalette.navy,
    flexShrink: 1,
  },
  ruleArabic: {
    fontFamily: QURAN_FONT,
    fontSize: 22,
    lineHeight: 40,
  },
  ruleBody: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.bodyM,
    lineHeight: LineHeights.bodyM + 2,
    color: WarshPalette.bodyBrown,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs + 2,
  },
  legendChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radii.full,
    backgroundColor: WarshPalette.white,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    color: WarshPalette.deep,
  },
});
