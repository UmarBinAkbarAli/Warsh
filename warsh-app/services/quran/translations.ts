// Translations shown under the Mushaf page (Pen section 30). Both are public
// domain and bundled (scripts/build-quran-translations.mjs); each loads on
// first use, so the reader pays nothing for them until one is turned on.

import { chapters, clampPage, type MushafLayout, pageCount, pageStart } from "./data";

export type QuranTranslation = "ur-junagarhi" | "en-pickthall";

export const TRANSLATIONS: {
  key: QuranTranslation;
  titleKey: string;
  subKey: string;
  rtl: boolean;
}[] = [
  { key: "ur-junagarhi", titleKey: "quran.translation.urdu", subKey: "quran.translation.urduSub", rtl: true },
  { key: "en-pickthall", titleKey: "quran.translation.english", subKey: "quran.translation.englishSub", rtl: false },
];

const LOADERS: Record<QuranTranslation, () => string[][]> = {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  "ur-junagarhi": () => require("../../data/quran/translations/ur-junagarhi.json") as string[][],
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  "en-pickthall": () => require("../../data/quran/translations/en-pickthall.json") as string[][],
};

const loaded: Partial<Record<QuranTranslation, string[][]>> = {};

export function translationOf(translation: QuranTranslation, ayah: number) {
  loaded[translation] ??= LOADERS[translation]();
  return loaded[translation][Math.floor(ayah / 1000) - 1]?.[(ayah % 1000) - 1] ?? "";
}

export function isRtlTranslation(translation: QuranTranslation) {
  return TRANSLATIONS.find((item) => item.key === translation)?.rtl ?? false;
}

/** The ayah after this one in Mushaf order, or null after the last. */
function nextAyah(ayah: number) {
  const surah = Math.floor(ayah / 1000);
  if (ayah % 1000 < chapters[surah - 1].ayat) return ayah + 1;
  return surah < 114 ? (surah + 1) * 1000 + 1 : null;
}

export type PageAyah = {
  /** surah * 1000 + ayah */
  ayah: number;
  /** Began on an earlier page and runs on here. */
  continued: boolean;
};

/**
 * The ayahs to translate under a page: the one it continues, if it opens
 * mid-ayah, then every ayah that begins on it.
 */
export function ayahsOnPage(layout: MushafLayout, pageNumber: number): PageAyah[] {
  const page = clampPage(layout, pageNumber);
  const start = pageStart(layout, page);
  const next = page < pageCount(layout) ? pageStart(layout, page + 1) : null;
  // An ayah begins on this page when it comes before the next page's first
  // beginning; a next page that opens mid-ayah x means x began here.
  const end = next === null ? Infinity : Number.isInteger(next) ? next : Math.floor(next) + 1;
  const out: PageAyah[] = [];
  let ayah: number | null = Math.floor(start);
  if (!Number.isInteger(start)) {
    out.push({ ayah, continued: true });
    ayah = nextAyah(ayah);
  }
  for (; ayah !== null && ayah < end; ayah = nextAyah(ayah)) out.push({ ayah, continued: false });
  return out;
}
