// Bundled Quran data for the reader (Pen sections 27 and 28). Three layouts
// ship: the Indo-Pak 15-line Mushaf (Qudratullah print, the same pages as
// Taj Company), which Warsh opens by default, the Taj Company Indo-Pak
// 16-line Mushaf (both scripts/build-quran-indopak-data.mjs), and the King
// Fahd Complex 15-line Madani Mushaf with tajweed (scripts/build-quran-data.mjs). Everything is on the device, so reading
// needs no network.

import chaptersJson from "../../data/quran/chapters.json";
import indoPakIndexJson from "../../data/quran/indopak/index.json";
import indoPak16IndexJson from "../../data/quran/indopak16/index.json";
import juzJson from "../../data/quran/juz.json";
import madaniStartsJson from "../../data/quran/madani-starts.json";

export type MushafLayout = "indopak15" | "indopak16" | "madani15";
export const DEFAULT_LAYOUT: MushafLayout = "indopak15";
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
  | { h: number; b?: 1 } // surah header; b = the basmala sits inside it (16-line)
  | { b: 1 } // basmala
  | { w: QuranWord[]; c?: 1 }; // text; c = centred instead of justified

export type QuranPage = {
  /** Juz (parah) the page belongs to, and on Madani pages the hizb of its first ayah. */
  j: number;
  z?: number;
  /** Surah of the first ayah on the page. */
  s: number;
  /** Width of the page's widest line in em, gaps included. */
  m: number;
  /** The same with tajweed colours on (Madani only). */
  t?: number;
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

export type JuzStart = {
  juz: number;
  page: number;
  surah: number;
  /** Indo-Pak parahs only: the opening ayah and the name the parah is known by. */
  ayah?: number;
  en?: string;
  ar?: string;
};

type LayoutData = {
  pageCount: number;
  linesPerPage: number;
  tajweed: boolean;
  /** Per page, the ayah (surah * 1000 + ayah) that begins on it; x.5 when the page only continues ayah x. */
  starts: number[];
  surahPages: number[];
  juzStarts: JuzStart[];
  loadPages: () => QuranPage[];
};

type IndoPakIndex = { starts: number[]; surahPages: number[]; parahs: JuzStart[] };
const indoPakIndex = indoPakIndexJson as IndoPakIndex;
const indoPak16Index = indoPak16IndexJson as IndoPakIndex;

// Pages load on first use (≈1.6–2.5 MB each), not at app start.
const LAYOUTS: Record<MushafLayout, LayoutData> = {
  indopak15: {
    pageCount: 610,
    linesPerPage: 15,
    tajweed: false,
    starts: indoPakIndex.starts,
    surahPages: indoPakIndex.surahPages,
    juzStarts: indoPakIndex.parahs,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    loadPages: () => require("../../data/quran/indopak/pages.json") as QuranPage[],
  },
  indopak16: {
    pageCount: 548,
    linesPerPage: 16,
    tajweed: false,
    starts: indoPak16Index.starts,
    surahPages: indoPak16Index.surahPages,
    juzStarts: indoPak16Index.parahs,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    loadPages: () => require("../../data/quran/indopak16/pages.json") as QuranPage[],
  },
  madani15: {
    pageCount: 604,
    linesPerPage: 15,
    tajweed: true,
    starts: madaniStartsJson as number[],
    surahPages: chapters.map((chapter) => chapter.page),
    juzStarts: juzJson as JuzStart[],
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    loadPages: () => require("../../data/quran/pages.json") as QuranPage[],
  },
};

const loaded: Partial<Record<MushafLayout, QuranPage[]>> = {};

export function pageCount(layout: MushafLayout) {
  return LAYOUTS[layout].pageCount;
}

export function linesPerPage(layout: MushafLayout) {
  return LAYOUTS[layout].linesPerPage;
}

/** The Indo-Pak prints, which share a font, parah names and Urdu page numbers. */
export function isIndoPak(layout: MushafLayout) {
  return layout !== "madani15";
}

export function hasTajweed(layout: MushafLayout) {
  return LAYOUTS[layout].tajweed;
}

export function getPage(layout: MushafLayout, pageNumber: number): QuranPage {
  loaded[layout] ??= LAYOUTS[layout].loadPages();
  return loaded[layout][clampPage(layout, pageNumber) - 1];
}

export function clampPage(layout: MushafLayout, pageNumber: number) {
  if (!Number.isFinite(pageNumber)) return 1;
  return Math.min(pageCount(layout), Math.max(1, Math.round(pageNumber)));
}

export function getChapter(surah: number): Chapter {
  return chapters[Math.min(114, Math.max(1, surah)) - 1];
}

/** The page a surah opens on in this layout. */
export function surahPage(layout: MushafLayout, surah: number) {
  return LAYOUTS[layout].surahPages[getChapter(surah).n - 1];
}

/** The page holding each juz's (parah's) first ayah, as the printed index lists it. */
export function juzStarts(layout: MushafLayout): JuzStart[] {
  return LAYOUTS[layout].juzStarts;
}

// These answer from the small indexes, so the Learn card can name the last
// page read without loading the page data.

/** The juz a page belongs to, as its running header shows it. */
export function juzForPage(layout: MushafLayout, pageNumber: number) {
  let juz = 1;
  for (const start of juzStarts(layout)) if (start.page <= pageNumber) juz = start.juz;
  return juz;
}

/** The last surah that opens on or before this page. */
export function surahForPage(layout: MushafLayout, pageNumber: number): Chapter {
  const pages = LAYOUTS[layout].surahPages;
  let chapter = chapters[0];
  for (const candidate of chapters) if (pages[candidate.n - 1] <= pageNumber) chapter = candidate;
  return chapter;
}

// A place in the Quran is kept as an ayah (surah * 1000 + ayah), not a
// page, so it survives a change of layout.

/** The ayah a page is saved and bookmarked as: the first that begins on it. */
export function ayahForPage(layout: MushafLayout, pageNumber: number) {
  return Math.floor(LAYOUTS[layout].starts[clampPage(layout, pageNumber) - 1]);
}

/** The page an ayah begins on. */
export function pageForAyah(layout: MushafLayout, ayah: number) {
  const starts = LAYOUTS[layout].starts;
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (starts[mid] <= ayah) low = mid;
    else high = mid - 1;
  }
  return low + 1;
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toArabicDigits(value: number) {
  return String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

// The Urdu (Extended Arabic-Indic) digits Indo-Pak prints number pages with;
// the Indo-Pak font draws only these.
const URDU_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toUrduDigits(value: number) {
  return String(value).replace(/\d/g, (digit) => URDU_DIGITS[Number(digit)]);
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

export const BASMALA: Record<MushafLayout, string> = {
  madani15: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
  // Spelled as in the Indo-Pak text (1:1), which its font is built for.
  indopak15: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ",
  indopak16: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ",
};
