/**
 * Restore the 11 Tadabbur Surahs to TadabburSurah.
 *
 * Production held zero TadabburSurah rows, so `/api/tadabbur` returned an empty
 * `surahs` array with a null `focusSurahId`, and the Learn tab's Tadabbur card
 * silently stopped rendering (it only mounts when a focus surah resolves).
 *
 * `prisma/seed.cjs` is the only code here that removes them: it calls
 * `tadabburSurah.deleteMany()` early and re-seeds via `seedTadabbur` at the very
 * end, so a run that wipes and then does not finish leaves exactly this state —
 * the same incident that stranded the curriculum vocabulary.
 *
 * This differs from calling `seedTadabbur` directly in two ways that matter
 * against production:
 *   - it never touches `userSurahProgress`, which the seeder deletes wholesale;
 *   - it is additive and idempotent, inserting only the surahs whose
 *     `surahNumber` is absent and never updating or deleting an existing row.
 *
 * Word-level `vocabId` links are resolved against the CURRENT
 * `VocabularyWord.arabicPlain` rows, so this must run after any vocabulary
 * restore — vocabulary re-created with new ids would otherwise leave every link
 * null and every surah reading 0% comprehension.
 *
 * Surahs are created as PUBLISHED: they are static reference content with no
 * generated media to wait on, and they were PUBLISHED before the wipe.
 *
 * `--relink` rewrites the `vocabId` on surahs that already exist, leaving their
 * text, order and publish state alone. That is the repair pass after a
 * vocabulary restore hands every word a new id, and after a correction to a
 * `vocabKey` in the seed.
 *
 *   npm run content:restore-tadabbur                       # dry run
 *   npm run content:restore-tadabbur -- --apply            # insert missing surahs
 *   npm run content:restore-tadabbur -- --relink           # preview relinking
 *   npm run content:restore-tadabbur -- --relink --apply   # rewrite vocabIds
 */

require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { SURAHS } = require("../prisma/tadabbur-seed.cjs");

const APPLY = process.argv.includes("--apply");
const RELINK = process.argv.includes("--relink");

function stripHarakat(text) {
  return String(text).replace(/[ً-ٰٟ]/g, "").trim();
}

function tokenize(arabic) {
  return String(arabic).trim().split(/\s+/).filter(Boolean);
}

/**
 * Rewrite `vocabId` on the surahs already in the database from the current
 * vocabulary, keeping every other field — including learner-visible text and
 * publish state — exactly as it is.
 */
async function relink(prisma, vocabMap) {
  const rows = await prisma.tadabburSurah.findMany({
    select: { id: true, surahNumber: true, nameEn: true, ayatData: true },
    orderBy: { orderInProg: "asc" },
  });
  const seedByNumber = new Map(SURAHS.map((s) => [s.surahNumber, s]));

  let changedSurahs = 0;
  let changedWords = 0;
  let declared = 0;
  let resolved = 0;

  for (const row of rows) {
    const seed = seedByNumber.get(row.surahNumber);
    if (!seed) {
      console.log(`  ? ${row.nameEn} (Surah ${row.surahNumber}) has no seed entry — skipped`);
      continue;
    }

    let surahChanged = false;
    const ayatData = (row.ayatData ?? []).map((ayah) => {
      const seedAyah = seed.ayat.find((a) => a.n === ayah.ayahNumber);
      const words = (ayah.words ?? []).map((word) => {
        const vocabKey = seedAyah?.ov?.[word.pos] ?? null;
        if (vocabKey) declared += 1;
        const vocabId = vocabKey ? (vocabMap[vocabKey] ?? null) : null;
        if (vocabId) resolved += 1;
        if (vocabId !== (word.vocabId ?? null)) {
          surahChanged = true;
          changedWords += 1;
        }
        return { ...word, vocabId };
      });
      return { ...ayah, words };
    });

    if (!surahChanged) continue;
    changedSurahs += 1;
    console.log(`  ~ ${row.nameEn} (Surah ${row.surahNumber})`);
    if (APPLY) {
      await prisma.tadabburSurah.update({ where: { id: row.id }, data: { ayatData } });
    }
  }

  console.log(
    `\n${changedWords} word link(s) across ${changedSurahs} Surah(s) would change. ` +
      `${resolved}/${declared} declared keys resolve.`,
  );
  if (!APPLY) console.log("\nDry run. Re-run with --relink --apply to write.");
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "", max: 3 });
  const prisma = new PrismaClient({ adapter });

  try {
    // Some words exist twice under one arabicPlain — the Core 500 row and a
    // curriculum row that says the same thing (رحمن, إذا). Order by quranicRank so
    // the Core 500 row always wins and the link is stable across runs: that is the
    // row a learner actually drills, so it is the one whose mastery should count.
    const allVocab = await prisma.vocabularyWord.findMany({
      select: { id: true, arabicPlain: true, quranicRank: true },
      orderBy: [{ quranicRank: { sort: "asc", nulls: "last" } }, { sortOrder: "asc" }],
    });
    const vocabMap = {};
    for (const v of allVocab) {
      if (v.arabicPlain && !vocabMap[v.arabicPlain]) vocabMap[v.arabicPlain] = v.id;
    }
    console.log(`Vocabulary rows available for linking: ${allVocab.length}`);

    const existing = await prisma.tadabburSurah.findMany({
      select: { surahNumber: true, nameEn: true, status: true },
    });
    const existingNumbers = new Set(existing.map((s) => s.surahNumber));
    console.log(`Existing Tadabbur Surahs: ${existing.length}`);

    if (RELINK) {
      await relink(prisma, vocabMap);
      return;
    }

    const missing = SURAHS.filter((s) => !existingNumbers.has(s.surahNumber));
    if (missing.length === 0) {
      console.log("Nothing to restore — every seed Surah is already present.");
      return;
    }

    let totalWords = 0;
    let linkedWords = 0;
    const payloads = missing.map((s) => {
      const ayatData = s.ayat.map((ayah) => {
        const wordList = tokenize(ayah.ar).map((w, pos) => {
          const plain = stripHarakat(w);
          const vocabKey = ayah.ov?.[pos] ?? null;
          const vocabId = vocabKey ? (vocabMap[vocabKey] ?? null) : null;
          totalWords += 1;
          if (vocabId) linkedWords += 1;
          return { pos, arabic: w, arabicPlain: plain, vocabId };
        });
        return {
          ayahNumber: ayah.n,
          arabic: ayah.ar,
          translationEn: ayah.en,
          words: wordList,
        };
      });
      const linked = ayatData.reduce(
        (n, a) => n + a.words.filter((w) => w.vocabId).length,
        0,
      );
      return { surah: s, ayatData, linked };
    });

    for (const { surah, linked } of payloads) {
      console.log(
        `  + ${surah.nameEn} (Surah ${surah.surahNumber}, order ${surah.orderInProg}, ` +
          `${surah.totalAyat} ayat, ${linked} vocab-linked words)`,
      );
    }
    console.log(
      `\n${missing.length} Surah(s) to insert — ${linkedWords}/${totalWords} words link to a VocabularyWord.`,
    );

    if (!APPLY) {
      console.log("\nDry run. Re-run with --apply to insert.");
      return;
    }

    for (const { surah, ayatData } of payloads) {
      await prisma.tadabburSurah.create({
        data: {
          orderInProg: surah.orderInProg,
          surahNumber: surah.surahNumber,
          nameAr: surah.nameAr,
          nameEn: surah.nameEn,
          meaningEn: surah.meaningEn,
          totalAyat: surah.totalAyat,
          ayatData,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
    }

    const after = await prisma.tadabburSurah.count({ where: { status: "PUBLISHED" } });
    console.log(`\nInserted ${payloads.length} Surah(s). PUBLISHED Surahs now: ${after}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
