#!/usr/bin/env node
// Builds lib/data/quran-ayat.json: the Uthmani text of every ayah, which Noor's
// replies quote from instead of reciting the Quran from model memory.
//
// Source: the Madani Mushaf pages the app already bundles
// (warsh-app/data/quran/pages.json, built from the Quran.com v4 API by
// warsh-app/scripts/build-quran-data.mjs). An ayah is every word between two
// ayah-number markers; a surah header resets the count.
//
//   node scripts/build-quran-ayat.mjs
//
// Output shape: string[114][] — ayat[surah - 1][ayah - 1].

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = JSON.parse(readFileSync(join(backendDir, "..", "warsh-app", "data", "quran", "pages.json"), "utf8"));
const outFile = join(backendDir, "lib", "data", "quran-ayat.json");

const wordText = (word) => {
  if (typeof word === "string") return word;
  const segments = Array.isArray(word) ? word : word.s;
  return segments.map((segment) => segment[0]).join("");
};

const ayat = [];
let surah = 0;
let words = [];

for (const page of pages) {
  for (const line of page.l) {
    if ("h" in line) {
      surah = line.h;
      ayat[surah - 1] = [];
      words = [];
      continue;
    }
    if (!("w" in line)) continue; // a basmala line above a surah is not an ayah
    for (const word of line.w) {
      if (typeof word === "number") {
        const list = ayat[surah - 1];
        if (word !== list.length + 1) throw new Error(`Surah ${surah}: expected ayah ${list.length + 1}, found ${word}`);
        list.push(words.join(" "));
        words = [];
      } else {
        words.push(wordText(word));
      }
    }
  }
}

const total = ayat.reduce((sum, list) => sum + list.length, 0);
if (ayat.length !== 114 || total !== 6236) throw new Error(`Expected 114 surahs / 6236 ayat, got ${ayat.length} / ${total}`);

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(ayat));
console.log(`Wrote ${total} ayat to ${outFile}`);
