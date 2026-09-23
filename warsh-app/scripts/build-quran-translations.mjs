#!/usr/bin/env node
// Builds the translations shown under the Mushaf page (Pen section 30).
//
// Both are public domain and come from the public Quran.com v4 API:
//   - Urdu: Maulana Muhammad Junagarhi (d. 1941), Quran.com resource 54
//   - English: M. M. Pickthall, The Meaning of the Glorious Koran (1930), 19
// Quran.com's Junagarhi text carries the tafsir footnote markers of a later
// commentary; those are dropped, so only the translation ships.
//
//   node scripts/build-quran-translations.mjs
//
// Responses are cached in .quran-cache/translations/ (gitignored). Output is
// data/quran/translations/<file>.json: one array per surah, one string per
// ayah, which the reader requires only once a translation is turned on.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = join(appDir, ".quran-cache", "translations");
const outDir = join(appDir, "data", "quran", "translations");
const chapters = JSON.parse(readFileSync(join(appDir, "data", "quran", "chapters.json"), "utf8"));

const TRANSLATIONS = [
  { id: 54, file: "ur-junagarhi", urdu: true },
  { id: 19, file: "en-pickthall", urdu: false },
];

async function fetchTranslation(id) {
  const cached = join(cacheDir, `${id}.json`);
  if (existsSync(cached)) return JSON.parse(readFileSync(cached, "utf8"));
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`https://api.quran.com/api/v4/quran/translations/${id}?fields=verse_key`);
    if (response.ok) {
      const body = await response.json();
      writeFileSync(cached, JSON.stringify(body));
      return body;
    }
    if (attempt >= 5) throw new Error(`translation ${id}: HTTP ${response.status}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

// Quran.com's Urdu text mixes Arabic letter forms into Urdu words (وه, راه,
// والا as a presentation-form ligature); Urdu fonts draw those as the wrong
// shapes, so they are folded to their Urdu letters.
const toUrduLetters = (text) =>
  text
    .replace(/ﻻ|ﻼ/g, "لا")
    .replace(/ه/g, "ہ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s*\.\s*$/u, "۔");

function clean(text, urdu) {
  const plain = text
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]+>/g, "")
    // A stray bracket in the source (Junagarhi 4:106 ends in ">").
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return urdu ? toUrduLetters(plain) : plain;
}

mkdirSync(cacheDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

for (const { id, file, urdu } of TRANSLATIONS) {
  const { translations } = await fetchTranslation(id);
  const bySurah = chapters.map((chapter) => new Array(chapter.ayat).fill(null));
  for (const item of translations) {
    const [surah, ayah] = item.verse_key.split(":").map(Number);
    bySurah[surah - 1][ayah - 1] = clean(item.text, urdu);
  }
  const missing = bySurah.flatMap((ayahs, s) => ayahs.map((text, a) => (text ? null : `${s + 1}:${a + 1}`))).filter(Boolean);
  if (missing.length) throw new Error(`${file}: missing ${missing.slice(0, 5).join(", ")}`);
  if (bySurah.flat().some((text) => /[<>]/.test(text))) throw new Error(`${file}: markup left in the text`);
  const out = join(outDir, `${file}.json`);
  writeFileSync(out, JSON.stringify(bySurah));
  console.log(`${file}.json ${(readFileSync(out).length / 1024).toFixed(0)} KB`);
}
