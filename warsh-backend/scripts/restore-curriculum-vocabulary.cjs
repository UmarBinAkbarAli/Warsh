/**
 * Restore the curriculum vocabulary to VocabularyWord.
 *
 * Production held only the Quranic Core 500 (every row created 2026-09-07 16:51,
 * every row carrying a quranicRank). The ~600 curriculum words — family, body,
 * home, school, food, travel, marketplace — were absent, so a learner who met a
 * word in a lesson could not find it in the Vocabulary tab.
 *
 * `prisma/seed.cjs` is the only code here that removes them: it calls
 * `vocabularyWord.deleteMany()` before re-seeding. That is why AGENTS.md says
 * never to run the production seed casually — a run that wipes and then does not
 * finish leaves exactly this state.
 *
 * The insert pass is additive and idempotent. It only INSERTs words that are
 * absent and never updates or deletes an existing row, so Core 500 glosses,
 * learner SRS state and review history are untouched.
 *
 * A seed word counts as already present when an existing row has the exact same
 * vowelled Arabic, OR the same letters ignoring harakat AND an overlapping
 * English gloss. The first half is scripts/load-core-500.ts's rule, which keeps
 * near-pairs like مِن (from) and مَن (who) apart. The second half is what that
 * rule alone misses: the Core 500 writes some long vowels bare (سَماء) where the
 * curriculum writes them marked (سَمَاء) — the same word twice. Requiring the
 * glosses to overlap is what separates those from real near-pairs.
 *
 * `--dedupe` cleans up rows a previous run inserted under the stricter rule: it
 * folds the curriculum row's topics and grammar metadata into the Core 500 row
 * that already carries the learner's review state, then deletes the duplicate.
 *
 * Words are created as DRAFT with no audio. Publish them only after
 * `npm run audio:prebuild-catalog:db` has generated their clips:
 *
 *   npm run content:restore-curriculum                       # dry run
 *   npm run content:restore-curriculum -- --apply            # insert as DRAFT
 *   npm run content:restore-curriculum -- --dedupe           # preview merges
 *   npm run content:restore-curriculum -- --dedupe --apply   # merge duplicates
 *   npm run audio:prebuild-catalog:db                        # generate audio
 *   npm run content:publish-vocabulary -- --scope=curriculum --apply
 */

require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { VOCABULARY_WORDS } = require("../prisma/vocabulary-seed.cjs");

const APPLY = process.argv.includes("--apply");
const DEDUPE = process.argv.includes("--dedupe");

// Harakat, tatweel and the dagger alif. Stripping them turns سَمَاء and سَماء into
// the same string without changing which letters are present.
const DIACRITICS = /[ً-ْـٰ]/g;

// Core 500 rows own sortOrder 1-500 (it mirrors quranicRank), and the browse
// list is ordered by sortOrder alone. Curriculum words keep their own relative
// order but are pushed clear of that range so the two sets do not interleave.
const SORT_ORDER_OFFSET = 1000;

function bareLetters(arabic) {
  return String(arabic).replace(DIACRITICS, "");
}

function glosses(english) {
  return String(english || "")
    .toLowerCase()
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function sharesMeaning(a, b) {
  const right = glosses(b);
  return glosses(a).some((part) => right.includes(part));
}

// Exact vowelled match, or the same letters carrying an overlapping meaning.
function isSameWord(seedWord, row) {
  if (seedWord.arabic === row.arabic) return true;
  if (bareLetters(seedWord.arabic) !== bareLetters(row.arabic)) return false;
  return sharesMeaning(seedWord.translationEn, row.translationEn);
}

function indexByLetters(rows) {
  const index = new Map();
  for (const row of rows) {
    const key = bareLetters(row.arabic);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(row);
  }
  return index;
}

function dedupeSeedByArabic(words) {
  const seen = new Set();
  const unique = [];
  const duplicates = [];
  for (const word of words) {
    if (seen.has(word.arabic)) {
      duplicates.push(word.arabic);
      continue;
    }
    seen.add(word.arabic);
    unique.push(word);
  }
  return { unique, duplicates };
}

/**
 * Folds a curriculum row into the Core 500 row that duplicates it. The Core 500
 * row is the one kept: it carries quranicRank, coreSetNumber and any learner
 * review state. What the curriculum row has that it lacks — topic categories,
 * gender, plural, root letters — is copied across first, so topic browsing and
 * the grammar fields survive the merge.
 */
async function runDedupe(prisma, existing) {
  const core = existing.filter((row) => row.quranicRank !== null);
  const curriculum = existing.filter((row) => row.quranicRank === null);
  const coreByLetters = indexByLetters(core);

  const merges = [];
  for (const row of curriculum) {
    const candidates = coreByLetters.get(bareLetters(row.arabic)) || [];
    const match = candidates.find(
      (candidate) => candidate.arabic === row.arabic || sharesMeaning(row.translationEn, candidate.translationEn),
    );
    if (match) merges.push({ keep: match, drop: row });
  }

  console.log(`Curriculum rows            : ${curriculum.length}`);
  console.log(`Duplicating a Core 500 row : ${merges.length}`);
  for (const { keep, drop } of merges.slice(0, 10)) {
    console.log(`  keep ${keep.arabic} [rank ${keep.quranicRank}]  <-  drop ${drop.arabic}`);
  }

  if (merges.length === 0) {
    console.log("");
    console.log("No duplicates to merge.");
    return;
  }

  // A curriculum row a learner has already reviewed must not be deleted: the
  // cascade would take their SRS history with it.
  const referenced = await prisma.userVocabularyWord.count({
    where: { wordId: { in: merges.map((merge) => merge.drop.id) } },
  });
  if (referenced > 0) {
    console.error("");
    console.error(`Refusing to merge: ${referenced} learner row(s) point at words that would be deleted.`);
    process.exitCode = 1;
    return;
  }

  if (!APPLY) {
    console.log("");
    console.log("Dry run. Re-run with --dedupe --apply to merge.");
    return;
  }

  let enriched = 0;
  for (const { keep, drop } of merges) {
    const keepTopics = keep.topicCategories || [];
    const topics = [...new Set([...keepTopics, ...(drop.topicCategories || [])])];
    const patch = {};
    if (topics.length !== keepTopics.length) patch.topicCategories = topics;
    if (!keep.gender && drop.gender) patch.gender = drop.gender;
    if (!keep.pluralForm && drop.pluralForm) patch.pluralForm = drop.pluralForm;
    if (!keep.rootLetters && drop.rootLetters) patch.rootLetters = drop.rootLetters;
    if (Object.keys(patch).length > 0) {
      await prisma.vocabularyWord.update({ where: { id: keep.id }, data: patch });
      enriched++;
    }
  }

  const removed = await prisma.vocabularyWord.deleteMany({
    where: { id: { in: merges.map((merge) => merge.drop.id) } },
  });

  const total = await prisma.vocabularyWord.count();
  console.log("");
  console.log(`Enriched ${enriched} Core 500 row(s); deleted ${removed.count} duplicate(s). VocabularyWord now holds ${total} rows.`);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const existing = await prisma.vocabularyWord.findMany({
      select: {
        id: true,
        arabic: true,
        translationEn: true,
        quranicRank: true,
        gender: true,
        pluralForm: true,
        rootLetters: true,
        topicCategories: true,
      },
    });

    if (DEDUPE) {
      await runDedupe(prisma, existing);
      return;
    }

    const { unique: seedWords, duplicates } = dedupeSeedByArabic(VOCABULARY_WORDS);
    if (duplicates.length) {
      console.log(`Seed contains ${duplicates.length} duplicate headword(s), keeping the first of each: ${duplicates.join(", ")}`);
    }

    // Index by bare letters so the same-word check is a small lookup rather than
    // a scan of every existing row for every seed word.
    const byLetters = indexByLetters(existing);
    const missing = seedWords.filter(
      (word) => !(byLetters.get(bareLetters(word.arabic)) || []).some((row) => isSameWord(word, row)),
    );

    console.log(`Curriculum words in seed : ${seedWords.length}`);
    console.log(`Already in the database  : ${seedWords.length - missing.length}`);
    console.log(`Will be inserted (DRAFT) : ${missing.length}`);
    console.log(`Rows in VocabularyWord   : ${existing.length} before, ${existing.length + missing.length} after`);

    const incomplete = missing.filter(
      (word) =>
        !word.arabic ||
        !word.arabicPlain ||
        !word.transliteration ||
        !word.translationEn ||
        !word.translationUr ||
        !word.wordType,
    );
    if (incomplete.length) {
      for (const word of incomplete.slice(0, 10)) console.error(`[incomplete] ${word.arabic}`);
      console.error("");
      console.error(`Refusing to insert: ${incomplete.length} word(s) are missing required fields.`);
      process.exitCode = 1;
      return;
    }

    if (missing.length === 0) {
      console.log("");
      console.log("Nothing to insert; the curriculum vocabulary is already present.");
      return;
    }

    if (!APPLY) {
      console.log("");
      console.log(`Sample: ${missing.slice(0, 8).map((word) => `${word.arabic}=${word.translationEn}`).join(" | ")}`);
      console.log("Dry run. Re-run with --apply to write.");
      return;
    }

    const rows = missing.map((word) => ({
      arabic: word.arabic,
      arabicPlain: word.arabicPlain,
      transliteration: word.transliteration,
      translationEn: word.translationEn,
      translationUr: word.translationUr,
      wordType: word.wordType,
      gender: word.gender ?? null,
      pluralForm: word.pluralForm ?? null,
      rootLetters: word.rootLetters ?? null,
      topicCategories: word.topicCategories ?? [],
      chapterIntroduced: word.chapterIntroduced ?? 1,
      frequencyInQuran: word.frequencyInQuran ?? null,
      quranicExample: word.quranicExample ?? null,
      sortOrder: SORT_ORDER_OFFSET + (word.sortOrder ?? 0),
      // Deliberately DRAFT: publishing a word with no audio strands the play
      // button on a 404, because runtime lookup has no generation fallback.
      status: "DRAFT",
    }));

    const result = await prisma.vocabularyWord.createMany({ data: rows });

    const total = await prisma.vocabularyWord.count();
    const drafts = await prisma.vocabularyWord.count({ where: { status: "DRAFT" } });
    console.log("");
    console.log(`Inserted ${result.count} word(s). VocabularyWord now holds ${total} rows (${drafts} DRAFT).`);
    console.log("Next: npm run audio:prebuild-catalog:db, then");
    console.log("      npm run content:publish-vocabulary -- --scope=curriculum --apply");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
