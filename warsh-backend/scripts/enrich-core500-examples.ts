/** Fetch canonical ayah text/translations for the prepared corpus links. No DB writes. */
import fs from "node:fs";
import path from "node:path";
import { canonicalCoreAyah, coreExampleSetSchema } from "../lib/core500Examples";
import { alignCorpusOccurrence } from "../lib/core500Alignment";

async function main() {
  const contentDir = path.join(__dirname, "../content");
  const mirrorPath = path.join(contentDir, "core500-ayah-examples.json");
  if (fs.existsSync(mirrorPath) && JSON.parse(fs.readFileSync(mirrorPath, "utf8")).words.some((w: { status: string }) => w.status === "PUBLISHED")) {
    throw new Error("The mirror contains reviewed examples. Preserve it and reconcile new candidates separately before re-enriching.");
  }
  const candidates = JSON.parse(fs.readFileSync(path.join(contentDir, "core500-example-candidates.json"), "utf8"));
  const cachePath = path.join(process.env.TEMP ?? contentDir, "warsh-core500-canonical-cache.json");
  const cache: Record<string, Awaited<ReturnType<typeof canonicalCoreAyah>>> = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};
  const chaptersResponse = await fetch("https://api.quran.com/api/v4/chapters?language=en");
  if (!chaptersResponse.ok) throw new Error("Could not load canonical surah names");
  const chapters = (await chaptersResponse.json()).chapters as { id: number; name_simple: string }[];
  const keys = [...new Set<string>(candidates.words.flatMap((w: { examples: { surahNumber: number; ayahNumber: number }[] }) => w.examples.map(e => `${e.surahNumber}:${e.ayahNumber}`)))];
  const queue = keys.filter(key => !cache[key]);
  let fetched = 0;
  console.log(`${keys.length} distinct ayahs; ${queue.length} to fetch`);
  async function worker() {
    while (queue.length) {
      const key = queue.shift()!;
      const [s, a] = key.split(":").map(Number);
      for (let attempt = 0; ; attempt++) {
        try { cache[key] = await canonicalCoreAyah(s, a); break; }
        catch (err) { if (attempt >= 3) throw err; await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); }
      }
      fetched++;
      if (fetched % 20 === 0) { fs.writeFileSync(cachePath, JSON.stringify(cache)); console.log(`Fetched ${fetched} ayahs`); }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  fs.writeFileSync(cachePath, JSON.stringify(cache));
  const words = candidates.words.map((word: { rank: number; headword: string; lemmas: string[]; examples: { surahNumber: number; ayahNumber: number; wordPosition: number; segment: string; corpusSurface: string }[] }) => ({
    rank: word.rank, headword: word.headword, lemmas: word.lemmas, status: "DRAFT",
    examples: coreExampleSetSchema.parse(word.examples.map(e => {
      const canonical = cache[`${e.surahNumber}:${e.ayahNumber}`];
      const wordPosition = alignCorpusOccurrence(canonical.arabic, e.corpusSurface, e.segment, e.wordPosition);
      const surface = canonical.arabic.split(/\s+/)[wordPosition - 1];
      if (!surface) throw new Error(`Missing surface for rank ${word.rank}`);
      return { ...canonical, surahNumber: e.surahNumber, ayahNumber: e.ayahNumber,
        surahName: chapters.find(c => c.id === e.surahNumber)!.name_simple, wordPosition, corpusPosition: e.wordPosition, surface,
        matchKind: word.lemmas[0].startsWith("prefix:") ? "prefix" : surface === word.headword ? "exact" : "inflected",
        source: `https://corpus.quran.com/wordmorphology.jsp?location=(${e.surahNumber}:${e.ayahNumber}:${e.wordPosition})`,
      };
    })),
  }));
  fs.writeFileSync(path.join(contentDir, "core500-ayah-examples.json"), JSON.stringify({
    corpusSource: "https://corpus.quran.com/", canonicalSource: "https://api.quran.com/api/v4",
    translationResources: { en: 20, ur: 234 }, reviewStatus: "Canonical text verified; pedagogical review required before publish", words,
  }, null, 2) + "\n");
  console.log(`Validated ${words.length} words / ${words.length * 3} example links. Saved as DRAFT.`);
}
main().catch(err => { console.error(err); process.exitCode = 1; });
