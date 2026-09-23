// Carries Quran.com's word-level tajweed markup (written for the Uthmani
// script) over to the Indo-Pak script, for build-quran-indopak-data.mjs.
//
// Both scripts share Quran.com / QUL word locations (surah:ayah:word), so the
// words line up one to one. Within a word the spellings differ only in
// orthography: the same consonants, with different marks (sukun shapes,
// dagger alif on the letter instead of after a tatweel, farsi yeh and keheh,
// plain alif for alif wasla). So each word is split into letter clusters
// (a letter and the marks on it), the two cluster sequences are aligned on a
// folded consonant skeleton, and every Indo-Pak cluster takes the tajweed rule
// of the Uthmani cluster it aligns with. A rule sitting on an Uthmani cluster
// that has no counterpart (the tatweel that carries a dagger alif) moves onto
// the Indo-Pak letter before it, which is where Indo-Pak writes that mark.

// Quran.com tajweed classes -> the compact codes the app understands
// (services/quran/tajweed.ts). Same table as build-quran-data.mjs.
export const RULE_CODES = {
  ham_wasl: "h",
  laam_shamsiyah: "l",
  slnt: "s",
  madda_normal: "m",
  madda_permissible: "p",
  madda_obligatory: "o",
  madda_obligatory_mottasel: "o",
  madda_obligatory_monfasel: "u",
  madda_necessary: "n",
  qalaqah: "q",
  ikhafa: "i",
  ikhafa_shafawi: "f",
  idgham_ghunnah: "d",
  idgham_wo_ghunnah: "w",
  idgham_shafawi: "a",
  idgham_mutajanisayn: "j",
  idgham_mutaqaribayn: "k",
  iqlab: "b",
  ghunnah: "g",
};

/** "<rule class=x>..</rule>" markup -> one rule code (or null) per UTF-16 unit. */
export function codesPerChar(markup, unknownRules = new Set()) {
  let text = "";
  const codes = [];
  const stack = [];
  const pattern = /<rule class=([a-z_-]+)>|<\/rule>|([^<]+)/g;
  let match;
  while ((match = pattern.exec(markup))) {
    if (match[1]) {
      if (!match[1].startsWith("custom-") && !RULE_CODES[match[1]]) unknownRules.add(match[1]);
      stack.push(RULE_CODES[match[1]]);
    } else if (match[2]) {
      const code = stack.findLast(Boolean) ?? null;
      text += match[2];
      for (let i = 0; i < match[2].length; i++) codes.push(code);
    } else {
      stack.pop();
    }
  }
  if (stack.length || /[<>]/.test(text)) throw new Error(`Unparsed tajweed markup: ${markup}`);
  return { text, codes };
}

const isMark = (ch) => /\p{M}/u.test(ch);
const TATWEEL = "ـ";

/** Letter clusters: a base character and the combining marks after it. */
function clusters(text, codes) {
  const out = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (isMark(ch) && out.length) {
      const last = out.at(-1);
      last.text += ch;
      last.code ??= codes?.[i] ?? null;
    } else {
      out.push({ text: ch, base: ch, code: codes?.[i] ?? null });
    }
  }
  return out;
}

// Folds the orthographic variants of each consonant to one key.
const FOLD = new Map(
  Object.entries({
    A: "اٱأإآٲٳ",
    Y: "يیىئےۍ",
    K: "كک",
    H: "هہةۃھ",
    W: "وؤ",
    Q: "ء",
  }).flatMap(([key, letters]) => [...letters].map((letter) => [letter, key])),
);
const fold = (ch) => FOLD.get(ch) ?? ch;

/**
 * Aligns Uthmani clusters to Indo-Pak clusters (Needleman-Wunsch on the folded
 * base letters) and returns, per Indo-Pak cluster, the rule code it takes.
 */
function alignCodes(uth, ip) {
  const n = uth.length;
  const m = ip.length;
  const GAP = -1;
  const score = (a, b) => (fold(a.base) === fold(b.base) ? 3 : a.base === TATWEEL || b.base === TATWEEL ? -3 : -2);
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  const move = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) (dp[i][0] = i * GAP), (move[i][0] = 1);
  for (let j = 1; j <= m; j++) (dp[0][j] = j * GAP), (move[0][j] = 2);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const diag = dp[i - 1][j - 1] + score(uth[i - 1], ip[j - 1]);
      const up = dp[i - 1][j] + GAP;
      const left = dp[i][j - 1] + GAP;
      if (diag >= up && diag >= left) (dp[i][j] = diag), (move[i][j] = 0);
      else if (up >= left) (dp[i][j] = up), (move[i][j] = 1);
      else (dp[i][j] = left), (move[i][j] = 2);
    }
  }
  const result = new Array(m).fill(null);
  // Codes of Uthmani clusters with no counterpart, waiting for the Indo-Pak
  // cluster before them (the walk runs backwards).
  let pending = null;
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const step = i > 0 && j > 0 ? move[i][j] : i > 0 ? 1 : 2;
    if (step === 0) {
      result[j - 1] = uth[i - 1].code ?? pending;
      pending = null;
      i--;
      j--;
    } else if (step === 1) {
      if (uth[i - 1].code) pending ??= uth[i - 1].code;
      i--;
    } else {
      j--;
    }
  }
  return result;
}

/**
 * Tajweed segments for one Indo-Pak word, [[text], [text, code], ...], or
 * null when the word carries no rule.
 */
export function indoPakSegments(uthmaniMarkup, indoPakText, unknownRules) {
  const { text, codes } = codesPerChar(uthmaniMarkup, unknownRules);
  if (!codes.some(Boolean)) return null;
  const uth = clusters(text, codes);
  const ip = clusters(indoPakText);
  const ipCodes = alignCodes(uth, ip);
  if (!ipCodes.some(Boolean)) return null;
  const segments = [];
  ip.forEach((cluster, index) => {
    const code = ipCodes[index];
    const last = segments.at(-1);
    if (last && (last[1] ?? null) === code) last[0] += cluster.text;
    else segments.push(code ? [cluster.text, code] : [cluster.text]);
  });
  return segments;
}

/** The distinct coloured rules in markup, for coverage checks. */
export function rulesIn(markup) {
  return [...new Set(codesPerChar(markup).codes.filter((code) => code && code !== "m"))];
}
