/**
 * Bulk-upload vocabulary word illustrations to Cloudflare R2.
 *
 * Source: warsh-backend/exports/image-tests/batch-*\/*-transparent.png
 * Matching: image slug (part before first "-" in filename) is matched against
 *   VocabularyWord.transliteration queried live from the DB.
 *   (The old CSV-based approach broke after every db:seed run because seed
 *    deletes+recreates vocabulary words with new IDs each time.)
 *
 * For each match the image is uploaded to TWO R2 paths:
 *   1. images/words/{wordId}.jpg  →  VocabularyWord.imageUrl saved to DB
 *   2. images/discover/{slug}.png →  fixture image_url refs resolve automatically
 *
 * Usage (from warsh-backend/):
 *   npx tsx scripts/upload-vocab-images.ts [--dry-run] [--skip-existing]
 *
 * Flags:
 *   --dry-run       Print what would be uploaded without touching R2 or DB.
 *   --skip-existing Skip words that already have an imageUrl in the DB.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: require("path").join(__dirname, "../.env") });

import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  uploadImageToR2,
  vocabWordImageKey,
  discoverImageKey,
} from "../lib/r2";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DRY_RUN        = process.argv.includes("--dry-run");
const SKIP_EXISTING  = process.argv.includes("--skip-existing");

const BATCHES_DIR = path.join(__dirname, "../exports/image-tests");

// ---------------------------------------------------------------------------
// Slug normalisation
// ---------------------------------------------------------------------------

/**
 * Filename slugs that don't match their CSV/DB transliteration after
 * stripping diacritics.  Key = file slug, value = what the DB slug looks like
 * after normalisation.
 */
const SLUG_OVERRIDES: Record<string, string> = {
  maa:     "ma",      // mā'  → ma
  samaa:   "sama",    // samā' → sama
  nafitha: "nafidha", // nāfidha — th/dh difference
  mizaan:  "mizan",   // mīzān — double vowel
};

/** Strip diacritics/macrons/apostrophes → plain ASCII lowercase. */
function normalizeSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining marks (ā→a, ī→i …)
    .replace(/[''ʼ'ʻʾʿ]/g, "")      // strip apostrophes / hamza / ayn
    .replace(/[^a-z0-9]/g, "");      // strip non-alphanumeric
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

/** Recursively find all *-transparent.png files under a directory. */
function findTransparentImages(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findTransparentImages(full));
    else if (entry.name.endsWith("-transparent.png")) results.push(full);
  }
  return results;
}

/** rajul-man-transparent.png → "rajul" */
function slugFromFilename(filepath: string): string {
  return path.basename(filepath, "-transparent.png").split("-")[0];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (DRY_RUN) console.log("DRY RUN — no uploads or DB writes will happen.\n");

  // 1. Connect to DB and load ALL vocabulary words (live IDs, not stale CSV)
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
  const prisma   = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  const dbWords = await prisma.vocabularyWord.findMany({
    select: { id: true, transliteration: true, imageUrl: true },
    orderBy: { sortOrder: "asc" },
  });
  console.log(`Loaded ${dbWords.length} vocabulary words from DB.\n`);

  // Build normalizedSlug → word[] map
  interface DbWord { id: string; transliteration: string; imageUrl: string | null; }
  const slugMap = new Map<string, DbWord[]>();
  for (const w of dbWords) {
    const key = normalizeSlug(w.transliteration);
    if (!slugMap.has(key)) slugMap.set(key, []);
    slugMap.get(key)!.push(w);
  }

  // 2. Find image files
  if (!fs.existsSync(BATCHES_DIR)) {
    console.error(`Batches dir not found: ${BATCHES_DIR}`);
    await prisma.$disconnect();
    process.exit(1);
  }
  const imagePaths = findTransparentImages(BATCHES_DIR);
  console.log(`Found ${imagePaths.length} transparent PNG files.\n`);

  // 3. Match and upload
  let uploaded  = 0;
  let skipped   = 0;
  let unmatched = 0;
  let errors    = 0;
  let discoverOnly = 0;
  const unmatchedFiles: string[] = [];

  for (const imgPath of imagePaths) {
    const fileSlug        = slugFromFilename(imgPath);
    const normalizedKey   = SLUG_OVERRIDES[fileSlug] ?? normalizeSlug(fileSlug);
    const candidates      = slugMap.get(normalizedKey);

    if (!candidates || candidates.length === 0) {
      // No vocabulary word for this slug (e.g. particles/demonstratives like
      // hadha/dhalika/ma/man), but a discover card may still reference
      // images/discover/{slug}.png — so upload the discover image anyway.
      const discoverKey = discoverImageKey(fileSlug);
      if (DRY_RUN) {
        console.log(`  [DRY]  ${path.basename(imgPath)} (no vocab word) → discover: ${discoverKey}`);
        discoverOnly++;
      } else {
        try {
          await uploadImageToR2(discoverKey, fs.readFileSync(imgPath));
          discoverOnly++;
          console.log(`  [DISC] ${path.basename(imgPath)} → ${discoverKey} (no vocab word)`);
        } catch (err) {
          errors++;
          console.error(`  [FAIL] ${path.basename(imgPath)} → ${discoverKey}: ${err instanceof Error ? err.message : err}`);
        }
      }
      unmatched++;
      unmatchedFiles.push(path.basename(imgPath));
      continue;
    }

    if (candidates.length > 1) {
      console.warn(
        `  [WARN] "${path.basename(imgPath)}" matches ${candidates.length} words ` +
        `(${candidates.map((c) => c.transliteration).join(", ")}) — uploading to all.`
      );
    }

    for (const word of candidates) {
      if (SKIP_EXISTING && word.imageUrl) {
        skipped++;
        console.log(`  [SKIP] ${path.basename(imgPath)} → ${word.transliteration} (already has imageUrl)`);
        continue;
      }

      const wordKey    = vocabWordImageKey(word.id);
      const discoverKey = discoverImageKey(fileSlug);

      if (DRY_RUN) {
        console.log(`  [DRY]  ${path.basename(imgPath)}`);
        console.log(`         → vocab:    ${wordKey}`);
        console.log(`         → discover: ${discoverKey}`);
        uploaded++;
        continue;
      }

      try {
        const imageBuffer = fs.readFileSync(imgPath);

        const vocabUrl = await uploadImageToR2(wordKey, imageBuffer);
        await uploadImageToR2(discoverKey, imageBuffer);

        await prisma.vocabularyWord.update({
          where: { id: word.id },
          data:  { imageUrl: vocabUrl },
        });

        uploaded++;
        console.log(`  [OK]   ${path.basename(imgPath)} → ${word.transliteration} (${word.id.slice(-6)})`);
      } catch (err) {
        errors++;
        console.error(
          `  [FAIL] ${path.basename(imgPath)} → ${word.transliteration}: ` +
          `${err instanceof Error ? err.message : err}`
        );
      }
    }
  }

  // 4. Summary
  console.log("\n" + "─".repeat(60));
  console.log(`Uploaded:   ${uploaded}  (vocab word imageUrl + discover image)`);
  console.log(`Discover-only: ${discoverOnly}  (no vocab word; discover image uploaded)`);
  console.log(`Skipped:    ${skipped}  (already had imageUrl)`);
  console.log(`Errors:     ${errors}`);
  console.log(`Unmatched:  ${unmatched}  (no DB word found for slug)`);
  if (unmatchedFiles.length) {
    console.log("\nUnmatched files:");
    unmatchedFiles.forEach((f) => console.log(`  - ${f}`));
  }
  console.log("─".repeat(60));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
