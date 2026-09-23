import { memo } from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";

import { Fonts, MushafPalette, TajweedPalette, WarshPalette } from "../../constants/theme";
import {
  BASMALA,
  LINES_PER_PAGE,
  WORD_GAP_EM,
  ayahMarker,
  getChapter,
  getPage,
  hasTajweed,
  segmentsOf,
  tajweedExtraEm,
  juzForPage,
  toArabicDigits,
  toUrduDigits,
  wordText,
  type MushafLayout,
  type QuranLine,
  type QuranWord,
  type Segment,
} from "../../services/quran/data";
import { TAJWEED_RULES, rulesInWord } from "../../services/quran/tajweed";

export const QURAN_FONT = "Amiri Quran";
/** The Indo-Pak Mushaf's own font; its ayah-end signs are private-use glyphs. */
export const INDOPAK_FONT = "IndoPak Nastaleeq";

const PAGE_FONT: Record<MushafLayout, string> = { madani15: QURAN_FONT, indopak15: INDOPAK_FONT };
// The running header and page number follow each print: "الجزء ٣٠" on
// Madani pages, "پارہ ۲۹" on Indo-Pak ones. The Indo-Pak font leaves پ and
// the Arabic digits blank, so its header is set in Scheherazade New.
const RUNNING = {
  madani15: { font: QURAN_FONT, juz: "الجزء", surah: "سورة", digits: toArabicDigits },
  indopak15: { font: Fonts.arabic, juz: "پارہ", surah: "سورۃ", digits: toUrduDigits },
} satisfies Record<MushafLayout, { font: string | undefined; juz: string; surah: string; digits: (n: number) => string }>;

// Page chrome, in px: frame padding plus the running header and page-number
// rows. The rest of the height is split evenly across the 15 lines.
const FRAME_PADDING_X = 12;
const FRAME_PADDING_Y = 8;
const HEADER_HEIGHT = 30;
const FOOTER_HEIGHT = 24;
// The marks reach well above and below the letters; below this ratio of
// line height the harakat of neighbouring lines collide.
const MAX_FONT_TO_LINE: Record<MushafLayout, number> = { madani15: 0.56, indopak15: 0.6 };
// Room for the few-percent difference between the build-time HarfBuzz
// measurement and the platform's own text layout.
const WIDTH_SAFETY = 0.96;
// How far past its box (on the left) a coloured word may draw before
// Android wraps it; see TajweedWord.
const COLOURED_WORD_SLACK = 80;

type MushafPageProps = {
  layout: MushafLayout;
  pageNumber: number;
  width: number;
  height: number;
  tajweed: boolean;
  /** Highlighted word, as "line:index". */
  selectedWord?: string | null;
  onWordPress?: (word: QuranWord, key: string) => void;
};

/**
 * One page of a 15-line Mushaf, Indo-Pak or Madani. Line breaks come from
 * the printed layout, so every line holds exactly the words of the print.
 * The font is sized so the page's widest line fits the width, then each line
 * is justified by spreading its words, as the print does.
 */
export const MushafPage = memo(function MushafPage({
  layout,
  pageNumber,
  width,
  height,
  tajweed,
  selectedWord,
  onWordPress,
}: MushafPageProps) {
  const page = getPage(layout, pageNumber);
  const coloured = tajweed && hasTajweed(layout);
  const innerWidth = width - FRAME_PADDING_X * 2 - 2;
  const lineHeight = Math.floor((height - FRAME_PADDING_Y * 2 - HEADER_HEIGHT - FOOTER_HEIGHT - 2) / LINES_PER_PAGE);
  const fontSize = Math.max(
    10,
    Math.floor(
      Math.min(lineHeight * MAX_FONT_TO_LINE[layout], (innerWidth * WIDTH_SAFETY) / (coloured ? (page.t ?? page.m) : page.m)),
    ),
  );
  const openingPage = pageNumber <= 2;
  const firstSurah = getChapter(page.s);
  const running = RUNNING[layout];
  const runningText = [styles.runningText, { fontFamily: running.font }];

  return (
    <View style={[styles.frame, { width, height }]}>
      <View style={[styles.runningHeader, { height: HEADER_HEIGHT }]}>
        <Text style={runningText}>{`${running.juz} ${running.digits(juzForPage(layout, pageNumber))}`}</Text>
        <Text style={runningText}>{`${running.surah} ${firstSurah.ar}`}</Text>
      </View>

      <View style={[styles.lines, openingPage && styles.linesCentered]}>
        {page.l.map((line, index) => (
          <MushafLine
            key={index}
            line={line}
            layout={layout}
            lineIndex={index}
            height={lineHeight}
            fontSize={fontSize}
            tajweed={coloured}
            selectedWord={selectedWord}
            onWordPress={onWordPress}
          />
        ))}
      </View>

      <View style={[styles.footer, { height: FOOTER_HEIGHT }]}>
        <Text style={runningText}>{running.digits(pageNumber)}</Text>
      </View>
    </View>
  );
});

type MushafLineProps = {
  line: QuranLine;
  layout: MushafLayout;
  lineIndex: number;
  height: number;
  fontSize: number;
  tajweed: boolean;
  selectedWord?: string | null;
  onWordPress?: (word: QuranWord, key: string) => void;
};

function MushafLine({ line, layout, lineIndex, height, fontSize, tajweed, selectedWord, onWordPress }: MushafLineProps) {
  const textStyle = [styles.quranText, { fontFamily: PAGE_FONT[layout], fontSize, lineHeight: height }];

  if ("h" in line) {
    return (
      <View style={[styles.line, styles.lineCentered, { height }]}>
        <View style={[styles.surahFrame, { height: height - 6, borderRadius: (height - 6) / 2 }]}>
          <Text style={[textStyle, styles.surahName, { fontSize: fontSize * 0.9, lineHeight: height - 6 }]}>
            {`سُورَةُ ${getChapter(line.h).ar}`}
          </Text>
        </View>
      </View>
    );
  }

  if ("b" in line) {
    return (
      <View style={[styles.line, styles.lineCentered, { height }]}>
        <Text style={textStyle}>{BASMALA[layout]}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.line,
        { height },
        // The same gap the page was measured with, so a centred line fits too.
        line.c ? [styles.lineCentered, { gap: fontSize * WORD_GAP_EM }] : styles.lineJustified,
      ]}
    >
      {line.w.map((word, index) => {
        const key = `${lineIndex}:${index}`;
        if (typeof word === "number") {
          return (
            <Text key={key} style={[textStyle, styles.ayahMarker]}>
              {ayahMarker(word)}
            </Text>
          );
        }
        const segments = tajweed ? segmentsOf(word) : null;
        if (!segments) {
          return (
            <Text key={key} style={textStyle}>
              {wordText(word)}
            </Text>
          );
        }
        return (
          <TajweedWord
            key={key}
            segments={segments}
            plain={wordText(word)}
            extraWidth={tajweedExtraEm(word) * fontSize}
            textStyle={textStyle}
            selected={selectedWord === key}
            onPress={onWordPress && rulesInWord(word).length > 0 ? () => onWordPress(word, key) : undefined}
          />
        );
      })}
    </View>
  );
}

type TajweedWordProps = {
  segments: Segment[];
  plain: string;
  extraWidth: number;
  textStyle: StyleProp<TextStyle>;
  selected: boolean;
  onPress?: () => void;
};

/**
 * A word drawn in tajweed colours. Android draws each colour run on its
 * own, so the font's cursive joins and ligatures stop at a colour change
 * and the word can draw wider than it measures — and Android clips it to
 * the measured width. The plain word, invisible, sets the box; the coloured
 * word is drawn over it with room to spare on its left. The build moves
 * colour boundaries to where they cost no width, and records the extra room
 * (extraWidth) for the words where no such place exists.
 */
function TajweedWord({ segments, plain, extraWidth, textStyle, selected, onPress }: TajweedWordProps) {
  return (
    <View style={[{ marginLeft: extraWidth }, selected && styles.selectedWord]}>
      <Text style={[textStyle, styles.sizer]} accessibilityElementsHidden importantForAccessibility="no">
        {plain}
      </Text>
      <Text style={[textStyle, styles.colouredWord]} onPress={onPress} suppressHighlighting>
        {segments.map(([text, code], index) => {
          const color = code ? TAJWEED_RULES[code].color : null;
          return color ? (
            <Text key={index} style={{ color }}>
              {text}
            </Text>
          ) : (
            text
          );
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: MushafPalette.page,
    borderWidth: 1,
    borderColor: MushafPalette.frame,
    borderRadius: 6,
    paddingHorizontal: FRAME_PADDING_X,
    paddingVertical: FRAME_PADDING_Y,
  },
  runningHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: MushafPalette.hairline,
  },
  runningText: {
    fontFamily: QURAN_FONT,
    fontSize: 13,
    lineHeight: 26,
    includeFontPadding: false,
    color: WarshPalette.goldDeep,
  },
  lines: {
    flex: 1,
  },
  linesCentered: {
    justifyContent: "center",
  },
  line: {
    // Words are laid out right to left whatever the UI language is.
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  lineJustified: {
    justifyContent: "space-between",
  },
  lineCentered: {
    justifyContent: "center",
  },
  quranText: {
    fontFamily: QURAN_FONT,
    color: WarshPalette.ink,
    writingDirection: "rtl",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  sizer: {
    color: "transparent",
  },
  colouredWord: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: -COLOURED_WORD_SLACK,
    textAlign: "right",
  },
  ayahMarker: {
    color: MushafPalette.ayahMarker,
  },
  selectedWord: {
    backgroundColor: TajweedPalette.nasalTint,
    borderRadius: 6,
  },
  surahFrame: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WarshPalette.parchmentDeep,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
  },
  surahName: {
    color: WarshPalette.navy,
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
