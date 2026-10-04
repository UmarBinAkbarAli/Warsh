/** Offline corpus → ranked candidate links. No database writes.
 * Usage: npx tsx scripts/prepare-core500-examples.ts --corpus=PATH
 * Corpus v0.4 must retain its original copyright header. Obtain it from
 * https://corpus.quran.com/download/ (do not commit the full source here).
 * Candidate mapping and translations must be reviewed in Studio before publish.
 */
import fs from "node:fs";
import path from "node:path";

const bwChars = "'|>&<}AbptvjHxd*rzs$SDTZEgfqklmnhwYyFNKaui~o`{";
const arChars = "ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰٱ";
const bwMap = new Map([...bwChars].map((c, i) => [c, [...arChars][i]]));
function arabic(bw: string) { return [...bw].map(c => bwMap.get(c) ?? c).join(""); }
function plain(text: string) {
  return text.normalize("NFC").replace(/ىٰ/g, "ى").replace(/وٰ/g, "ا").replace(/ٰ/g, "ا").replace(/[\u064B-\u065F\u06D6-\u06EDـ^_#]/g, "").replace(/[ٱأإآ]/g, "ا").replace(/ى/g, "ي");
}
const corpusPath = process.argv.find(a => a.startsWith("--corpus="))?.slice(9);
if (!corpusPath) throw new Error("--corpus=PATH is required");
const root = path.resolve(__dirname, "../..");
const vocabulary = JSON.parse(fs.readFileSync(path.join(root, "Docs/data/quranic-core-500.json"), "utf8")) as { rank: number; arabic: string; freq: number; pos: string }[];
const glosses = JSON.parse(fs.readFileSync(path.join(root, "Docs/data/quranic-core-500-glosses.json"), "utf8")).glosses as { rank: number; headword: string; sourceForm?: string; isPrefix?: boolean }[];
type Occurrence = { surahNumber: number; ayahNumber: number; wordPosition: number; segment: string; tag: string };
const lemmas = new Map<string, Occurrence[]>();
const verseLengths = new Map<string, number>();
const surfaces = new Map<string, string>();
for (const line of fs.readFileSync(corpusPath, "utf8").split(/\r?\n/)) {
  const match = line.match(/^\((\d+):(\d+):(\d+):(\d+)\)\s+(\S+)\s+(\S+)\s+(.+)$/);
  if (!match) continue;
  const [, s, a, w, , form, tag, features] = match;
  const prefix = features.match(/^PREFIX\|([^|]+)/)?.[1];
  const key = features.match(/\bLEM:([^|]+)/)?.[1] ?? (prefix ? `prefix:${prefix}` : undefined);
  const verseKey = `${s}:${a}`;
  const location = `${s}:${a}:${w}`;
  surfaces.set(location, (surfaces.get(location) ?? "") + arabic(form));
  verseLengths.set(verseKey, Math.max(verseLengths.get(verseKey) ?? 0, Number(w)));
  if (!key) continue;
  const list = lemmas.get(key) ?? [];
  list.push({ surahNumber: Number(s), ayahNumber: Number(a), wordPosition: Number(w), segment: arabic(form), tag });
  lemmas.set(key, list);
}
const overridesPath = path.join(__dirname, "../content/core500-lemma-overrides.json");
const overrides = fs.existsSync(overridesPath) ? JSON.parse(fs.readFileSync(overridesPath, "utf8")) as Record<string, string[]> : {};
const report: unknown[] = [];
const candidates = vocabulary.map(word => {
  const gloss = glosses.find(g => g.rank === word.rank)!;
  const forms = new Set([word.arabic, gloss.headword, gloss.sourceForm ?? ""].filter(Boolean).map(plain));
  const matches = [...lemmas.entries()].filter(([lemma, occurrences]) => {
    if (gloss.isPrefix) return lemma.startsWith("prefix:") && plain(arabic(lemma.slice(7).replace(/:[^+]+/, "").replace(/\+$/, ""))) === plain(gloss.headword);
    if (lemma.startsWith("prefix:")) return false;
    return forms.has(plain(arabic(lemma))) && (word.pos === "Verb" ? occurrences[0].tag === "V" : occurrences[0].tag !== "V");
  }).sort((a, b) => Math.abs(a[1].length - word.freq) - Math.abs(b[1].length - word.freq));
  const selected = overrides[String(word.rank)] ?? (matches.length ? [matches[0][0]] : []);
  const occurrences = selected.flatMap(key => lemmas.get(key) ?? []);
  const byVerse = new Map<string, Occurrence>();
  for (const occurrence of occurrences) {
    const key = `${occurrence.surahNumber}:${occurrence.ayahNumber}`;
    if (!byVerse.has(key)) byVerse.set(key, occurrence);
  }
  const links = [...byVerse.values()].sort((a, b) =>
    (verseLengths.get(`${a.surahNumber}:${a.ayahNumber}`)! - verseLengths.get(`${b.surahNumber}:${b.ayahNumber}`)!)
    || b.surahNumber - a.surahNumber || a.ayahNumber - b.ayahNumber).slice(0, 3);
  report.push({ rank: word.rank, headword: gloss.headword, pos: word.pos, selected, count: occurrences.length,
    alternatives: matches.map(([lemma, list]) => ({ lemma, arabic: arabic(lemma), count: list.length })), links: links.length });
  return { rank: word.rank, headword: gloss.headword, lemmas: selected, status: "DRAFT", examples: links.map(e => ({ ...e, corpusSurface: surfaces.get(`${e.surahNumber}:${e.ayahNumber}:${e.wordPosition}`)! })) };
});
fs.mkdirSync(path.join(__dirname, "../content"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "../content/core500-example-candidates.json"), JSON.stringify({ source: "https://corpus.quran.com/", version: "0.4", words: candidates }, null, 2) + "\n");
fs.writeFileSync(path.join(path.dirname(corpusPath), "core500-mapping-report.json"), JSON.stringify(report, null, 2));
console.log(`${candidates.filter(w => w.examples.length === 3).length}/500 words have three candidate links; review report: ${path.join(path.dirname(corpusPath), "core500-mapping-report.json")}`);
