/**
 * Patches lesson fixture files to add image_url on WORD-type discover cards
 * where we have a matching illustration in exports/image-tests/.
 *
 * The discover image URL pattern is:
 *   https://cdn.warsh.app/images/discover/{slug}.png
 *
 * Usage (from warsh-backend/):
 *   node scripts/patch-discover-image-urls.cjs [--dry-run]
 *
 * After running this, re-seed the DB:
 *   npm run db:seed
 */

const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");

const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");
const BATCHES_DIR  = path.join(__dirname, "../exports/image-tests");
// Use R2_PUBLIC_URL from env if available, else the known production value
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const CDN_BASE = (process.env.R2_PUBLIC_URL || "https://assets.warsh.app").replace(/\/$/, "");
const CDN_LEGACY = "https://cdn.warsh.app"; // old placeholder — fix any existing refs

// ---------------------------------------------------------------------------
// Slug helpers (mirrors upload-vocab-images.ts logic)
// ---------------------------------------------------------------------------

// filename slug → CSV-normalized slug overrides
const SLUG_OVERRIDES = {
  maa:     "ma",
  samaa:   "sama",
  nafitha: "nafidha",
  mizaan:  "mizan",
};

function normalizeSlug(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[''ʼ'ʼʾʿ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function slugFromFilename(filepath) {
  const base = path.basename(filepath, "-transparent.png");
  return base.split("-")[0];
}

// ---------------------------------------------------------------------------
// Build: normalizedTranslit → fileSlug   (for image_url construction)
// ---------------------------------------------------------------------------

function buildSlugMap(batchesDir) {
  // Map: normalizedTranslit → fileSlug (slug part of the PNG filename)
  const map = new Map();

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith("-transparent.png")) {
        const fileSlug = slugFromFilename(full);
        const normalizedKey = SLUG_OVERRIDES[fileSlug] ?? normalizeSlug(fileSlug);
        if (!map.has(normalizedKey)) {
          map.set(normalizedKey, fileSlug);
        }
      }
    }
  }

  walk(batchesDir);
  return map;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (DRY_RUN) console.log("DRY RUN — no files will be written.\n");

const slugMap = buildSlugMap(BATCHES_DIR);
console.log(`Built slug map with ${slugMap.size} available image slugs.\n`);

const fixtures = fs.readdirSync(FIXTURES_DIR).filter(f => f.endsWith(".json"));

let filesPatched = 0;
let cardsPatched = 0;
let cardsSkipped = 0; // already had image_url

for (const filename of fixtures) {
  const filepath = path.join(FIXTURES_DIR, filename);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filepath, "utf8"));
  } catch {
    console.warn(`  [SKIP] ${filename} — invalid JSON`);
    continue;
  }

  const cards = data.discover_cards;
  if (!Array.isArray(cards) || cards.length === 0) continue;

  let fileChanged = false;

  for (const card of cards) {
    if (card.type !== "WORD") continue;

    // Fix stale cdn.warsh.app URLs → assets.warsh.app
    if (card.image_url && card.image_url.startsWith(CDN_LEGACY)) {
      card.image_url = card.image_url.replace(CDN_LEGACY, CDN_BASE);
      cardsPatched++;
      fileChanged = true;
      continue;
    }

    if (card.image_url) {
      cardsSkipped++;
      continue;
    }

    const translit = card.text?.translit ?? card.text?.transliteration;
    if (!translit) continue;

    const normalizedTranslit = normalizeSlug(translit);
    const fileSlug = slugMap.get(normalizedTranslit);
    if (!fileSlug) continue;

    const imageUrl = `${CDN_BASE}/images/discover/${fileSlug}.png`;
    card.image_url = imageUrl;
    cardsPatched++;
    fileChanged = true;
  }

  if (fileChanged) {
    filesPatched++;
    if (!DRY_RUN) {
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
    }
    console.log(`  [PATCH] ${filename} — ${cardsPatched} cards updated so far`);
  }
}

console.log("\n" + "─".repeat(60));
console.log(`Files patched:  ${filesPatched}`);
console.log(`Cards patched:  ${cardsPatched}`);
console.log(`Cards skipped:  ${cardsSkipped}  (already had image_url)`);
console.log("─".repeat(60));

if (!DRY_RUN && cardsPatched > 0) {
  console.log("\nNext step: run  npm run db:seed  to push changes to the DB.");
}
