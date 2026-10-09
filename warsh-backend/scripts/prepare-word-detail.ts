/** Offline candidates for the word-detail screen: missing roots and Quran examples.
 * No database writes. Usage:
 *   npx tsx scripts/prepare-word-detail.ts --cands=PATH --words=PATH
 * `--cands` is the corpus match (id, lemma, corproot, occurrence); `--words` the
 * exported VocabularyWord rows. Output is content/word-detail-candidates.json,
 * which the owner reviews before anything is applied. Roots are only proposed
 * for words that have none; an existing root is never overridden.
 */
import fs from "node:fs";
import path from "node:path";
import { canonicalCoreAyah } from "../lib/core500Examples";
import { alignCorpusOccurrence } from "../lib/core500Alignment";

const arg = (name: string) => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const candsPath = arg("cands"), wordsPath = arg("words");
if (!candsPath || !wordsPath) throw new Error("--cands=PATH and --words=PATH are required");

type Cand = { id: string; arabic: string; en: string; core: boolean; hasEx: boolean; dbroot: string | null; corproot?: string; ambiguous: boolean; exact: boolean;
  occurrence?: { surah: number; ayah: number; pos: number; segment: string; corpusSurface: string; verseWords: number } };

async function main() {
  const contentDir = path.join(__dirname, "../content");
  const cands = JSON.parse(fs.readFileSync(candsPath!, "utf8")) as Cand[];
  const words = JSON.parse(fs.readFileSync(wordsPath!, "utf8")) as { id: string; quranicRank: number | null }[];
  const rankById = new Map(words.map(w => [w.id, w.quranicRank]));
  const core = JSON.parse(fs.readFileSync(path.join(contentDir, "core500-ayah-examples.json"), "utf8")).words as
    { rank: number; status: string; examples: { surahNumber: number; ayahNumber: number; surahName: string; arabic: string; translationEn: string; translationUr: string; wordPosition: number }[] }[];
  const coreByRank = new Map(core.filter(w => w.status === "PUBLISHED").map(w => [w.rank, w]));

  const chaptersResponse = await fetch("https://api.quran.com/api/v4/chapters?language=en");
  if (!chaptersResponse.ok) throw new Error("Could not load surah names");
  const chapters = (await chaptersResponse.json()).chapters as { id: number; name_simple: string; name_arabic: string }[];
  const chapter = (n: number) => chapters.find(c => c.id === n)!;
  const asExample = (s: number, a: number, arabic: string, wordPosition: number, en: string, ur: string) => ({
    surahNumber: s, surahNameAr: chapter(s).name_arabic, surahNameEn: chapter(s).name_simple,
    ayahNumber: a, ayahArabic: arabic, wordPosition, translationEn: en, translationUr: ur });

  const roots = cands.filter(c => !c.dbroot && c.corproot).map(c => ({
    id: c.id, arabic: c.arabic, en: c.en, root: c.corproot!, confidence: c.exact ? "high" : "check", status: "DRAFT" }));

  const examples: unknown[] = [];
  for (const c of cands) {
    if (c.hasEx) continue;
    const rank = rankById.get(c.id);
    if (c.core && rank && coreByRank.has(rank)) {
      const e = coreByRank.get(rank)!.examples[0];
      examples.push({ id: c.id, arabic: c.arabic, origin: "core500", status: "DRAFT",
        quranicExample: asExample(e.surahNumber, e.ayahNumber, e.arabic, e.wordPosition, e.translationEn, e.translationUr) });
    } else if (c.occurrence) {
      const o = c.occurrence;
      let canonical;
      for (let attempt = 0; ; attempt++) {
        try { canonical = await canonicalCoreAyah(o.surah, o.ayah); break; }
        catch (err) { if (attempt >= 3) throw err; await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); }
      }
      let pos: number;
      try { pos = alignCorpusOccurrence(canonical.arabic, o.corpusSurface, o.segment, o.pos); }
      catch (err) { console.warn(`skip ${c.arabic}: ${(err as Error).message}`); continue; }
      examples.push({ id: c.id, arabic: c.arabic, origin: "corpus", status: "DRAFT",
        quranicExample: asExample(o.surah, o.ayah, canonical.arabic, pos, canonical.translationEn, canonical.translationUr) });
    }
  }
  fs.writeFileSync(path.join(contentDir, "word-detail-candidates.json"), JSON.stringify({
    corpusSource: "https://corpus.quran.com/ (Quranic Arabic Corpus v0.4, GNU GPL)", canonicalSource: "https://api.quran.com/api/v4",
    translationResources: { en: 20, ur: 234 }, reviewStatus: "DRAFT — owner review required before any database write", roots, examples }, null, 2) + "\n");
  console.log(`${roots.length} root candidates (${roots.filter(r => r.confidence === "check").length} to check); ${examples.length} example candidates`);
}
main().catch(err => { console.error(err); process.exitCode = 1; });
