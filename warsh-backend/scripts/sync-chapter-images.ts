/**
 * Wire chapter cover images end-to-end.
 *
 * Chapter titles are mostly abstract grammar concepts ("Attached Pronouns —
 * Singular"), not concrete nouns, so there's no reliable universal keyword
 * match. Instead this script combines two sources, in priority order:
 *
 *   1. MANUAL_OVERRIDES below — explicit chapter order -> image slug, for
 *      chapters you want a specific image on regardless of title wording.
 *   2. Keyword auto-match — chapter title words checked against the English
 *      part of each image slug (e.g. "School and Students" -> "madrasa-school").
 *      Only applied when exactly one slug matches, to avoid guessing wrong.
 *
 * Image source: same exports/image-tests[-compressed] convention already used
 * for vocabulary images (batch-N folders of {slug}-transparent.png). Drop new
 * chapter artwork there — if the filename slug's English part matches a
 * chapter title keyword, or you add it to MANUAL_OVERRIDES, re-running this
 * script wires it up with no further code changes.
 *
 * Usage (from warsh-backend/):
 *   npx tsx -r dotenv/config scripts/sync-chapter-images.ts [--dry-run] [--source <dir>]
 */

import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { uploadImageToR2, chapterImageKey } from "../lib/r2";

const DRY_RUN = process.argv.includes("--dry-run");

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const SOURCE_DIR = path.resolve(
  argValue("--source") ?? path.join(__dirname, "../exports/image-tests-compressed")
);

// ---------------------------------------------------------------------------
// Manual chapter order -> image slug overrides. Highest priority; use this
// for chapters where the keyword match is wrong, ambiguous, or missing.
// ---------------------------------------------------------------------------
const MANUAL_OVERRIDES: Record<number, string> = {
  // 11: "bayt-house", // e.g. force chapter 11 to use the house illustration
};

// Curriculum/structural words that appear in chapter titles but don't
// describe visual content — never treated as a match keyword.
const TITLE_STOPWORDS = new Set([
  "and", "the", "a", "an", "of", "in", "on", "for", "with", "is", "are", "to",
  "book", "bridge", "capstone", "consolidat", "consolidated", "consolidation",
  "expansion", "expanded", "structures", "advanced", "applied", "full",
  "treatment", "integration", "integrated", "development", "reinforcement",
  "recognition", "parsing", "system", "complete", "spiral", "review",
  "growth", "usage", "construction", "toolkit", "states", "state", "an",
  "introduction", "depth", "action", "special", "types", "higher-level",
  "syntax", "classical", "formal", "response", "effects", "vs", "descriptive",
  "accusatives", "curriculum",
]);

function titleKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 3 && !TITLE_STOPWORDS.has(w))
    .map((w) => (w.endsWith("s") && w.length > 4 ? w.slice(0, -1) : w)); // crude singularize
}

function slugEnglishWords(slug: string): string[] {
  // "madrasa-school" -> ["school"]; "balad-country-land" -> ["country", "land"]
  const parts = slug.split("-");
  return parts.slice(1).map((w) => (w.endsWith("s") && w.length > 4 ? w.slice(0, -1) : w));
}

interface ChapterRow {
  id: string;
  order: number;
  title: string;
  imageUrl: string | null;
}

function findTransparentImages(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findTransparentImages(full));
    else if (entry.name.endsWith("-transparent.png")) results.push(full);
  }
  return results;
}

function slugFromFilename(filepath: string): string {
  return path.basename(filepath, "-transparent.png");
}

async function main() {
  if (DRY_RUN) console.log("DRY RUN — no uploads or DB writes will happen.\n");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
  const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

  const chapters: ChapterRow[] = await prisma.chapter.findMany({
    select: { id: true, order: true, title: true, imageUrl: true },
    orderBy: { order: "asc" },
  });

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source dir not found: ${SOURCE_DIR}`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const imagePaths = findTransparentImages(SOURCE_DIR);
  const slugToPath = new Map<string, string>();
  for (const imgPath of imagePaths) slugToPath.set(slugFromFilename(imgPath), imgPath);

  console.log(`Loaded ${chapters.length} chapters, ${slugToPath.size} candidate images from ${SOURCE_DIR}.\n`);

  let matched = 0;
  let skippedHasImage = 0;
  let noMatch = 0;
  let ambiguous = 0;

  for (const chapter of chapters) {
    if (chapter.imageUrl) {
      skippedHasImage++;
      continue;
    }

    let chosenSlug: string | undefined = MANUAL_OVERRIDES[chapter.order];
    let reason = "manual override";

    if (!chosenSlug) {
      const keywords = titleKeywords(chapter.title);
      const candidateSlugs: string[] = [];
      for (const slug of slugToPath.keys()) {
        const slugWords = slugEnglishWords(slug);
        if (keywords.some((k) => slugWords.includes(k))) candidateSlugs.push(slug);
      }

      if (candidateSlugs.length === 1) {
        chosenSlug = candidateSlugs[0];
        reason = "keyword match";
      } else if (candidateSlugs.length > 1) {
        ambiguous++;
        console.log(`  [AMBIGUOUS] Ch${chapter.order} "${chapter.title}" -> ${candidateSlugs.join(", ")} (skipped — add to MANUAL_OVERRIDES)`);
        continue;
      }
    }

    if (!chosenSlug || !slugToPath.has(chosenSlug)) {
      noMatch++;
      continue;
    }

    const imgPath = slugToPath.get(chosenSlug)!;
    console.log(`  [${DRY_RUN ? "DRY" : "OK"}] Ch${chapter.order} "${chapter.title}" -> ${chosenSlug} (${reason})`);

    if (!DRY_RUN) {
      const buffer = fs.readFileSync(imgPath);
      const key = chapterImageKey(chapter.id);
      const imageUrl = await uploadImageToR2(key, buffer, "image/png");
      await prisma.chapter.update({ where: { id: chapter.id }, data: { imageUrl } });
    }
    matched++;
  }

  console.log("\n" + "─".repeat(60));
  console.log(`Matched:          ${matched}`);
  console.log(`Already had image: ${skippedHasImage}`);
  console.log(`Ambiguous (skipped): ${ambiguous}`);
  console.log(`No match:         ${noMatch}`);
  console.log("─".repeat(60));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
