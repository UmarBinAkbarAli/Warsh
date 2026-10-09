/**
 * Fill the missing Urdu translation on Tadabbur ayat from the Junagarhi
 * translation the Mushaf reader already ships (warsh-app/data/quran/translations).
 *
 * Scoped and idempotent: only `ayatData[].translationUr` is written, only where
 * it is empty, and nothing else on the row changes. Safe against production;
 * never the full seed. A seed or restore recreates the rows without Urdu, so
 * re-run this afterwards.
 *
 *   npm run content:add-tadabbur-urdu             # dry run
 *   npm run content:add-tadabbur-urdu -- --apply  # write
 */

require("dotenv/config");

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const APPLY = process.argv.includes("--apply");
const JUNAGARHI = path.join(__dirname, "../../warsh-app/data/quran/translations/ur-junagarhi.json");

async function main() {
  const urdu = JSON.parse(fs.readFileSync(JUNAGARHI, "utf8"));
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "", max: 3 });
  const prisma = new PrismaClient({ adapter });
  try {
    const rows = await prisma.tadabburSurah.findMany({
      select: { id: true, surahNumber: true, nameEn: true, ayatData: true },
      orderBy: { orderInProg: "asc" },
    });
    let total = 0;
    for (const row of rows) {
      const source = urdu[row.surahNumber - 1];
      if (!source) throw new Error(`No Junagarhi text for Surah ${row.surahNumber}`);
      let filled = 0;
      const ayatData = (row.ayatData ?? []).map((ayah) => {
        if (typeof ayah.translationUr === "string" && ayah.translationUr.trim()) return ayah;
        const text = source[ayah.ayahNumber - 1];
        if (!text || !text.trim()) throw new Error(`Missing Junagarhi ayah ${row.surahNumber}:${ayah.ayahNumber}`);
        filled += 1;
        return { ...ayah, translationUr: text.trim() };
      });
      total += filled;
      console.log(`  ${row.nameEn} (Surah ${row.surahNumber}): ${filled}/${ayatData.length} ayat filled`);
      if (APPLY && filled > 0) await prisma.tadabburSurah.update({ where: { id: row.id }, data: { ayatData } });
    }
    console.log(`\n${total} ayat ${APPLY ? "written" : "would be written"} across ${rows.length} Surahs.`);
    if (!APPLY) console.log("Dry run. Re-run with --apply to write.");
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((err) => { console.error(err); process.exitCode = 1; });
