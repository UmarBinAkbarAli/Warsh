// Noor never recites the Quran from model memory: it quoted ayat that do not
// exist (seen 2026-10-22), and the model cannot recall ayah numbers reliably
// either. So it looks ayat up with the search_quran tool, names the one it
// wants in a tag, and the server replaces that tag with the exact Uthmani text
// from the bundled Mushaf data (lib/data/quran-ayat.json, built by
// scripts/build-quran-ayat.mjs). A tag that names no real ayah is removed, so an
// invented reference never reaches a learner.

import ayat from "./data/quran-ayat.json";

const QURAN = ayat as string[][];

/** Longest quote one tag may expand to — Al-Ikhlas and Al-Fatiha fit, a page does not. */
export const MAX_QUOTE_CHARS = 700;
const MAX_SEARCH_RESULTS = 6;

export const AYAH_INSTRUCTION =
  "\n\nQURAN QUOTES: Never write the Arabic text of an ayah yourself, not even part of one, and never give an " +
  "ayah or surah number from memory. To find an ayah, call the search_quran tool with Arabic words from it. " +
  "To quote an ayah, put a line containing only ⟦ayah: S:A⟧ (surah number, colon, ayah number, for example " +
  "⟦ayah: 112:1⟧), or ⟦ayah: S:A-B⟧ for a short run of consecutive ayat; use only references that search_quran " +
  "returned or that the student gave you, and do not copy the text search_quran shows you into your reply. " +
  "The app replaces the tag line with the exact text and its reference. " +
  "If you cannot find the ayah, say so instead of quoting. You may still write single Arabic words or short " +
  "phrases you are explaining.";

const TAG = /⟦\s*ayah\s*:\s*(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?\s*⟧/gu;

/** The exact text for S:A or S:A-B, or null when the reference does not exist. */
export function quoteAyat(surah: number, from: number, to: number = from): string | null {
  const list = QURAN[surah - 1];
  if (!list || from < 1 || to < from || to > list.length) return null;
  const text = list.slice(from - 1, to).join(" ");
  if (text.length > MAX_QUOTE_CHARS && from !== to) return null;
  const ref = from === to ? `${surah}:${from}` : `${surah}:${from}-${to}`;
  return `﴿${text}﴾ (${ref})`;
}

// A run of Arabic-script text (letters, marks, spaces) of three or more words —
// long enough to be an ayah rather than a word being explained.
const ARABIC_RUN = /[؀-ۿࢠ-ࣿ‌‍]+(?:[  ]+[؀-ۿࢠ-ࣿ‌‍]+){2,}/gu;
// What the model wraps around a copied ayah: quotes, bold, an "(Al-Ikhlas: 1)" style reference.
const WRAPPER_BEFORE = /(\*\*[^*\n]{1,20}\*\*)?[ \t]*["“”«»]*[ \t]*$/u;
const WRAPPER_AFTER = /^[ \t]*["“”«»]*[ \t]*(\([^()\n]*\d[^()\n]*\))?[ \t]*["“”«»]*/u;

/**
 * Replace ayah tags with the real text; drop tags that name no real ayah. A
 * whole ayah the model wrote out as plain text (it copies search results, and
 * sometimes quotes from memory) becomes the same quote with its reference, or
 * is removed when a tag already quotes that ayah — so every ayah a learner sees
 * is the exact Mushaf text, shown once, with a reference that matches it.
 */
export function expandAyahTags(reply: string): string {
  const tagged = new Set<string>();
  for (const [, s, a, b] of reply.matchAll(TAG)) {
    for (let n = Number(a); n <= Number(b ?? a); n++) tagged.add(`${Number(s)}:${n}`);
  }

  let out = "";
  let last = 0;
  for (const run of reply.matchAll(ARABIC_RUN)) {
    const found = matchAyat(normalizeArabic(run[0]));
    if (!found) continue;
    const { surah, from, to } = found;
    const start = run.index - (reply.slice(last, run.index).match(WRAPPER_BEFORE)?.[0].length ?? 0);
    const end = run.index + run[0].length + (reply.slice(run.index + run[0].length).match(WRAPPER_AFTER)?.[0].length ?? 0);
    const alreadyQuoted = tagged.has(`${surah}:${from}`) && tagged.has(`${surah}:${to}`);
    out += reply.slice(last, start) + (alreadyQuoted ? "" : (quoteAyat(surah, from, to) ?? reply.slice(start, end)));
    last = end;
  }
  out += reply.slice(last);

  return out
    .replace(TAG, (_tag, s: string, a: string, b?: string) =>
      quoteAyat(Number(s), Number(a), b ? Number(b) : Number(a)) ?? "",
    )
    .replace(/^[ \t*:：]*$/gmu, "") // bold markers or a colon left on an emptied line
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Ayat indexed by their first three normalised words, so a run of text can be
// matched to one ayah or a run of consecutive ayat without scanning all 6,236.
let plainAyat: string[][] | null = null;
let byOpening: Map<string, [number, number][]> | null = null;
function openingIndex() {
  if (!byOpening) {
    plainAyat = QURAN.map((list) => list.map(normalizeArabic));
    byOpening = new Map();
    plainAyat.forEach((list, s) =>
      list.forEach((plain, a) => {
        const key = plain.split(" ").slice(0, 3).join(" ");
        byOpening!.set(key, [...(byOpening!.get(key) ?? []), [s, a]]);
      }),
    );
  }
  return { plainAyat: plainAyat!, byOpening };
}

/** The whole ayah, or run of consecutive ayat, that a normalised text is exactly; else null. */
export function matchAyat(plain: string): { surah: number; from: number; to: number } | null {
  if (plain.split(" ").length < 3) return null;
  const { plainAyat, byOpening } = openingIndex();
  for (const [s, a] of byOpening.get(plain.split(" ").slice(0, 3).join(" ")) ?? []) {
    let joined = "";
    for (let n = a; n < plainAyat[s].length; n++) {
      joined = joined ? `${joined} ${plainAyat[s][n]}` : plainAyat[s][n];
      if (joined === plain) return { surah: s + 1, from: a + 1, to: n + 1 };
      if (!plain.startsWith(`${joined} `)) break;
    }
  }
  return null;
}

// Harakat, Quranic annotation marks and tatweel; spelling variants folded so a
// learner's or the model's ordinary spelling finds the Uthmani text.
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ࣓-ࣿ‌‍]/gu;

export function normalizeArabic(text: string): string {
  return text
    .replace(MARKS, "")
    .replace(/[ٱأإآ]/gu, "ا")
    .replace(/ى/gu, "ي")
    .replace(/ة/gu, "ه")
    .replace(/[ؤ]/gu, "و")
    .replace(/[ئ]/gu, "ي")
    .replace(/[^ء-ي\s]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

let index: { ref: string; plain: string }[] | null = null;
function searchIndex() {
  index ??= QURAN.flatMap((list, s) =>
    list.map((text, a) => ({ ref: `${s + 1}:${a + 1}`, plain: ` ${normalizeArabic(text)} ` })),
  );
  return index;
}

export type QuranSearchResult = { ref: string; text: string };

/**
 * Ayat containing every query word anywhere (so a word also matches inside a
 * longer word with a prefix or suffix). Ayat holding the exact phrase come first.
 */
export function searchQuran(query: string): { total: number; results: QuranSearchResult[] } {
  const phrase = normalizeArabic(query);
  const words = phrase.split(" ").filter((w) => w.length > 1);
  if (!words.length) return { total: 0, results: [] };
  const hits = searchIndex().filter(({ plain }) => words.every((w) => plain.includes(w)));
  hits.sort((x, y) => Number(y.plain.includes(` ${phrase} `)) - Number(x.plain.includes(` ${phrase} `)));
  return {
    total: hits.length,
    results: hits.slice(0, MAX_SEARCH_RESULTS).map(({ ref }) => {
      const [s, a] = ref.split(":").map(Number);
      return { ref, text: QURAN[s - 1][a - 1] };
    }),
  };
}

export const SEARCH_QURAN_TOOL = {
  type: "function" as const,
  function: {
    name: "search_quran",
    description:
      "Search the Quran's Arabic text. Returns up to six ayat (reference S:A and exact text) that contain all the " +
      "given Arabic words, plus the total number of matches. Use a few distinctive words from the ayah.",
    parameters: {
      type: "object",
      properties: { arabic: { type: "string", description: "Arabic words to find, e.g. ذو الرحمة" } },
      required: ["arabic"],
      additionalProperties: false,
    },
  },
};
