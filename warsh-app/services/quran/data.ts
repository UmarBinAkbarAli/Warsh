// Bundled Quran data for the reader (Pen section 27), built by
// scripts/build-quran-data.mjs from the King Fahd Complex 15-line Madani
// layout. Everything is on the device, so reading needs no network.

import chaptersJson from "../../data/quran/chapters.json";
import juzJson from "../../data/quran/juz.json";

export const PAGE_COUNT = 604;
export const LINES_PER_PAGE = 15;
// Minimum gap between words in em. Must match WORD_GAP_EM in the build
// script, which measures each page's widest line with this gap included.
export const WORD_GAP_EM = 0.25;

export type TajweedCode =
  | "h" | "l" | "s" | "w" | "j" | "k" // silent / merged
  | "g" | "d" | "i" | "f" | "a" | "b" // nasal
  | "q" // qalqalah
  | "m" | "p" | "u" | "o" | "n"; // madd

export type Segment = [string] | [string, TajweedCode];
/**
 * A word split into tajweed segments that draws wider in colour than it
 * measures plain, however the colours are split; x is the extra width in em
 * the reader leaves it when tajweed is on.
 */
export type WideTajweedWord = { s: Segment[]; x: number };
/** A plain word, a word split into tajweed segments, or an ayah number. */
export type QuranWord = string | Segment[] | WideTajweedWord | number;
export type QuranLine =
  | { h: number } // surah header
  | { b: 1 } // basmala
  | { w: QuranWord[]; c?: 1 }; // text; c = centred instead of justified

export type QuranPage = {
  /** Juz and hizb of the first ayah on the page. */
  j: number;
  z: number;
  /** Surah of the first ayah on the page. */
  s: number;
  /** Width of the page's widest line in em, gaps included. */
  m: number;
  /** The same with tajweed colours on. */
  t: number;
  l: QuranLine[];
};

export type Chapter = {
  n: number;
  en: string;
  ar: string;
  meaning: string;
  place: "meccan" | "medinan";
  ayat: number;
  page: number;
};

export const chapters = chaptersJson as Chapter[];

let pages: QuranPage[] | null = null;

/** Pages load on first use (≈2.5 MB), not at app start. */
export function getPages(): QuranPage[] {
  if (!pages) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    pages = require("../../data/quran/pages.json") as QuranPage[];
  }
  return pages;
}

export function getPage(pageNumber: number): QuranPage {
  return getPages()[clampPage(pageNumber) - 1];
}

export function clampPage(pageNumber: number) {
  if (!Number.isFinite(pageNumber)) return 1;
  return Math.min(PAGE_COUNT, Math.max(1, Math.round(pageNumber)));
}

export function getChapter(surah: number): Chapter {
  return chapters[Math.min(114, Math.max(1, surah)) - 1];
}

export type JuzStart = { juz: number; page: number; surah: number };

/** The page holding each juz's first ayah, as the printed index lists it. */
export const juzStarts = juzJson as JuzStart[];

// These two answer from the small indexes, so the Learn card can name the
// last page read without loading the page data.

/** The juz a page belongs to, as its running header shows it. */
export function juzForPage(pageNumber: number) {
  let juz = 1;
  for (const start of juzStarts) if (start.page <= pageNumber) juz = start.juz;
  return juz;
}

/** The last surah whose first ayah is on or before this page. */
export function surahForPage(pageNumber: number): Chapter {
  let chapter = chapters[0];
  for (const candidate of chapters) if (candidate.page <= pageNumber) chapter = candidate;
  return chapter;
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toArabicDigits(value: number) {
  return String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

/** Ayah-end ornament: U+06DD encloses the digits that follow it. */
export function ayahMarker(ayah: number) {
  return `۝${toArabicDigits(ayah)}`;
}

/** Tajweed segments of a word, or null for a plain word or ayah number. */
export function segmentsOf(word: QuranWord): Segment[] | null {
  if (typeof word === "number" || typeof word === "string") return null;
  return Array.isArray(word) ? word : word.s;
}

/** Extra width in em a coloured word needs when tajweed is on. */
export function tajweedExtraEm(word: QuranWord) {
  return typeof word === "object" && !Array.isArray(word) ? word.x : 0;
}

export function wordText(word: QuranWord) {
  if (typeof word === "number") return ayahMarker(word);
  if (typeof word === "string") return word;
  return (segmentsOf(word) ?? []).map((segment) => segment[0]).join("");
}

export const BASMALA = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";
