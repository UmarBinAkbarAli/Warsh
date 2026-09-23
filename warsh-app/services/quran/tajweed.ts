// Tajweed rules behind the colour codes in the bundled page data. The
// markup itself comes from Quran.com's verified tajweed text; this file only
// decides how each rule looks and how it is explained to the learner.

import { TajweedPalette } from "../../constants/theme";
import { segmentsOf, type QuranWord, type TajweedCode } from "./data";

export type TajweedGroup = "nasal" | "qalqalah" | "madd" | "silent";

export type TajweedRule = {
  group: TajweedGroup;
  /** null = not coloured on the page (natural madd is everywhere). */
  color: string | null;
  nameAr: string;
  nameKey: string;
  bodyKey: string;
};

const rule = (group: TajweedGroup, color: string | null, nameAr: string, key: string): TajweedRule => ({
  group,
  color,
  nameAr,
  nameKey: `quran.rule.${key}`,
  bodyKey: `quran.rule.${key}Body`,
});

export const TAJWEED_RULES: Record<TajweedCode, TajweedRule> = {
  g: rule("nasal", TajweedPalette.nasal, "غُنَّة", "ghunnah"),
  i: rule("nasal", TajweedPalette.nasal, "إِخْفَاء", "ikhfa"),
  f: rule("nasal", TajweedPalette.nasal, "إِخْفَاء شَفَوِي", "ikhfaShafawi"),
  d: rule("nasal", TajweedPalette.nasal, "إِدْغَام بِغُنَّة", "idghamGhunnah"),
  a: rule("nasal", TajweedPalette.nasal, "إِدْغَام شَفَوِي", "idghamShafawi"),
  b: rule("nasal", TajweedPalette.nasal, "إِقْلَاب", "iqlab"),
  q: rule("qalqalah", TajweedPalette.qalqalah, "قَلْقَلَة", "qalqalah"),
  n: rule("madd", TajweedPalette.maddNecessary, "مَدّ لَازِم", "maddLazim"),
  o: rule("madd", TajweedPalette.maddObligatory, "مَدّ مُتَّصِل", "maddMuttasil"),
  u: rule("madd", TajweedPalette.maddSeparated, "مَدّ مُنْفَصِل", "maddMunfasil"),
  p: rule("madd", TajweedPalette.maddPermissible, "مَدّ عَارِض لِلسُّكُون", "maddArid"),
  m: rule("madd", null, "مَدّ طَبِيعِي", "maddTabii"),
  h: rule("silent", TajweedPalette.silent, "هَمْزَةُ الْوَصْل", "hamzatWasl"),
  l: rule("silent", TajweedPalette.silent, "لَام شَمْسِيَّة", "lamShamsiyyah"),
  s: rule("silent", TajweedPalette.silent, "حَرْف سَاكِت", "silentLetter"),
  w: rule("silent", TajweedPalette.silent, "إِدْغَام بِلَا غُنَّة", "idghamNoGhunnah"),
  j: rule("silent", TajweedPalette.silent, "إِدْغَام مُتَجَانِسَيْن", "idghamMutajanisayn"),
  k: rule("silent", TajweedPalette.silent, "إِدْغَام مُتَقَارِبَيْن", "idghamMutaqaribayn"),
};

/** Legend chips, in the order the design shows them. */
export const TAJWEED_LEGEND: { group: TajweedGroup; color: string; labelKey: string }[] = [
  { group: "nasal", color: TajweedPalette.nasal, labelKey: "quran.legend.nasal" },
  { group: "qalqalah", color: TajweedPalette.qalqalah, labelKey: "quran.legend.qalqalah" },
  { group: "madd", color: TajweedPalette.maddSeparated, labelKey: "quran.legend.madd" },
  { group: "silent", color: TajweedPalette.silent, labelKey: "quran.legend.silent" },
];

/** The coloured rules in a word, in reading order, without repeats. */
export function rulesInWord(word: QuranWord): TajweedCode[] {
  const codes: TajweedCode[] = [];
  for (const segment of segmentsOf(word) ?? []) {
    const code = segment[1];
    if (code && TAJWEED_RULES[code].color && !codes.includes(code)) codes.push(code);
  }
  return codes;
}
