/**
 * Scoped publish for the Quranic Core 500 vocabulary.
 *
 * The Core 500 shipped to production as 500 DRAFT rows. Every learner-facing
 * vocabulary route filters `status: "PUBLISHED"` — /api/vocabulary/words,
 * /api/vocabulary/word-of-day and /api/core500 — so the Vocabulary tab, Word of
 * the Day and the Core 500 screen were all empty for every user while the tab
 * itself was live.
 *
 * This applies exactly what POST /api/admin/publish applies for a single word
 * (`status: PUBLISHED` plus a `publishedAt` stamp), in one transaction, rather
 * than 500 sequential HTTP calls. It deliberately avoids prisma/seed.cjs, which
 * recreates vocabulary rows and would discard learner review state.
 *
 * A word with no audio is refused by default: publishing one strands the play
 * button on a 404, because runtime lookup has no generation fallback. Run
 * `npm run audio:prebuild-catalog:db` first, or pass --allow-missing-audio to
 * publish anyway.
 *
 * Usage:
 *   npm run content:publish-core500                 # dry run
 *   npm run content:publish-core500 -- --apply      # transactional write
 *   npm run content:publish-core500 -- --unpublish  # take them dark again
 */

require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const APPLY = process.argv.includes("--apply");
const UNPUBLISH = process.argv.includes("--unpublish");
const ALLOW_MISSING_AUDIO = process.argv.includes("--allow-missing-audio");

// The Core 500 is exactly the words carrying a quranicRank. Anything else in
// VocabularyWord is curriculum vocabulary and is not this script's business.
const CORE_500 = { quranicRank: { not: null } };

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const words = await prisma.vocabularyWord.findMany({
      where: CORE_500,
      select: { id: true, arabic: true, status: true, audioUrl: true, quranicRank: true },
      orderBy: { quranicRank: "asc" },
    });

    if (words.length === 0) {
      console.error("No Core 500 words found (no rows with a quranicRank). Nothing to do.");
      process.exitCode = 1;
      return;
    }

    const target = UNPUBLISH ? "DRAFT" : "PUBLISHED";
    const alreadyThere = words.filter((word) => word.status === target);
    const toChange = words.filter((word) => word.status !== target);
    const missingAudio = words.filter((word) => !word.audioUrl);

    console.log(`Core 500 rows found: ${words.length}`);
    console.log(`Ranks covered: ${words[0].quranicRank}–${words[words.length - 1].quranicRank}`);
    console.log(`Already ${target}: ${alreadyThere.length}`);
    console.log(`Will become ${target}: ${toChange.length}`);
    console.log(`Missing audioUrl: ${missingAudio.length}`);

    if (!UNPUBLISH && missingAudio.length > 0 && !ALLOW_MISSING_AUDIO) {
      for (const word of missingAudio.slice(0, 10)) {
        console.error(`[no-audio] rank ${word.quranicRank} ${word.arabic} (${word.id})`);
      }
      console.error(
        `\nRefusing to publish: ${missingAudio.length} word(s) have no audio. ` +
          "Run `npm run audio:prebuild-catalog:db` first, or pass --allow-missing-audio.",
      );
      process.exitCode = 1;
      return;
    }

    if (toChange.length === 0) {
      console.log(`\nEvery Core 500 word is already ${target}. Nothing to write.`);
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
      where: { ...CORE_500, status: { not: target } },
      data,
    });

    const published = await prisma.vocabularyWord.count({
      where: { ...CORE_500, status: "PUBLISHED" },
    });
    console.log(`\nUpdated ${result.count} word(s). Core 500 now PUBLISHED: ${published}/${words.length}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
