#!/usr/bin/env node
// Builds the bundled Quran data for the free Quran reader (Pen section 27).
//
// Source: the Quran.com v4 API, which carries the King Fahd Complex 15-line
// Madani page layout (page and line number for every word) and word-level
// tajweed markup. Output is written to data/quran/, which the app requires
// lazily, so reading works fully offline.
//
//   node scripts/build-quran-data.mjs [--cache <dir>]
//
// Raw API responses are cached (default: .quran-cache/, gitignored) so a
// re-run does not refetch 604 pages.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheArg = process.argv.indexOf("--cache");
const cacheDir = resolve(cacheArg > -1 ? process.argv[cacheArg + 1] : join(appDir, ".quran-cache"));
const outDir = join(appDir, "data", "quran");
const API = "https://api.quran.com/api/v4";
const PAGE_COUNT = 604;
const LINES_PER_PAGE = 15;
// Minimum gap between words, in em. Must match WORD_GAP_EM in
// services/quran/data.ts, which sizes each page from the width stored here.
const WORD_GAP_EM = 0.25;

// Quran.com tajweed classes -> compact codes stored in the bundle. The app
// maps codes to colours and rule explanations (services/quran/tajweed.ts).
const RULE_CODES = {
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

// The reader font, shaped with HarfBuzz — the shaper Android uses.
const require = createRequire(import.meta.url);
const hbWasm = readFileSync(require.resolve("harfbuzzjs/hb.wasm"));
const hbInstance = (await WebAssembly.instantiate(hbWasm)).instance;
const hb = require("harfbuzzjs/hbjs.js")(hbInstance);
const face = hb.createFace(hb.createBlob(readFileSync(join(appDir, "assets", "fonts", "AmiriQuran-Regular.ttf"))), 0);
const font = hb.createFont(face);
const emWidth = (text) => {
  const buffer = hb.createBuffer();
  buffer.addText(text);
  buffer.guessSegmentProperties();
  hb.shape(font, buffer);
  const advance = buffer.json().reduce((sum, glyph) => sum + glyph.ax, 0);
  buffer.destroy();
  return advance / face.upem;
};

// Width in em of text[start, end) shaped with the rest of the word as
// context — how Android draws one colour run of a word.
const runWidth = (text, start, end) => {
  const x = hbInstance.exports;
  const ptr = x.malloc(text.length * 2);
  const units = new Uint16Array(x.memory.buffer, ptr, text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  const buffer = hb.createBuffer();
  x.hb_buffer_add_utf16(buffer.ptr, ptr, text.length, start, end - start);
  x.free(ptr);
  buffer.guessSegmentProperties();
  hb.shape(font, buffer);
  const advance = buffer.json().reduce((sum, glyph) => sum + glyph.ax, 0);
  buffer.destroy();
  return advance / face.upem;
};

// How much wider the word draws when split at these offsets than whole.
const splitCost = (text, cuts) => {
  let drawn = 0;
  let from = 0;
  for (const to of [...cuts, text.length]) {
    drawn += runWidth(text, from, to);
    from = to;
  }
  return drawn - runWidth(text, 0, text.length);
};

mkdirSync(cacheDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

async function fetchJson(url, cacheName) {
  const cached = join(cacheDir, cacheName);
  if (existsSync(cached)) return JSON.parse(readFileSync(cached, "utf8"));
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (response.ok) {
      const body = await response.json();
      writeFileSync(cached, JSON.stringify(body));
      return body;
    }
    if (attempt >= 5) throw new Error(`${url} -> HTTP ${response.status}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

function fetchPage(page) {
  const params = new URLSearchParams({
    words: "true",
    word_fields: "line_number,page_number,text_uthmani_tajweed",
    fields: "juz_number,hizb_number",
    per_page: "300",
  });
  return fetchJson(`${API}/verses/by_page/${page}?${params}`, `page-${page}.json`);
}

// "<rule class=ghunnah>نّ</rule>" markup -> [[text, code], ...] segments.
// A word with no rules collapses to a plain string.
const unknownRules = new Set();
const costlyWords = [];
function parseWord(markup) {
  const segments = [];
  // Rules can nest; the innermost tajweed rule colours the text. "custom-*"
  // classes are glyph hints for Quran.com's fonts, not tajweed rules.
  const stack = [];
  const pattern = /<rule class=([a-z_-]+)>|<\/rule>|([^<]+)/g;
  let match;
  while ((match = pattern.exec(markup))) {
    if (match[1]) {
      if (!match[1].startsWith("custom-") && !RULE_CODES[match[1]]) unknownRules.add(match[1]);
      stack.push(RULE_CODES[match[1]]);
    } else if (match[2]) {
      const code = stack.findLast(Boolean);
      const last = segments.at(-1);
      if (last && last[1] === code) last[0] += match[2];
      else segments.push(code ? [match[2], code] : [match[2]]);
    } else {
      stack.pop();
    }
  }
  const text = segments.map((s) => s[0]).join("");
  if (/[<>]/.test(text) || stack.length) throw new Error(`Unparsed tajweed markup: ${markup}`);

  // Android drops the rest of a word when a coloured span starts with a
  // combining mark (the markup often splits "شَ" + "ا" as "ش" + "َا"), so
  // every segment must start on a letter. Leading marks move back onto the
  // letter they sit on; a coloured segment that is only marks (a dagger
  // alif, say) takes that letter with it so the colour still shows.
  for (let i = 1; i < segments.length; i++) {
    const marks = segments[i][0].match(/^\p{M}+/u)?.[0];
    if (!marks) continue;
    // The nearest earlier segment that still holds text.
    let j = i - 1;
    while (j > 0 && !segments[j][0]) j--;
    if (marks.length === segments[i][0].length && segments[i][1]) {
      const cluster = segments[j][0].match(/\P{M}\p{M}*$/u)?.[0] ?? "";
      segments[j][0] = segments[j][0].slice(0, segments[j][0].length - cluster.length);
      segments[i][0] = cluster + segments[i][0];
    } else {
      segments[j][0] += marks;
      segments[i][0] = segments[i][0].slice(marks.length);
    }
  }
  const merged = [];
  for (const segment of segments) {
    if (!segment[0]) continue;
    const last = merged.at(-1);
    if (last && last[1] === segment[1]) last[0] += segment[0];
    else merged.push(segment);
  }
  segments.splice(0, segments.length, ...merged);

  // Android draws each colour run of a word separately, and the font's
  // cursive attachment and ligatures do not reach across a run boundary, so
  // a split in the wrong place makes the word draw wider than it measures
  // and run into its neighbour. Where a boundary costs width, move it a
  // letter at a time into the uncoloured side (the colour takes the extra
  // letter) until it costs nothing.
  let cost = 0;
  if (segments.length > 1) {
    const cuts = [];
    let offset = 0;
    for (const segment of segments.slice(0, -1)) cuts.push((offset += segment[0].length));
    const letterStarts = [...text.matchAll(/\P{M}/gu)].map((m) => m.index);
    cuts.forEach((cut, i) => {
      if (splitCost(text, [cut]) < 0.01) return;
      const growRight = Boolean(segments[i][1]);
      const candidates = letterStarts
        .filter((at) => at > 0 && at < text.length && (growRight ? at > cut : at < cut))
        .sort((a, b) => (growRight ? a - b : b - a))
        .slice(0, 3);
      const better = candidates.find((at) => splitCost(text, [at]) < 0.01);
      if (better !== undefined) cuts[i] = better;
    });
    const aligned = [];
    let from = 0;
    segments.forEach((segment, i) => {
      const to = i < cuts.length ? Math.min(Math.max(from, cuts[i]), text.length) : text.length;
      if (to > from) aligned.push(segment[1] ? [text.slice(from, to), segment[1]] : [text.slice(from, to)]);
      from = to;
    });
    const regrouped = [];
    for (const segment of aligned) {
      const last = regrouped.at(-1);
      if (last && last[1] === segment[1]) last[0] += segment[0];
      else regrouped.push(segment);
    }
    segments.splice(0, segments.length, ...regrouped);
    cost = splitCost(text, regrouped.slice(0, -1).map((_, i) => regrouped.slice(0, i + 1).reduce((n, seg) => n + seg[0].length, 0)));
    if (cost > 0.01) costlyWords.push({ text, cost });
  }
  if (segments.map((s) => s[0]).join("") !== text || segments.some((s, i) => i > 0 && /^\p{M}/u.test(s[0]))) {
    throw new Error(`Could not re-segment tajweed markup: ${markup}`);
  }
  if (segments.every((s) => s.length === 1)) return text;
  // The reader gives a word that still draws wider this much room (em).
  return cost > 0.01 ? { s: segments, x: Math.ceil(cost * 100) / 100 } : segments;
}

// Plain text of a stored word, whatever its shape.
const segmentsOf = (w) => (Array.isArray(w) ? w : w.s);
const plainOf = (w) => (typeof w === "string" ? w : segmentsOf(w).map((s) => s[0]).join(""));

const chaptersBody = await fetchJson(`${API}/chapters?language=en`, "chapters.json");
const chapters = chaptersBody.chapters.map((c) => ({
  n: c.id,
  en: c.name_simple,
  ar: c.name_arabic,
  meaning: c.translated_name.name,
  place: c.revelation_place === "madinah" ? "medinan" : "meccan",
  ayat: c.verses_count,
  page: c.pages[0],
}));

const bodies = [];
for (let page = 1; page <= PAGE_COUNT; page++) {
  bodies[page] = await fetchPage(page);
  if (page % 100 === 0) console.log(`fetched page ${page}`);
}
const versesOnPage = bodies.map((body) => new Set(body?.verses.map((v) => v.verse_key)));

const pages = [];
for (let page = 1; page <= PAGE_COUNT; page++) {
  const body = bodies[page];
  const lines = Array.from({ length: LINES_PER_PAGE }, () => null);
  const surahStarts = [];
  for (const verse of body.verses) {
    const [surah, ayah] = verse.verse_key.split(":").map(Number);
    for (const word of verse.words) {
      // A verse that crosses a page break is returned for both pages. A few
      // words carry a page_number whose own page query omits the verse
      // (5:77 claims page 120 but only page 121 returns it); those belong
      // to the page that returned them.
      const owner = versesOnPage[word.page_number]?.has(verse.verse_key) ? word.page_number : page;
      if (owner !== page) continue;
      const index = word.line_number - 1;
      if (ayah === 1 && word.position === 1) surahStarts.push({ surah, line: index });
      lines[index] ??= { w: [] };
      const isEnd = word.char_type_name === "end";
      lines[index].w.push(isEnd ? ayah : parseWord(word.text_uthmani_tajweed));
      lines[index].surahEnd = isEnd && ayah === chapters[surah - 1].ayat;
    }
  }

  // Lines with no words are surah headers and basmalas. Each surah that
  // starts on this page takes the one or two empty lines before it; empty
  // lines left at the bottom of the page announce the next page's surah.
  const fill = (index, value) => {
    if (index < 0 || index >= LINES_PER_PAGE || lines[index]) return false;
    lines[index] = value;
    return true;
  };
  // The header (and even the basmala) can sit at the foot of the previous
  // page, so lines above the top of this page are skipped, not errors.
  for (const { surah, line } of surahStarts) {
    const above = surah !== 1 && surah !== 9 ? [{ b: 1 }, { h: surah }] : [{ h: surah }];
    above.forEach((value, i) => {
      const index = line - 1 - i;
      if (index >= 0 && !fill(index, value)) throw new Error(`page ${page}: line ${index + 1} taken before surah ${surah}`);
    });
  }
  const lastSurah = Number(body.verses.at(-1).verse_key.split(":")[0]);
  const trailing = lines.map((l, i) => (l ? -1 : i)).filter((i) => i >= 0);
  if (trailing.length) {
    const next = lastSurah + 1;
    if (trailing.length > 2 || trailing.at(-1) !== LINES_PER_PAGE - 1) {
      // Pages 1 and 2 are the short, centred opening pages.
      if (page > 2) throw new Error(`page ${page}: unexplained empty lines ${trailing.join(",")}`);
    } else {
      fill(trailing[0], { h: next });
      if (trailing.length === 2) fill(trailing[1], { b: 1 });
    }
  }

  const first = body.verses[0];
  pages.push({
    j: first.juz_number,
    z: first.hizb_number,
    s: Number(first.verse_key.split(":")[0]),
    l: page <= 2 ? lines.filter(Boolean) : lines,
  });
}

if (costlyWords.length) {
  costlyWords.sort((a, b) => b.cost - a.cost);
  console.log(`${costlyWords.length} coloured words still draw wider than they measure; worst ${costlyWords[0].cost.toFixed(2)} em (${costlyWords[0].text})`);
}
if (unknownRules.size) throw new Error(`Unmapped tajweed rules: ${[...unknownRules].join(", ")}`);

// The print justifies every line except a short closing line of a surah,
// which it centres; the two opening pages are centred throughout.
const lengthOf = (line) =>
  line.w.reduce((sum, w) => sum + (typeof w === "number" ? 2 : plainOf(w).length + 1), 0);
const fullLengths = pages
  .flatMap((p) => p.l)
  .filter((l) => l?.w)
  .map(lengthOf)
  .sort((a, b) => a - b);
const median = fullLengths[Math.floor(fullLengths.length / 2)];
pages.forEach((p, i) => {
  for (const line of p.l) {
    if (!line?.w) continue;
    if (i < 2 || (line.surahEnd && lengthOf(line) < median * 0.7)) line.c = 1;
    delete line.surahEnd;
  }
});

// Measure every line with the reader font (HarfBuzz, the shaper Android
// uses) and store each page's widest line in em. The reader picks the
// largest font size at which that line still fits, so no line overflows and
// every page is as large as the screen allows.
const arabicDigits = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const wordText = (w) => (typeof w === "number" ? "۝" + arabicDigits(w) : plainOf(w));
for (const page of pages) {
  const lines = page.l.filter((line) => line?.w);
  const widths = lines.map((line) => line.w.reduce((sum, w) => sum + emWidth(wordText(w)), 0) + (line.w.length - 1) * WORD_GAP_EM);
  page.m = Math.ceil(Math.max(...widths) * 100) / 100;
  // The same with tajweed colours on, where some words need extra room.
  const tajweedWidths = lines.map((line, i) => widths[i] + line.w.reduce((sum, w) => sum + (w?.x ?? 0), 0));
  page.t = Math.ceil(Math.max(...tajweedWidths) * 100) / 100;
}

// A juz can begin part-way down a page; it starts on the page that holds
// its first ayah (juz 4 on page 62, although page 62 opens in juz 3).
const juz = [];
for (let page = 1; page <= PAGE_COUNT; page++) {
  for (const verse of bodies[page].verses) {
    if (!verse.words.some((w) => w.page_number === page)) continue;
    if (juz.at(-1)?.juz !== verse.juz_number && verse.juz_number > (juz.at(-1)?.juz ?? 0)) {
      juz.push({ juz: verse.juz_number, page, surah: Number(verse.verse_key.split(":")[0]) });
    }
  }
}
if (juz.length !== 30) throw new Error(`found ${juz.length} juz starts`);

writeFileSync(join(outDir, "chapters.json"), JSON.stringify(chapters));
writeFileSync(join(outDir, "juz.json"), JSON.stringify(juz));
writeFileSync(join(outDir, "pages.json"), JSON.stringify(pages));
const size = (f) => `${(readFileSync(join(outDir, f)).length / 1024).toFixed(0)} KB`;
console.log(`chapters.json ${size("chapters.json")}, pages.json ${size("pages.json")}`);
