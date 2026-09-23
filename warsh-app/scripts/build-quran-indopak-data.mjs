#!/usr/bin/env node
// Builds the bundled Indo-Pak Mushafs for the Quran reader (Pen section
// 28): the 15-line print Warsh opens by default, and the 16-line print.
//
// Sources, from the Quranic Universal Library (qul.tarteel.ai, free account):
//   - "Indopak 15 lines layout (Qudratullah)", mushaf-layout/12, sqlite:
//     610 pages, the same pages as the Taj Company 15-line print
//   - "Indopak 16 lines layout (Taj company)", mushaf-layout/11, sqlite:
//     548 pages, as taj-indopak-16-lines.db
//   - "Indopak Nastaleeq script - Word by Word", quran-script/59, json
//   - the matching "Indopak Nastaleeq" font, font/242, bundled as
//     assets/fonts/IndoPakNastaleeq-Regular.ttf
// Put the three data files in .quran-cache/qul/ (gitignored), then:
//
//   node scripts/build-quran-indopak-data.mjs [--source <dir>]
//
// Also writes the ayah index for the Madani pages built by
// build-quran-data.mjs, so switching layout keeps the reader's place.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceArg = process.argv.indexOf("--source");
const sourceDir = resolve(sourceArg > -1 ? process.argv[sourceArg + 1] : join(appDir, ".quran-cache", "qul"));
const dataDir = join(appDir, "data", "quran");
// Each layout's pages and index go to data/quran/<dir>/.
const LAYOUTS = [
  { file: "qudratullah-indopak-15-lines.db", pageCount: 610, linesPerPage: 15, dir: "indopak" },
  { file: "taj-indopak-16-lines.db", pageCount: 548, linesPerPage: 16, dir: "indopak16" },
];
// Must match WORD_GAP_EM in services/quran/data.ts.
const WORD_GAP_EM = 0.25;

// Where each parah starts in the Indo-Pak print, which differs from the
// Madani juz in six places (parah 4, 7, 11, 14, 20, 21 and 23 start a few
// ayahs later or earlier). Each one opens a page, which the build checks.
// words = how many words of the opening make the parah's name; parah 1 is
// named after Al-Baqarah's first word.
const PARAHS = [
  ["1:1", "Alif Lam Meem", 1, "2:1"],
  ["2:142", "Sayaqool", 1],
  ["2:253", "Tilkar Rusul", 2],
  ["3:92", "Lan Tana Lu", 2],
  ["4:24", "Wal Muhsanat", 1],
  ["4:148", "La Yuhibbullah", 3],
  ["5:83", "Wa Iza Samiu", 2],
  ["6:111", "Wa Lau Annana", 2],
  ["7:88", "Qalal Mala'u", 2],
  ["8:41", "Wa'lamu", 1],
  ["9:94", "Ya'tadhiroon", 1],
  ["11:6", "Wa Ma Min Dabbah", 3],
  ["12:53", "Wa Ma Ubarri'u", 2],
  ["15:2", "Rubama", 1],
  ["17:1", "Subhanalladhi", 2],
  ["18:75", "Qala Alam", 2],
  ["21:1", "Iqtaraba", 2],
  ["23:1", "Qad Aflaha", 2],
  ["25:21", "Wa Qalalladhina", 2],
  ["27:60", "Amman Khalaq", 2],
  ["29:45", "Utlu Ma Uhiya", 3],
  ["33:31", "Wa Man Yaqnut", 2],
  ["36:22", "Wa Ma Liya", 2],
  ["39:32", "Faman Azlam", 2],
  ["41:47", "Ilaihi Yuraddu", 2],
  ["46:1", "Ha Meem", 1],
  ["51:31", "Qala Fama Khatbukum", 3],
  ["58:1", "Qad Sami'allah", 3],
  ["67:1", "Tabarakalladhi", 2],
  ["78:1", "Amma", 1],
];

// Ayahs are coded surah * 1000 + ayah, which sorts in Mushaf order.
const code = (surah, ayah) => Number(surah) * 1000 + Number(ayah);

const script = JSON.parse(readFileSync(join(sourceDir, "indopak-nastaleeq.json"), "utf8"));
const words = [];
for (const word of Object.values(script)) words[word.id] = word;
const chapters = JSON.parse(readFileSync(join(dataDir, "chapters.json"), "utf8"));

// The font the reader draws Indo-Pak pages with, shaped with HarfBuzz (the
// shaper Android uses) so each page can be sized to its widest line.
const require = createRequire(import.meta.url);
const hbInstance = (await WebAssembly.instantiate(readFileSync(require.resolve("harfbuzzjs/hb.wasm")))).instance;
const hb = require("harfbuzzjs/hbjs.js")(hbInstance);
const face = hb.createFace(
  hb.createBlob(readFileSync(join(appDir, "assets", "fonts", "IndoPakNastaleeq-Regular.ttf"))),
  0,
);
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

const size = (f) => `${(readFileSync(f).length / 1024).toFixed(0)} KB`;

function buildLayout({ file, pageCount: PAGE_COUNT, linesPerPage: LINES_PER_PAGE, dir }) {
  const outDir = join(dataDir, dir);
  const db = new DatabaseSync(join(sourceDir, file));
  const [info] = db.prepare("select * from info").all();
  if (info.number_of_pages !== PAGE_COUNT || info.lines_per_page !== LINES_PER_PAGE) {
    throw new Error(`unexpected layout: ${JSON.stringify(info)}`);
  }
  const rows = db.prepare("select * from pages order by page_number, line_number").all();
  const pages = [];
  // Per page, the first ayah that begins on it. A page that only continues a
  // long ayah stores that ayah + 0.5, so looking an ayah up finds the page it
  // begins on.
  const starts = [];
  const wordPage = [];
  let expectedWord = 1;
  for (let page = 1; page <= PAGE_COUNT; page++) {
    const lines = rows.filter((row) => row.page_number === page);
    const out = [];
    let firstBegin = null;
    let firstWord = null;
    for (const [index, row] of lines.entries()) {
      if (row.line_type === "surah_name") {
        out.push({ h: row.surah_number });
        // The 16-line print sets the basmala inside the surah header band,
        // so its data has no basmala row for most surahs. Where that leaves
        // the page a line short (An-Nazi'at and 'Abasa, pages 529 and 530)
        // the basmala takes its own line; otherwise the header carries it.
        const needsBasmala = ![1, 9].includes(row.surah_number) && lines[index + 1] && lines[index + 1].line_type !== "basmallah";
        if (needsBasmala && lines.length < LINES_PER_PAGE) out.push({ b: 1 });
        else if (needsBasmala) out.at(-1).b = 1;
      } else if (row.line_type === "basmallah") {
        out.push({ b: 1 });
      } else if (row.line_type === "ayah") {
        const line = { w: [] };
        for (let id = row.first_word_id; id <= row.last_word_id; id++) {
          if (id !== expectedWord++) throw new Error(`page ${page}: word ${id} out of order`);
          const word = words[id];
          line.w.push(word.text);
          wordPage[id] = page;
          firstWord ??= word;
          if (firstBegin === null && word.word === "1") firstBegin = code(word.surah, word.ayah);
        }
        if (row.is_centered) line.c = 1;
        out.push(line);
      } else {
        throw new Error(`page ${page}: unknown line type ${row.line_type}`);
      }
    }
    if (out.length !== LINES_PER_PAGE && ![1, 2, PAGE_COUNT].includes(page)) {
      throw new Error(`page ${page}: ${out.length} lines`);
    }
    starts.push(firstBegin ?? code(firstWord.surah, firstWord.ayah) + 0.5);
    pages.push({ s: Number(firstWord.surah), l: out });
  }
  if (expectedWord - 1 !== words.length - 1) throw new Error(`placed ${expectedWord - 1} of ${words.length - 1} words`);

  // Parah starts, each checked to open its page.
  const firstWordOf = (surah, ayah) =>
    words.find((w) => w && w.surah === String(surah) && w.ayah === String(ayah) && w.word === "1");
  const parahs = PARAHS.map(([start, en, nameWords, nameFrom = start], index) => {
    const [surah, ayah] = start.split(":");
    const first = firstWordOf(surah, ayah);
    const page = wordPage[first.id];
    const opensPage = rows.find((r) => r.page_number === page && r.line_type === "ayah").first_word_id === first.id;
    if (!opensPage) throw new Error(`parah ${index + 1} (${start}) does not open page ${page}`);
    const nameStart = firstWordOf(...nameFrom.split(":")).id;
    const ar = words
      .slice(nameStart, nameStart + nameWords)
      .map((w) => w.text)
      .join(" ");
    return { juz: index + 1, page, surah: Number(surah), ayah: Number(ayah), en, ar };
  });
  pages.forEach((page, index) => {
    page.j = parahs.filter((p) => p.page <= index + 1).at(-1).juz;
  });

  // Surah start pages. A surah's header can sit at the foot of the page
  // before its first ayah, as Al-Hijr's does on page 261; the list opens the
  // page with the header.
  const surahPages = chapters.map((chapter) => {
    const headerRow = rows.find((r) => r.line_type === "surah_name" && r.surah_number === chapter.n);
    if (!headerRow) throw new Error(`no header for surah ${chapter.n}`);
    return headerRow.page_number;
  });

  // Size every page to its widest line.
  for (const page of pages) {
    const widths = page.l
      .filter((line) => line.w)
      .map((line) => line.w.reduce((sum, w) => sum + emWidth(w), 0) + (line.w.length - 1) * WORD_GAP_EM);
    page.m = Math.ceil(Math.max(...widths) * 100) / 100;
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "pages.json"), JSON.stringify(pages));
  writeFileSync(join(outDir, "index.json"), JSON.stringify({ starts, surahPages, parahs }));
  console.log(
    `${dir}/pages.json ${size(join(outDir, "pages.json"))}, ${dir}/index.json ${size(join(outDir, "index.json"))}`,
  );
}

for (const layout of LAYOUTS) buildLayout(layout);

// The Madani ayah index, from the pages build-quran-data.mjs wrote: a
// number in a line ends that ayah, and a surah header starts ayah 1.
const madani = JSON.parse(readFileSync(join(dataDir, "pages.json"), "utf8"));
const madaniStarts = [];
{
  let surah = 1;
  let next = 1; // the ayah the next word belongs to
  let atAyahStart = true;
  for (const page of madani) {
    let begin = null;
    let continued = null;
    for (const line of page.l) {
      if ("h" in line) {
        surah = line.h;
        next = 1;
        atAyahStart = true;
      }
      if (!("w" in line)) continue;
      for (const word of line.w) {
        if (typeof word === "number") {
          next = word + 1;
          atAyahStart = true;
          continue;
        }
        if (atAyahStart) begin ??= code(surah, next);
        else continued ??= code(surah, next);
        atAyahStart = false;
      }
    }
    madaniStarts.push(begin ?? continued + 0.5);
  }
  if (madaniStarts.length !== 604 || madaniStarts[603] > code(114, 1)) throw new Error("Madani ayah index is off");
}

writeFileSync(join(dataDir, "madani-starts.json"), JSON.stringify(madaniStarts));
