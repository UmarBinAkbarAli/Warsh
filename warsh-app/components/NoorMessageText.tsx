import { Fragment } from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";

import { Fonts, WarshPalette } from "../constants/theme";

// Noor replies arrive as light markdown. Printing it raw showed **asterisks**,
// and Arabic examples inside English replies were body-size Latin text
// (UX evaluation 2026-09-24, finding H17). This renders the subset Noor
// uses — bold, bullet and numbered lines, headings — and, in English replies,
// sets every Arabic run in the Arabic face a step larger. Urdu replies are
// already in Arabic script, so only the markdown is handled there.

const ARABIC_RUN = /([؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+(?:[\s‌‏،.؟]+[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+)*)/;

type Props = {
  content: string;
  /** The reply language; Arabic runs are styled only inside Latin prose. */
  language: "en" | "ur";
  style?: TextStyle | TextStyle[];
  directionMark?: (text: string) => string;
};

function renderInline(text: string, highlightArabic: boolean, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean);
  return parts.map((part, index) => {
    const bold = /^(\*\*|__)/.test(part);
    const body = bold ? part.slice(2, -2) : part.replace(/(^|\s)\*([^*\s][^*]*)\*(?=\s|$)/g, "$1$2");
    const segments = highlightArabic ? body.split(ARABIC_RUN).filter((segment) => segment !== "") : [body];
    return (
      <Text key={`${keyPrefix}-${index}`} style={bold ? styles.bold : undefined}>
        {segments.map((segment, segmentIndex) =>
          highlightArabic && ARABIC_RUN.test(segment) ? (
            <Text key={segmentIndex} style={styles.arabic}>{segment}</Text>
          ) : (
            <Fragment key={segmentIndex}>{segment}</Fragment>
          ),
        )}
      </Text>
    );
  });
}

export function NoorMessageText({ content, language, style, directionMark }: Props) {
  const highlightArabic = language === "en";
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  return (
    <Text style={style}>
      {lines.map((rawLine, index) => {
        let line = rawLine;
        let lineStyle: TextStyle | undefined;
        const heading = /^#{1,6}\s+(.*)$/.exec(line);
        if (heading) {
          line = heading[1];
          lineStyle = styles.bold;
        }
        const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
        if (bullet) line = `•  ${bullet[1]}`;
        const text = directionMark ? directionMark(line) : line;
        return (
          <Text key={index} style={lineStyle}>
            {renderInline(text, highlightArabic, String(index))}
            {index < lines.length - 1 ? "\n" : null}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: Fonts.bold },
  arabic: { fontFamily: Fonts.arabic, fontSize: 20, color: WarshPalette.ink },
});
