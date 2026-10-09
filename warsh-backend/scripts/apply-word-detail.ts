/** Scoped write of reviewed word-detail candidates (roots + Quran examples).
 * Dry run by default; pass --apply to write. Never touches a word that already
 * has a root or an example, and never anything else on the row.
 *   DATABASE_URL=... npx tsx scripts/apply-word-detail.ts [--apply]
 * Rows are matched by id, falling back to arabic + wordType (staging ids differ).
 */
import fs from "node:fs";
import path from "node:path";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const apply = process.argv.includes("--apply");
  const file = JSON.parse(fs.readFileSync(path.join(__dirname, "../content/word-detail-candidates.json"), "utf8")) as {
    roots: { id: string; arabic: string; root: string }[];
    examples: { id: string; arabic: string; quranicExample: Prisma.InputJsonValue }[];
  };
  const rows = await prisma.vocabularyWord.findMany({ select: { id: true, arabic: true, rootLetters: true, quranicExample: true } });
  const byId = new Map(rows.map(r => [r.id, r]));
  const byArabic = new Map<string, typeof rows>();
  for (const r of rows) byArabic.set(r.arabic, [...(byArabic.get(r.arabic) ?? []), r]);
  const find = (id: string, arabic: string) => byId.get(id) ?? (byArabic.get(arabic)?.length === 1 ? byArabic.get(arabic)![0] : undefined);

  let roots = 0, examples = 0, missing = 0;
  for (const c of file.roots) {
    const row = find(c.id, c.arabic);
    if (!row) { missing++; continue; }
    if (!apply) { if (!row.rootLetters) roots++; continue; }
    roots += (await prisma.vocabularyWord.updateMany({ where: { id: row.id, rootLetters: null }, data: { rootLetters: c.root } })).count;
  }
  for (const c of file.examples) {
    const row = find(c.id, c.arabic);
    if (!row) { missing++; continue; }
    if (!apply) { if (row.quranicExample === null) examples++; continue; }
    examples += (await prisma.vocabularyWord.updateMany({ where: { id: row.id, OR: [{ quranicExample: { equals: Prisma.JsonNull } }, { quranicExample: { equals: Prisma.DbNull } }] }, data: { quranicExample: c.quranicExample } })).count;
  }
  console.log(`${apply ? "APPLIED" : "DRY RUN"}: ${roots} roots, ${examples} examples, ${missing} candidates without a matching row`);
  await prisma.$disconnect();
}
main().catch(err => { console.error(err); process.exitCode = 1; });
