/**
 * Scoped publish for vocabulary words.
 *
 * Every learner-facing vocabulary route filters `status: "PUBLISHED"` —
 * /api/vocabulary/words, /api/vocabulary/word-of-day and /api/core500 — so a
 * DRAFT word is invisible in the app even though its row exists. The Core 500
 * shipped as 500 DRAFT rows and was published this way on 2026-09-10.
 *
 * This applies exactly what POST /api/admin/publish applies for a single word
 * (`status: PUBLISHED` plus a `publishedAt` stamp), in one statement, rather
 * than one HTTP call per word. It deliberately avoids prisma/seed.cjs, which
 * calls vocabularyWord.deleteMany() and would discard learner review state.
 *
 * A word with no audio is refused by default: publishing one strands the play
 * button on a 404, because runtime lookup has no generation fallback. Run
 * `npm run audio:prebuild-catalog:db` first, or pass --allow-missing-audio.
 *
 * Scopes:
 *   core500     words carrying a quranicRank (the Quranic Core 500)
 *   curriculum  every other word (the lesson vocabulary)
 *   all         both
 *
 * Usage:
 *   npm run content:publish-vocabulary -- --scope=curriculum
 *   npm run content:publish-vocabulary -- --scope=curriculum --apply
 *   npm run content:publish-vocabulary -- --scope=all --unpublish --apply
 */

require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const APPLY = process.argv.includes("--apply");
const UNPUBLISH = process.argv.includes("--unpublish");
const ALLOW_MISSING_AUDIO = process.argv.includes("--allow-missing-audio");

// The Core 500 is exactly the words carrying a quranicRank; everything else in
// VocabularyWord is curriculum vocabulary.
const SCOPES = {
  core500: { quranicRank: { not: null } },
  curriculum: { quranicRank: null },
  all: {},
};

const scopeArg = process.argv.find((arg) => arg.startsWith("--scope="));
const SCOPE_NAME = scopeArg ? scopeArg.slice("--scope=".length) : "core500";
const SCOPE = SCOPES[SCOPE_NAME];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
  if (!SCOPE) {
    throw new Error(`Unknown --scope=${SCOPE_NAME}. Expected one of: ${Object.keys(SCOPES).join(", ")}.`);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const words = await prisma.vocabularyWord.findMany({
      where: SCOPE,
      select: { id: true, arabic: true, status: true, audioUrl: true, quranicRank: true },
      orderBy: { sortOrder: "asc" },
    });

    if (words.length === 0) {
      console.error(`No words matched --scope=${SCOPE_NAME}. Nothing to do.`);
      process.exitCode = 1;
      return;
    }

    const target = UNPUBLISH ? "DRAFT" : "PUBLISHED";
    const alreadyThere = words.filter((word) => word.status === target);
    const toChange = words.filter((word) => word.status !== target);
    const missingAudio = words.filter((word) => !word.audioUrl);

    console.log(`Scope: ${SCOPE_NAME}`);
    console.log(`Rows matched: ${words.length}`);
    console.log(`Already ${target}: ${alreadyThere.length}`);
    console.log(`Will become ${target}: ${toChange.length}`);
    console.log(`Missing audioUrl: ${missingAudio.length}`);

    if (!UNPUBLISH && missingAudio.length > 0 && !ALLOW_MISSING_AUDIO) {
      for (const word of missingAudio.slice(0, 10)) {
        console.error(`[no-audio] ${word.arabic} (${word.id})`);
      }
      console.error(
        `\nRefusing to publish: ${missingAudio.length} word(s) have no audio. ` +
          "Run `npm run audio:prebuild-catalog:db` first, or pass --allow-missing-audio.",
      );
      process.exitCode = 1;
      return;
    }

    if (toChange.length === 0) {
      console.log(`\nEvery word in --scope=${SCOPE_NAME} is already ${target}. Nothing to write.`);
      return;
    }

    if (!APPLY) {
      console.log("\nDry run. Re-run with --apply to write.");
      return;
    }

    // Mirrors POST /api/admin/publish: stamp publishedAt when content goes live,
    // and leave the existing stamp in place on unpublish so it still records
    // when the word was last live.
    const data = UNPUBLISH
      ? { status: "DRAFT" }
      : { status: "PUBLISHED", publishedAt: new Date() };

    const result = await prisma.vocabularyWord.updateMany({
      where: { ...SCOPE, status: { not: target } },
      data,
    });

    const published = await prisma.vocabularyWord.count({
      where: { ...SCOPE, status: "PUBLISHED" },
    });
    console.log(`\nUpdated ${result.count} word(s). Scope ${SCOPE_NAME} now PUBLISHED: ${published}/${words.length}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
