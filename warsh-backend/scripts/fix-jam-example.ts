/** One-off scoped fix (2026-10-09): the جَمْع example (100:5) was a sentence fragment.
 * Replaces it with 54:45, a complete sentence. Only touches that one row, and only
 * while it still holds the old fragment. Dry run by default; pass --apply.
 *   DATABASE_URL=... npx tsx scripts/fix-jam-example.ts [--apply]
 */
import { prisma } from "../lib/prisma";

const ID = "cmtvrdagz00bw585k9gcoxfcy";
const OLD_EN = "Arriving thereby in the center collectively,";
const NEXT = {
  surahNumber: 54,
  surahNameAr: "القمر",
  surahNameEn: "Al-Qamar",
  ayahNumber: 45,
  ayahArabic: "سَيُهْزَمُ ٱلْجَمْعُ وَيُوَلُّونَ ٱلدُّبُرَ",
  wordPosition: 2,
  translationEn: "[Their] assembly will be defeated, and they will turn their backs [in retreat].",
  translationUr: "عنقریب یہ جماعت شکست کھائے گی اور یہ لوگ پیٹھ پھیر کر بھاگ جائیں گے",
};

async function main() {
  const apply = process.argv.includes("--apply");
  const row = await prisma.vocabularyWord.findUnique({ where: { id: ID }, select: { arabic: true, quranicExample: true } });
  const cur = row?.quranicExample as { translationEn?: string } | null;
  if (!row || cur?.translationEn !== OLD_EN) {
    console.log(`SKIP: row ${row ? `${row.arabic} no longer holds the old fragment` : "not found"}`);
  } else if (!apply) {
    console.log(`DRY RUN: would replace ${row.arabic} example with 54:45`);
  } else {
    await prisma.vocabularyWord.update({ where: { id: ID }, data: { quranicExample: NEXT } });
    console.log(`APPLIED: ${row.arabic} example is now 54:45`);
  }
  await prisma.$disconnect();
}
main().catch(err => { console.error(err); process.exitCode = 1; });
