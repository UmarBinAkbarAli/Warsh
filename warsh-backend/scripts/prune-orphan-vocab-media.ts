/**
 * Delete R2 vocabulary media that no VocabularyWord row can reach.
 *
 * `audio/words/{id}.mp3` and `images/words/{id}.jpg` are keyed by the word's
 * database id. `prisma/seed.cjs` calls `vocabularyWord.deleteMany()` and
 * re-creates every row with fresh ids, so each seed cycle strands a whole
 * generation of objects that nothing will ever request again. R2 held 2,731
 * audio and 1,823 image objects against 920 live words.
 *
 * An object is an orphan only when its id matches no current row. Prefixes that
 * are not keyed by word id — images/discover/ (keyed by slug), audio/catalog/ —
 * are never touched.
 *
 * Usage (from warsh-backend/):
 *   npx tsx scripts/prune-orphan-vocab-media.ts             # dry run
 *   npx tsx scripts/prune-orphan-vocab-media.ts --apply     # delete
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../.env") });

import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { listR2Keys } from "../lib/r2";

const APPLY = process.argv.includes("--apply");

// Keyed by VocabularyWord.id, so a wiped-and-reseeded table strands them.
const PREFIXES = [
  { prefix: "audio/words/", suffix: ".mp3" },
  { prefix: "images/words/", suffix: ".jpg" },
];

// R2/S3 DeleteObjects accepts at most 1000 keys per call.
const DELETE_BATCH = 1000;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function r2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: requireEnv("R2_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: requireEnv("DATABASE_URL") }),
  });

  let orphans: string[] = [];
  try {
    const words = await prisma.vocabularyWord.findMany({ select: { id: true } });
    const liveIds = new Set(words.map((word) => word.id));
    console.log(`Live vocabulary words: ${liveIds.size}`);

    for (const { prefix, suffix } of PREFIXES) {
      const keys = await listR2Keys(prefix);
      const stale = keys.filter((key) => {
        const id = key.slice(prefix.length, key.length - suffix.length);
        // Only judge keys that actually look like `<prefix><id><suffix>`;
        // anything else is not ours to delete.
        return key.startsWith(prefix) && key.endsWith(suffix) && id.length > 0 && !liveIds.has(id);
      });
      console.log(`${prefix.padEnd(16)} ${keys.length} objects, ${keys.length - stale.length} live, ${stale.length} orphaned`);
      orphans = orphans.concat(stale);
    }
  } finally {
    await prisma.$disconnect();
  }

  if (orphans.length === 0) {
    console.log("\nNo orphans to delete.");
    return;
  }

  console.log(`\nTotal orphaned objects: ${orphans.length}`);
  console.log(`Sample: ${orphans.slice(0, 3).join(", ")}`);

  if (!APPLY) {
    console.log("\nDry run. Re-run with --apply to delete.");
    return;
  }

  const bucket = requireEnv("R2_BUCKET_NAME");
  const client = r2Client();
  let deleted = 0;
  let failed = 0;

  for (let index = 0; index < orphans.length; index += DELETE_BATCH) {
    const batch = orphans.slice(index, index + DELETE_BATCH);
    const response = await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
      }),
    );
    deleted += batch.length - (response.Errors?.length ?? 0);
    for (const error of response.Errors ?? []) {
      failed++;
      console.error(`[delete-failed] ${error.Key}: ${error.Message}`);
    }
    console.log(`Progress: ${Math.min(index + DELETE_BATCH, orphans.length)}/${orphans.length}`);
  }

  console.log(`\nDeleted ${deleted} orphaned object(s); ${failed} failed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
