import { Ionicons } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useT } from "@i18n/index";
import { useQuranStore } from "@stores/quranStore";
import { Colors, Fonts, FontSizes, LineHeights, Radii, Spacing, WarshPalette } from "../../constants/theme";
import { hasTajweed, isIndoPak, segmentsOf, wordText, type MushafLayout, type QuranWord } from "../../services/quran/data";
import { TAJWEED_LEGEND, TAJWEED_RULES, rulesInWord } from "../../services/quran/tajweed";
import { QURAN_TRANSLATION_ENABLED, TRANSLATIONS, type QuranTranslation } from "../../services/quran/translations";
import { INDOPAK_FONT, QURAN_FONT } from "./MushafPage";

function BottomSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* The backdrop holds the sheet at the bottom and the cap is in pixels:
          with a flex: 1 scrim above a percentage maxHeight, the Android Quran
          tab dimmed the screen and showed no sheet. */}
      <View style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityRole="button" />
        {/* Gesture-nav insets can read 0 inside a translucent modal on some
            Android builds, which left the last option under the home indicator
            (finding M14); keep at least a gesture bar's worth of room. */}
        <View
          style={[
            styles.sheet,
            { maxHeight: Math.round(height * 0.85), paddingBottom: Math.max(insets.bottom, 24) + Spacing.xl },
          ]}
        >
          <View style={styles.handle} />
          {children}
        </View>
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
  const [aboutOpen, setAboutOpen] = useState(false);
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

      <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
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

        {/* The translation picker returns once translations ship; until then
            the sheet does not list options nobody can choose. */}
        {QURAN_TRANSLATION_ENABLED ? (
          <Text style={[styles.label, styles.labelSpaced]}>{t("quran.settings.translation")}</Text>
        ) : null}
        {QURAN_TRANSLATION_ENABLED && translationOptions.map(({ key, titleKey, subKey }) => {
          const soon = !QURAN_TRANSLATION_ENABLED && key !== null;
          const selected = QURAN_TRANSLATION_ENABLED ? key === translation : key === null;
          return (
            <Pressable
              key={key ?? "off"}
              onPress={soon ? undefined : () => setTranslation(key)}
              disabled={soon}
              style={[styles.option, selected && styles.optionSelected, soon && styles.optionDisabled]}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: soon }}
            >
              <View style={[styles.radio, selected && styles.radioOn]} />
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{t(titleKey)}</Text>
                <Text style={styles.optionSub}>{t(subKey)}</Text>
              </View>
              {soon ? (
                <View style={styles.soonPill}>
                  <Text style={styles.soonText}>{t("quran.settings.comingSoon")}</Text>
                </View>
              ) : null}
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
          {tajweed && tajweedAvailable ? (
            <View style={styles.inlineLegend} accessibilityLabel={t("quran.settings.legendLabel")}>
              <TajweedLegend inline />
            </View>
          ) : null}
          <View style={styles.divider} />
          <ToggleRow
            title={t("quran.settings.keepAwake")}
            subtitle={t("quran.settings.keepAwakeSub")}
            value={keepAwake}
            onChange={setKeepAwake}
          />
        </View>

        <Text style={styles.footnote}>{t("quran.settings.footnote")}</Text>
        <Pressable
          onPress={() => setAboutOpen((open) => !open)}
          style={styles.aboutRow}
          accessibilityRole="button"
          accessibilityState={{ expanded: aboutOpen }}
        >
          <Text style={styles.aboutText}>{t("quran.settings.about")}</Text>
          <Ionicons name={aboutOpen ? "chevron-down" : "chevron-forward"} size={18} color={WarshPalette.navy} />
        </Pressable>
        {aboutOpen ? <Text style={styles.sources}>{t("quran.settings.sources")}</Text> : null}
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
        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
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
          <Text style={styles.footnote}>{t("quran.tajweedHint")}</Text>
          <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button">
            <Text style={styles.aboutText}>{t("common.close")}</Text>
          </Pressable>
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}

export function TajweedLegend({ inline = false }: { inline?: boolean } = {}) {
  const t = useT();
  return (
    <View style={styles.legend}>
      {TAJWEED_LEGEND.map((item) => (
        <View key={item.group} style={[styles.legendChip, inline && styles.legendChipInline]}>
          <View style={[styles.legendDot, inline && styles.legendDotInline, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{t(item.labelKey)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheet: {
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
    backgroundColor: WarshPalette.parchment,
    marginBottom: Spacing.md,
  },
  sheetScroll: {
    flexGrow: 0,
    flexShrink: 1,
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
    fontSize: FontSizes.displayXL,
    lineHeight: LineHeights.displayXL,
    color: WarshPalette.navy,
    marginBottom: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    letterSpacing: 1,
    color: WarshPalette.goldText,
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
    borderRadius: Radii.md,
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
    color: WarshPalette.goldText,
  },
  toggleCard: {
    backgroundColor: WarshPalette.white,
    borderRadius: Radii.md,
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
    fontSize: 13,
    lineHeight: 18,
    color: WarshPalette.subtleBrown,
    marginTop: Spacing.xs,
  },
  aboutRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  aboutText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    color: WarshPalette.navy,
  },
  sources: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: WarshPalette.subtleBrown,
  },
  inlineLegend: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 14,
  },
  wordRow: {
    alignItems: "center",
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  wordIndoPak: {
    fontFamily: INDOPAK_FONT,
  },
  wordArabic: {
    fontFamily: QURAN_FONT,
    fontSize: 48,
    lineHeight: 84,
    color: WarshPalette.ink,
  },
  ruleBlock: {
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: WarshPalette.cream,
    backgroundColor: WarshPalette.white,
  },
  closeButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: Fonts.bold,
    fontSize: 17,
    lineHeight: 22,
    color: WarshPalette.ink,
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
  legendChipInline: {
    paddingHorizontal: 10,
    borderWidth: 0,
    backgroundColor: WarshPalette.highlightBgSoft,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotInline: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.label,
    lineHeight: LineHeights.label,
    color: WarshPalette.deep,
  },
});
