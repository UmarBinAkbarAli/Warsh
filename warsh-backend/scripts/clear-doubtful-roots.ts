/** One-off scoped fix (2026-10-09): clear two roots the owner chose to leave blank.
 * عَصا (staff) and عاد (Aad): the corpus root is doubtful. Only touches those rows,
 * and only while they still hold the loaded value. Dry run by default; pass --apply.
 *   DATABASE_URL=... npx tsx scripts/clear-doubtful-roots.ts [--apply]
 */
import { prisma } from "../lib/prisma";

const TARGETS = [
  { id: "cmtrh9r45008g9k5kx3ddehs5", root: "ع ص ي" },
  { id: "cmtrh9r45009v9k5klt73c0i7", root: "ع د و" },
];

async function main() {
  const apply = process.argv.includes("--apply");
  let n = 0;
  for (const t of TARGETS) {
    const where = { id: t.id, rootLetters: t.root };
    n += apply ? (await prisma.vocabularyWord.updateMany({ where, data: { rootLetters: null } })).count : await prisma.vocabularyWord.count({ where });
  }
  console.log(`${apply ? "APPLIED" : "DRY RUN"}: ${n} of ${TARGETS.length} roots ${apply ? "cleared" : "would be cleared"}`);
  await prisma.$disconnect();
}
main().catch(err => { console.error(err); process.exitCode = 1; });
