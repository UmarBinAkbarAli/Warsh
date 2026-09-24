/**
 * Wire the "reuse" rows of `Docs/lesson-illustrations-reuse.csv` into their
 * discover cards: cards whose picture already exists, so nothing is drawn.
 *
 * - `images/discover/{slug}.webp` sources are pointed at directly.
 * - `images/words/{id}.jpg` vocabulary pictures are copied to
 *   `images/discover/vocab-{id}.webp` (768 px WebP, as upload-lesson-images.ts
 *   does) so a card never depends on a vocabulary id that changes if the
 *   vocabulary is ever re-created.
 *
 * Each source must answer 200 at the public R2 URL; each card's Arabic must
 * match the manifest row, so a stale row fails instead of patching the wrong
 * card. Only fixtures are written; publish with `content:sync` afterwards.
 *
 * Usage (from warsh-backend/):
 *   npx tsx -r dotenv/config scripts/wire-reused-lesson-images.ts [--dry-run]
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { getR2PublicUrl, uploadImageToR2 } from "../lib/r2";

const sharp = createRequire(__filename)(
  path.join(__dirname, "../node_modules/sharp/dist/index.cjs"),
) as typeof import("sharp");

const DRY_RUN = process.argv.includes("--dry-run");
const MANIFEST_PATH = path.join(__dirname, "../../Docs/lesson-illustrations-reuse.csv");
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");

/** Minimal CSV line split that honours double-quoted fields. */
function splitCsv(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { out.push(field); field = ""; }
    else field += ch;
  }
  out.push(field);
  return out;
}

const stripMarks = (s: string) => s.replace(/[ً-ٰٟ\s]/g, "");

async function main() {
  const lines = fs.readFileSync(MANIFEST_PATH, "utf8").replace(/^﻿/, "").split(/\r?\n/).slice(1).filter((l) => l.trim());
  const fixtures = new Map<string, Record<string, unknown>>();
  const copied = new Map<string, string>(); // words key → discover URL
  let patched = 0;

  for (const line of lines) {
    const [fixture, lessonId, card, , , arabic, sourceField] = splitCsv(line);
    const sourceKey = sourceField.split(" ")[0];
    const data = fixtures.get(fixture) ?? JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, fixture), "utf8"));
    fixtures.set(fixture, data);
    const target = (data.discover_cards as Array<Record<string, any>>)[Number(card) - 1];
    if (!target) throw new Error(`${fixture}: no discover card #${card}`);
    const cardArabic = target.text?.ar ?? target.concept?.ar ?? target.word?.ar ?? "";
    if (!stripMarks(cardArabic).includes(stripMarks(arabic).split("/")[0]) && !stripMarks(arabic).includes(stripMarks(cardArabic))) {
      throw new Error(`${lessonId} card ${card}: manifest says ${arabic}, card has ${cardArabic}`);
    }

    let url: string;
    if (sourceKey.startsWith("images/discover/")) {
      url = getR2PublicUrl(sourceKey);
      const head = await fetch(url, { method: "HEAD" });
      if (!head.ok) throw new Error(`${sourceKey} answered ${head.status}`);
    } else if (sourceKey.startsWith("images/words/")) {
      const cached = copied.get(sourceKey);
      if (cached) url = cached;
      else {
        const id = path.basename(sourceKey, path.extname(sourceKey));
        const key = `images/discover/vocab-${id}.webp`;
        url = getR2PublicUrl(key);
        const response = await fetch(getR2PublicUrl(sourceKey));
        if (!response.ok) throw new Error(`${sourceKey} answered ${response.status}`);
        const webp = await sharp(Buffer.from(await response.arrayBuffer()))
          .rotate()
          .resize({ width: 768, height: 768, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        console.log(`${DRY_RUN ? "[dry] " : ""}copy ${sourceKey} → ${key} (${(webp.length / 1024).toFixed(0)} KB)`);
        if (!DRY_RUN) await uploadImageToR2(key, webp, "image/webp");
        copied.set(sourceKey, url);
      }
    } else {
      throw new Error(`Unknown source ${sourceField}`);
    }

    if (target.image_url !== url) {
      target.image_url = url;
      patched += 1;
      console.log(`  ${lessonId} card ${card} ← ${path.basename(url)}`);
    }
  }

  if (!DRY_RUN) {
    for (const [name, data] of fixtures) fs.writeFileSync(path.join(FIXTURES_DIR, name), `${JSON.stringify(data, null, 2)}\n`);
  }
  console.log(`\nCopied ${copied.size} vocabulary picture(s), patched ${patched} card(s) across ${fixtures.size} fixture(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
