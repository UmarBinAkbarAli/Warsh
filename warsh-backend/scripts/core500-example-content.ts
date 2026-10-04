/** Feature-scoped mirror/import, never reseeds VocabularyWord or Lesson.
 * Validate/plan: npx tsx scripts/core500-example-content.ts
 * Local apply: set DATABASE_URL explicitly, then append --apply
 * Export Studio edits: append --export (requires explicit DATABASE_URL)
 * Optional --set=1 scopes import/export to five words.
 */
import fs from "node:fs";
import path from "node:path";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { coreExampleSchema, coreExampleSetSchema, type CoreExample } from "../lib/core500Examples";

type ContentWord = { rank: number; headword: string; lemmas: string[]; status: "DRAFT" | "PUBLISHED"; examples: CoreExample[] };
const file = path.join(__dirname, "../content/core500-ayah-examples.json");
async function main() {
  const doc = JSON.parse(fs.readFileSync(file, "utf8")) as { words: ContentWord[] };
  if (doc.words.length !== 500 || new Set(doc.words.map(w => w.rank)).size !== 500 || doc.words.some(w => w.rank < 1 || w.rank > 500)) throw new Error("500 unique ranks required.");
  for (const w of doc.words) {
    coreExampleSetSchema.parse(w.examples);
    if (!["DRAFT", "PUBLISHED"].includes(w.status)) throw new Error(`Invalid status at rank ${w.rank}`);
  }
  console.log("Valid: 500 words, 1500 distinct-per-word canonical example links.");
  const setArg = process.argv.find(a => a.startsWith("--set="))?.slice(6);
  const set = setArg ? Number(setArg) : undefined;
  if (set !== undefined && (!Number.isInteger(set) || set < 1 || set > 100)) throw new Error("Invalid set.");
  if (!process.argv.includes("--apply") && !process.argv.includes("--export")) { console.log("No database writes. Use --apply with an explicit DATABASE_URL after review."); return; }
  if (!process.env.DATABASE_URL) throw new Error("An explicit DATABASE_URL is required; this script does not load .env.");
  const scope = doc.words.filter(w => set === undefined || Math.floor((w.rank - 1) / 5) + 1 === set);
  const rows = await prisma.vocabularyWord.findMany({ where: { quranicRank: { in: scope.map(w => w.rank) } }, select: { id: true, arabic: true, quranicRank: true, coreAyahExamples: { orderBy: { position: "asc" } } } });
  if (rows.length !== scope.length) throw new Error("All scoped vocabulary ranks must exist first. No word rows will be created.");
  const records = (row: typeof rows[number]) => row.coreAyahExamples.map(({ id: _id, wordId: _word, position: _position, status: _status, updatedAt: _date, ...e }) => e);
  if (process.argv.includes("--export")) {
    for (const row of rows) {
      const word = doc.words.find(w => w.rank === row.quranicRank)!;
      coreExampleSetSchema.parse(records(row));
      word.examples = records(row) as CoreExample[];
      word.status = row.coreAyahExamples.every(e => e.status === "PUBLISHED") ? "PUBLISHED" : "DRAFT";
    }
    fs.writeFileSync(file, JSON.stringify(doc, null, 2) + "\n");
    console.log(`Exported ${rows.length} Core 500 words. Vocabulary and lesson content unchanged.`); return;
  }
  // Refuse to overwrite any Studio edits or draft/published decisions.
  for (const row of rows) {
    const word = scope.find(w => w.rank === row.quranicRank)!;
    const same = JSON.stringify(records(row).map(e => coreExampleSchema.parse(e))) === JSON.stringify(word.examples.map(e => coreExampleSchema.parse(e)))
      && row.coreAyahExamples.every(e => e.status === word.status);
    if (row.coreAyahExamples.length && !same) throw new Error(`Rank ${row.quranicRank} differs from the mirror. Export/reconcile Studio changes first.`);
  }
  const missing = rows.filter(row => !row.coreAyahExamples.length);
  if (missing.length) await prisma.$transaction(async tx => {
    const wordIds = missing.map(row => row.id);
    // Lock in a stable order and insert together, avoiding hundreds of network
    // round trips while retaining the same Studio conflict protection.
    await tx.$queryRaw(Prisma.sql`SELECT "id" FROM "VocabularyWord" WHERE "id" IN (${Prisma.join(wordIds)}) ORDER BY "id" FOR UPDATE`);
    if (await tx.core500AyahExample.count({ where: { wordId: { in: wordIds } } })) throw new Error("Examples changed during import; reload and reconcile.");
    await tx.core500AyahExample.createMany({ data: missing.flatMap(row => {
      const word = scope.find(w => w.rank === row.quranicRank)!;
      return word.examples.map((e, i) => ({ ...e, wordId: row.id, position: i + 1, status: word.status }));
    }) });
  }, { timeout: 60000 });
  console.log(`Imported missing examples for ${rows.length} Core 500 words. Existing word IDs and learner records preserved.`);
}
main().catch(err => { console.error(err instanceof Error ? err.message : err); process.exitCode = 1; }).finally(() => prisma.$disconnect());
