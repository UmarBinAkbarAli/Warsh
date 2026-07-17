/**
 * Batch pre-generates the TTS audio referenced by the lesson fixtures and uploads
 * it to R2 at the exact key each fixture `audio_url` points to. This is the
 * "generate once, serve from CDN" model: we TTS the whole catalogue up front so
 * no user's device ever has to generate it, and every referenced URL resolves.
 *
 * Scope: word / phrase / spoken / dua audio only. Quran ayahs are intentionally
 * excluded — those play the open-source reciter (see
 * repoint-ayah-audio-to-everyayah.cjs) and must never be TTS.
 *
 * Usage (from warsh-backend/):
 *   npm run audio:prebuild-fixtures            # generate + upload missing files
 *   npm run audio:prebuild-fixtures -- --dry-run   # report coverage, no cost
 *   npm run audio:prebuild-fixtures -- --force     # re-generate even if present
 *
 * Requires OPENAI_API_KEY and the R2_* env vars (loaded from .env via dotenv).
 */

import fs from "fs";
import path from "path";
import { generateTtsMp3 } from "../lib/tts";
import { uploadAudioToR2, r2KeyExists } from "../lib/r2";

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");
const CONCURRENCY = 8;

const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");
// Prefixes that are TTS-generated. Quran (`audio/quran`) is excluded on purpose.
const TTS_PREFIXES = ["audio/vocab/", "audio/phrases/", "audio/spoken/", "audio/dua/"];

const hasArabic = (s: unknown): s is string => typeof s === "string" && /[؀-ۿ]/.test(s);

// Keys whose `.ar` holds the word/phrase the audio pronounces, in priority order.
// `conjugated` must beat the sibling `pronoun` in VERB_PATTERN cells; `prompt`
// covers TAP_TRANSLATION exercises.
const AR_HOLDER_KEYS = ["text", "phrase", "prompt", "conjugated"] as const;

/** Best-effort extraction of the Arabic text sitting next to an audio_url. */
function arabicFor(obj: Record<string, unknown>): string | undefined {
  for (const key of AR_HOLDER_KEYS) {
    const holder = obj[key];
    if (typeof holder === "string" && hasArabic(holder)) return holder;
    if (holder && typeof holder === "object" && hasArabic((holder as Record<string, unknown>).ar)) {
      return (holder as Record<string, unknown>).ar as string;
    }
  }
  if (hasArabic(obj.ar)) return obj.ar as string;
  return undefined;
}

type Item = { key: string; url: string; arabic: string; source: string };

const byKey = new Map<string, Item>();
const missingText: string[] = [];

function collect(node: unknown, file: string) {
  if (Array.isArray(node)) return node.forEach((n) => collect(n, file));
  if (!node || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;

  const url = obj.audio_url;
  if (typeof url === "string" && TTS_PREFIXES.some((p) => url.includes(p))) {
    const key = new URL(url).pathname.replace(/^\//, "");
    if (!byKey.has(key)) {
      const arabic = arabicFor(obj);
      if (arabic) byKey.set(key, { key, url, arabic, source: file });
      else missingText.push(`${file}: ${url}`);
    }
  }
  for (const k of Object.keys(obj)) collect(obj[k], file);
}

let done = 0;
let skipped = 0;
let failed = 0;

async function processItem(item: Item, total: number) {
  try {
    if (DRY_RUN) {
      done++;
      console.log(`[dry] would generate  ${item.key}  ← ${item.arabic}`);
      return;
    }
    if (!FORCE && (await r2KeyExists(item.key))) {
      skipped++;
      return;
    }
    const buffer = await generateTtsMp3(item.arabic);
    await uploadAudioToR2(item.key, buffer);
    done++;
    console.log(`[${done + skipped + failed}/${total}] ✓  ${item.key}`);
  } catch (err) {
    failed++;
    console.error(`[${done + skipped + failed}/${total}] ✗  ${item.key} — ${err instanceof Error ? err.message : err}`);
  }
}

async function runPool(items: Item[]) {
  const queue = [...items];
  const worker = async () => {
    while (queue.length) {
      const item = queue.shift();
      if (item) await processItem(item, items.length);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

async function main() {
  for (const f of fs.readdirSync(FIXTURES_DIR).filter((n) => n.endsWith(".json"))) {
    collect(JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, f), "utf8")), f);
  }

  const items = [...byKey.values()];
  console.log(`Found ${items.length} unique TTS audio files across fixtures.`);
  if (missingText.length) {
    console.warn(`\n⚠  ${missingText.length} audio_url(s) had no adjacent Arabic text (skipped):`);
    missingText.slice(0, 20).forEach((m) => console.warn("   " + m));
  }
  if (DRY_RUN) console.log("\nDRY RUN — no generation or upload.\n");

  const start = Date.now();
  await runPool(items);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log("\n" + "─".repeat(60));
  console.log(`Generated/uploaded: ${done}`);
  console.log(`Skipped (already in R2): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`No-text (skipped): ${missingText.length}`);
  console.log(`Elapsed: ${elapsed}s`);
  console.log("─".repeat(60));
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
