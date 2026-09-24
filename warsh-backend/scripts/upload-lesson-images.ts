/**
 * Deliver discover-card illustrations for lesson fixtures.
 *
 * Reads the delivery manifest (`Docs/lesson-illustrations-needed.csv`), finds
 * each listed file in the input folder, downscales it to the same 768 px WebP
 * the Studio upload route produces, uploads it to R2 under
 * `images/discover/{slug}.webp`, and writes the public URL into
 * `discover_cards[card - 1].image_url` of the matching fixture. Several manifest
 * rows may share one filename (one scene reused on more than one card); the
 * file is uploaded once.
 *
 * The database is not touched here. Publish the fixture change afterwards with
 * the normal mirror flow, which by default writes only media-URL diffs:
 *
 *   npm run content:check
 *   npm run content:sync -- --dry-run
 *   npm run content:sync
 *
 * Usage (from warsh-backend/):
 *   npx tsx -r dotenv/config scripts/upload-lesson-images.ts --input <folder> [--dry-run] [--replace] [--manifest=<csv>]
 *
 * Files that are in the manifest but not in the folder are skipped and listed
 * at the end, so a partial delivery is fine.
 *
 * `--replace` is for a redrawn scene whose card already has a picture. R2
 * serves `images/discover/` with `Cache-Control: immutable` for a year, so
 * overwriting the same key leaves every device that has seen the old picture
 * showing it. With `--replace` the key gets a content-hash suffix
 * (`{slug}-{sha8}.webp`), the card's URL changes, and the new picture reaches
 * everyone. Only put the redrawn files in the input folder.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { getR2PublicUrl, uploadImageToR2 } from "../lib/r2";

// tsx resolves "sharp" (0.35, `exports` → dist/, `types` → lib/index.d.ts) to the
// .d.ts and crashes with "sharp is not defined", so load the CJS build by path.
const sharp = createRequire(__filename)(
  path.join(__dirname, "../node_modules/sharp/dist/index.cjs"),
) as typeof import("sharp");

const DRY_RUN = process.argv.includes("--dry-run");
const REPLACE = process.argv.includes("--replace");
const MANIFEST_PATH = path.resolve(
  process.argv.find((argument) => argument.startsWith("--manifest="))?.slice("--manifest=".length)
    ?? path.join(__dirname, "../../Docs/lesson-illustrations-needed.csv"),
);
const inputIndex = process.argv.indexOf("--input");
const INPUT_DIR = inputIndex !== -1 && process.argv[inputIndex + 1] ? path.resolve(process.argv[inputIndex + 1]) : undefined;

const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");
// Same contract as app/api/admin/images/route.ts: discover cards render at 196pt,
// so 768 px covers a 3x screen; WebP q82 holds a scene to ~80 KB.
const MAX_DIMENSION = 768;
const WEBP_QUALITY = 82;

type ManifestRow = { filename: string; fixture: string; lessonId: string; card: number };

function readManifest(manifestPath: string): ManifestRow[] {
  const lines = fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/);
  const rows: ManifestRow[] = [];
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    // filename,fixture,lesson_id,card,... — later columns may carry quoted commas.
    const [filename, fixture, lessonId, card] = line.split(",");
    const cardNumber = Number.parseInt(card ?? "", 10);
    if (!filename || !fixture || !lessonId || !Number.isInteger(cardNumber) || cardNumber < 1) {
      throw new Error(`Malformed manifest row: ${line}`);
    }
    rows.push({ filename: filename.trim(), fixture: fixture.trim(), lessonId: lessonId.trim(), card: cardNumber });
  }
  return rows;
}

function findFile(dir: string, filename: string): string | undefined {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(full, filename);
      if (found) return found;
    } else if (entry.name.toLowerCase() === filename.toLowerCase()) {
      return full;
    }
  }
  return undefined;
}

/** ch05-near-feminine-scene.png → "ch05-near-feminine-scene" */
function slugFromFilename(filename: string): string {
  return path.basename(filename, path.extname(filename)).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

async function main() {
  if (!INPUT_DIR) throw new Error("Pass --input <folder> with the delivered images.");
  if (!fs.existsSync(INPUT_DIR)) throw new Error(`Input folder not found: ${INPUT_DIR}`);
  if (DRY_RUN) console.log("DRY RUN — no uploads or fixture writes will happen.\n");

  const rows = readManifest(MANIFEST_PATH);
  console.log(`Manifest: ${MANIFEST_PATH} (${rows.length} card rows)\nInput: ${INPUT_DIR}\n`);

  const uploaded = new Map<string, string>(); // filename → public URL
  const missing = new Set<string>();
  const patchedFixtures = new Map<string, Record<string, unknown>>();
  let cardsPatched = 0;

  for (const row of rows) {
    if (missing.has(row.filename)) continue;

    let url = uploaded.get(row.filename);
    if (!url) {
      const source = findFile(INPUT_DIR, row.filename);
      if (!source) {
        missing.add(row.filename);
        continue;
      }
      const webp = await sharp(source)
        .rotate()
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      const suffix = REPLACE ? `-${crypto.createHash("sha256").update(webp).digest("hex").slice(0, 8)}` : "";
      const key = `images/discover/${slugFromFilename(row.filename)}${suffix}.webp`;
      url = getR2PublicUrl(key);
      console.log(`${DRY_RUN ? "[dry] " : ""}upload ${row.filename} → ${key} (${(webp.length / 1024).toFixed(0)} KB)`);
      if (!DRY_RUN) await uploadImageToR2(key, webp, "image/webp");
      uploaded.set(row.filename, url);
    }

    const fixturePath = path.join(FIXTURES_DIR, row.fixture);
    const fixture = patchedFixtures.get(row.fixture)
      ?? (JSON.parse(fs.readFileSync(fixturePath, "utf8")) as Record<string, unknown>);
    const cards = fixture.discover_cards as Array<Record<string, unknown>> | undefined;
    const card = cards?.[row.card - 1];
    if (!card) throw new Error(`${row.fixture}: no discover card #${row.card}`);
    if (card.image_url !== url) {
      card.image_url = url;
      cardsPatched += 1;
      console.log(`  ${row.lessonId} card ${row.card} ← ${path.basename(url)}`);
    }
    patchedFixtures.set(row.fixture, fixture);
  }

  if (!DRY_RUN) {
    for (const [name, fixture] of patchedFixtures) {
      fs.writeFileSync(path.join(FIXTURES_DIR, name), `${JSON.stringify(fixture, null, 2)}\n`);
    }
  }

  console.log(`\nUploaded ${uploaded.size} file(s), patched ${cardsPatched} card(s) across ${patchedFixtures.size} fixture(s).`);
  if (missing.size) {
    console.log(`Not delivered yet (${missing.size}):`);
    for (const name of missing) console.log(`  - ${name}`);
  }
  if (!DRY_RUN && cardsPatched) {
    console.log("\nNext: npm run db:validate-fixtures && npm run content:check && npm run content:sync -- --dry-run");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
