/**
 * Bulk-upload vocabulary word illustrations to Cloudflare R2.
 *
 * Source: warsh-backend/exports/image-tests/batch-*\/*-transparent.png
 * Matching: image slug (part before first "-" in filename) is matched against
 *   VocabularyWord.transliteration queried live from the DB.
 *   (The old CSV-based approach broke after every db:seed run because seed
 *    deletes+recreates vocabulary words with new IDs each time.)
 *
 * For each match the image is uploaded to images/words/{wordId}.jpg and
 * VocabularyWord.imageUrl is saved to the DB.
 *
 * It no longer mirrors sources to images/discover/{slug}.png: Discover cards
 * reference hand-placed .webp objects, nothing ever read the .png mirror, and
 * 595 raw 1–2 MB copies of it were 20% of the bucket before the 2026-09-14 prune.
 *
 * Point it at the compressed set (exports/image-tests-compressed or
 * VOCAB_IMAGE_SOURCE_DIR). A source over MAX_SOURCE_BYTES is refused so the raw
 * 944 MB originals cannot be uploaded by accident; the bucket must stay small.
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
import { uploadImageToR2, vocabWordImageKey } from "../lib/r2";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DRY_RUN        = process.argv.includes("--dry-run");
const SKIP_EXISTING  = process.argv.includes("--skip-existing");
const ONLY_FILE      = process.argv.find((arg) => arg.startsWith("--file="))?.slice("--file=".length);
const DISCOVER_ONLY_FILES = new Set(["ma-what-transparent.png"]);
// Word illustrations ship at 768px / ≤100 KB; anything larger is an uncompressed
// original and belongs on disk, not in R2.
const MAX_SOURCE_BYTES = 200 * 1024;

const BATCHES_DIR = process.env.VOCAB_IMAGE_SOURCE_DIR
  ? path.resolve(process.env.VOCAB_IMAGE_SOURCE_DIR)
  : path.join(__dirname, "../exports/image-tests");

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
    select: { id: true, transliteration: true, translationEn: true, imageUrl: true },
    orderBy: { sortOrder: "asc" },
  });
  console.log(`Loaded ${dbWords.length} vocabulary words from DB.\n`);

  // Build normalizedSlug → word[] map
  interface DbWord { id: string; transliteration: string; translationEn: string; imageUrl: string | null; }
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
  const imagePaths = findTransparentImages(BATCHES_DIR)
    .filter((imagePath) => !ONLY_FILE || path.basename(imagePath) === ONLY_FILE);
  console.log(`Found ${imagePaths.length} transparent PNG files.\n`);

  // 3. Match and upload
  let uploaded  = 0;
  let skipped   = 0;
  let unmatched = 0;
  let errors    = 0;
  const unmatchedFiles: string[] = [];

  for (const imgPath of imagePaths) {
    const fileSlug        = slugFromFilename(imgPath);
    const normalizedKey   = SLUG_OVERRIDES[fileSlug] ?? normalizeSlug(fileSlug);
    const allCandidates   = slugMap.get(normalizedKey);
    const descriptor      = path.basename(imgPath, "-transparent.png").split("-").slice(1).join(" ");
    const semanticMatches = allCandidates?.filter((word) =>
      normalizeSlug(word.translationEn).includes(normalizeSlug(descriptor)) ||
      normalizeSlug(descriptor).includes(normalizeSlug(word.translationEn))
    );
    // The filename meaning disambiguates otherwise identical ASCII slugs such
    // as maṭar (rain) / maṭār (airport). If a lone transliteration candidate's
    // meaning does not match (for example ma "what" vs mā' "water"), treat the
    // asset as Discovery-only instead of attaching the wrong illustration.
    const candidates = DISCOVER_ONLY_FILES.has(path.basename(imgPath))
      ? undefined
      : semanticMatches && semanticMatches.length > 0
        ? semanticMatches
        : allCandidates;

    if (!candidates || candidates.length === 0) {
      // No vocabulary word for this slug (e.g. particles/demonstratives like
      // hadha/dhalika/ma/man). Nothing to upload: Discover cards no longer
      // resolve images by slug.
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

      const wordKey = vocabWordImageKey(word.id);
      const sourceBytes = fs.statSync(imgPath).size;
      if (sourceBytes > MAX_SOURCE_BYTES) {
        errors++;
        console.error(
          `  [FAIL] ${path.basename(imgPath)} is ${Math.round(sourceBytes / 1024)} KB — ` +
          `over ${MAX_SOURCE_BYTES / 1024} KB; run scripts/compress-images.cjs and upload the compressed copy.`
        );
        continue;
      }

      if (DRY_RUN) {
        console.log(`  [DRY]  ${path.basename(imgPath)} → ${wordKey}`);
        uploaded++;
        continue;
      }

      try {
        const imageBuffer = fs.readFileSync(imgPath);

        const vocabUrl = await uploadImageToR2(wordKey, imageBuffer);

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
  console.log(`Uploaded:   ${uploaded}  (vocab word imageUrl)`);
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
