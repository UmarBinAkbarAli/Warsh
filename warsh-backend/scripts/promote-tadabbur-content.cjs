/**
 * Scoped production promotion for the An-Nas and Al-Falaq curriculum work.
 *
 * This intentionally avoids prisma/seed.cjs, which recreates vocabulary and
 * Tadabbur records. Existing lesson progress, vocabulary review state, and
 * Tadabbur progress are preserved.
 *
 * Usage:
 *   npm run content:promote-tadabbur              # dry run
 *   npm run content:promote-tadabbur -- --apply   # transactional write
 */

require("dotenv/config");

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { AN_NAS_VOCABULARY } = require("../prisma/vocab-additions-an-nas.cjs");
const { AL_FALAQ_VOCABULARY } = require("../prisma/vocab-additions-al-falaq.cjs");
const { SURAHS } = require("../prisma/tadabbur-seed.cjs");

const APPLY = process.argv.includes("--apply");
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");
const LESSON_KEYS = [
  [2, 3],
  [3, 2],
  [13, 3],
  [16, 4],
  [18, 2],
  [18, 6],
  [19, 6],
  [46, 4],
  [46, 6],
];
const SURAHS_TO_PROMOTE = new Set([113, 114]);
const VOCABULARY = [...AN_NAS_VOCABULARY, ...AL_FALAQ_VOCABULARY];

function fixturePath(chapterOrder, lessonOrder) {
  return path.join(
    FIXTURES_DIR,
    `chapter-${String(chapterOrder).padStart(2, "0")}-lesson-${String(lessonOrder).padStart(2, "0")}.json`,
  );
}

function buildAyatData(surah, vocabularyIds) {
  return surah.ayat.map((ayah) => ({
    ayahNumber: ayah.n,
    arabic: ayah.ar,
    translationEn: ayah.en,
    words: ayah.ar.trim().split(/\s+/).map((arabic, pos) => {
      const vocabKey = ayah.ov[pos] ?? null;
      return {
        pos,
        arabic,
        arabicPlain: arabic.replace(/[\u064B-\u065F\u0670]/g, "").trim(),
        vocabId: vocabKey ? (vocabularyIds.get(vocabKey) ?? null) : null,
      };
    }),
  }));
}

async function preparePlan(client) {
  const lessons = [];
  for (const [chapterOrder, lessonOrder] of LESSON_KEYS) {
    const fixture = JSON.parse(fs.readFileSync(fixturePath(chapterOrder, lessonOrder), "utf8"));
    const lesson = await client.lesson.findFirst({
      where: { chapter: { order: chapterOrder }, order: lessonOrder },
      select: { id: true },
    });
    if (!lesson) throw new Error(`Missing production lesson ch${chapterOrder} l${lessonOrder}`);
    lessons.push({ id: lesson.id, chapterOrder, lessonOrder, fixture });
  }

  const vocabulary = [];
  for (const word of VOCABULARY) {
    const matches = await client.vocabularyWord.findMany({
      where: {
        arabicPlain: word.arabicPlain,
        transliteration: word.transliteration,
      },
      select: { id: true, publishedAt: true },
    });
    if (matches.length > 1) {
      throw new Error(`Ambiguous vocabulary key "${word.arabicPlain}" (${matches.length} rows)`);
    }
    vocabulary.push({ word, existing: matches[0] ?? null });
  }

  return { lessons, vocabulary };
}

async function applyPlan(client, plan) {
  const now = new Date();
  const promotedVocabularyIds = new Map();

  for (const item of plan.lessons) {
    await client.lesson.update({
      where: { id: item.id },
      data: { content: item.fixture },
    });
  }

  for (const item of plan.vocabulary) {
    const data = {
      ...item.word,
      status: "PUBLISHED",
      publishedAt: item.existing?.publishedAt ?? now,
    };
    if (item.existing) {
      await client.vocabularyWord.update({ where: { id: item.existing.id }, data });
      promotedVocabularyIds.set(item.word.arabicPlain, item.existing.id);
    } else {
      const created = await client.vocabularyWord.create({ data, select: { id: true } });
      promotedVocabularyIds.set(item.word.arabicPlain, created.id);
    }
  }

  const allVocabulary = await client.vocabularyWord.findMany({
    select: { id: true, arabicPlain: true },
  });
  const vocabularyIds = new Map(allVocabulary.map((word) => [word.arabicPlain, word.id]));
  // Prefer the reviewed surah-specific sense when unvowelled Arabic is
  // homographic (for example, jinnah versus jannah).
  for (const [key, id] of promotedVocabularyIds) vocabularyIds.set(key, id);

  for (const surah of SURAHS.filter((item) => SURAHS_TO_PROMOTE.has(item.surahNumber))) {
    const data = {
      orderInProg: surah.orderInProg,
      nameAr: surah.nameAr,
      nameEn: surah.nameEn,
      meaningEn: surah.meaningEn,
      totalAyat: surah.totalAyat,
      ayatData: buildAyatData(surah, vocabularyIds),
      status: "PUBLISHED",
      publishedAt: now,
    };
    await client.tadabburSurah.upsert({
      where: { surahNumber: surah.surahNumber },
      update: data,
      create: { ...data, surahNumber: surah.surahNumber },
    });
  }
}

async function verify(client) {
  const surahs = await client.tadabburSurah.findMany({
    where: { surahNumber: { in: [...SURAHS_TO_PROMOTE] } },
    select: { nameEn: true, ayatData: true },
    orderBy: { orderInProg: "asc" },
  });
  if (surahs.length !== SURAHS_TO_PROMOTE.size) {
    throw new Error(`Expected ${SURAHS_TO_PROMOTE.size} promoted surahs, found ${surahs.length}`);
  }

  return surahs.map((surah) => {
    const words = surah.ayatData.flatMap((ayah) => ayah.words);
    const linked = words.filter((word) => word.vocabId).length;
    if (linked !== words.length) {
      throw new Error(`${surah.nameEn} has ${linked}/${words.length} linked tokens`);
    }
    return `${surah.nameEn}: ${linked}/${words.length} tokens linked`;
  });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });
  try {
    const plan = await preparePlan(prisma);
    console.log(`${APPLY ? "APPLY" : "DRY RUN"}: ${plan.lessons.length} lessons`);
    console.log(
      `${plan.vocabulary.filter((item) => item.existing).length} vocabulary updates, ` +
      `${plan.vocabulary.filter((item) => !item.existing).length} vocabulary inserts`,
    );
    console.log(`${SURAHS_TO_PROMOTE.size} Tadabbur surahs updated in place`);

    if (!APPLY) {
      console.log("No writes made. Re-run with --apply after reviewing this plan.");
      return;
    }

    await prisma.$transaction(async (tx) => applyPlan(tx, plan), {
      maxWait: 10_000,
      timeout: 60_000,
    });
    for (const line of await verify(prisma)) console.log(line);
    console.log("Scoped Tadabbur promotion completed; learner progress was preserved.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
