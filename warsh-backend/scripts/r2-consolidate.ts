/**
 * One-off (2026-09-14): move every media object production references from the
 * old personal R2 bucket to the Warsh bucket, then re-point the references.
 *
 *   npx tsx -r dotenv/config scripts/r2-consolidate.ts            # report only
 *   npx tsx -r dotenv/config scripts/r2-consolidate.ts --apply    # copy + rewrite
 *
 * Copies go old-host (public GET) -> local backup folder -> Warsh bucket (PutObject).
 * Nothing is ever deleted from either bucket.
 */
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { prisma } from "../lib/prisma";
import { lessonAudioTargets } from "../lib/audioTargets";
import { S3Client } from "@aws-sdk/client-s3";

const OLD_HOST = "https://pub-3da71e4264044cce9d5935f98c79c78c.r2.dev";
const NEW_HOST = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
const BUCKET = process.env.R2_BUCKET_NAME!;
const BACKUP_DIR = join(__dirname, "..", "exports", "r2-personal-backup-2026-09-14");
const APPLY = process.argv.includes("--apply");
const FIXTURES = join(__dirname, "..", "prisma", "fixtures");

if (!NEW_HOST.includes("pub-66b79e")) throw new Error(`R2_PUBLIC_URL is ${NEW_HOST}, expected the Warsh bucket`);

const CONTENT_TYPES: Record<string, string> = {
  mp3: "audio/mpeg", webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", svg: "image/svg+xml",
};
const URL_RE = /https:\/\/pub-3da71e[^"'\s\\]+/g;

type Ref = { key: string; source: string };
type Col = { table_name: string; column_name: string; data_type: string };

async function textColumns(): Promise<Col[]> {
  return prisma.$queryRawUnsafe(
    `select table_name, column_name, data_type from information_schema.columns
     where table_schema = 'public' and data_type in ('text','character varying','json','jsonb')`,
  );
}

async function collectRefs(): Promise<Ref[]> {
  const refs = new Map<string, string>();
  const add = (url: string, source: string) => {
    if (!url.startsWith(OLD_HOST + "/")) return;
    const key = url.slice(OLD_HOST.length + 1);
    if (!refs.has(key)) refs.set(key, source);
  };

  // 1. Every text/json column in the database that mentions the old host.
  for (const c of await textColumns()) {
    const rows: { v: string }[] = await prisma.$queryRawUnsafe(
      `select "${c.column_name}"::text as v from "${c.table_name}" where "${c.column_name}"::text like '%${OLD_HOST}%'`,
    );
    for (const r of rows) for (const m of r.v.matchAll(URL_RE)) add(m[0], `db:${c.table_name}.${c.column_name}`);
  }

  // 2. Fixture files.
  for (const f of readdirSync(FIXTURES).filter((n) => n.endsWith(".json"))) {
    const text = readFileSync(join(FIXTURES, f), "utf8");
    for (const m of text.matchAll(URL_RE)) add(m[0], `fixture:${f}`);
  }

  // 3. Catalogue clips every published lesson needs (keyed by text, host-agnostic).
  const lessons = await prisma.lesson.findMany({ where: { status: "PUBLISHED" }, select: { id: true, content: true } });
  for (const l of lessons) for (const t of lessonAudioTargets(l.content)) if (!refs.has(t.key)) refs.set(t.key, `catalog:${l.id}`);

  return [...refs.entries()].map(([key, source]) => ({ key, source }));
}

// r2.dev answers the odd HEAD with a transient error; only 200 and 404 are answers.
async function head(url: string) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(url, { method: "HEAD" }).catch(() => null);
    const s = r?.status ?? 0;
    if (s === 200 || s === 404) return s;
    await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
  }
  return 0;
}

async function parallel<T>(items: T[], workers: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: workers }, async () => {
    while (i < items.length) await fn(items[i++]);
  }));
}

async function main() {
  const refs = await collectRefs();
  const bySource: Record<string, number> = {};
  for (const r of refs) { const s = r.source.split(":")[0]; bySource[s] = (bySource[s] ?? 0) + 1; }
  console.log(`referenced keys: ${refs.length}`, bySource);

  const missing: Ref[] = []; const present: Ref[] = []; const unknown: Ref[] = [];
  await parallel(refs, 16, async (r) => {
    const s = await head(`${NEW_HOST}/${r.key}`);
    (s === 200 ? present : s === 404 ? missing : unknown).push(r);
  });
  console.log(`on Warsh host: present ${present.length}, missing ${missing.length}, unknown ${unknown.length}`);
  if (unknown.length) console.log("unknown:", unknown.slice(0, 5));

  const oldMissing: Ref[] = []; const copies: Ref[] = [];
  await parallel(missing, 16, async (r) => {
    ((await head(`${OLD_HOST}/${r.key}`)) === 200 ? copies : oldMissing).push(r);
  });
  console.log(`missing on both hosts (cannot recover): ${oldMissing.length}`);
  for (const r of oldMissing) console.log("  ", r.key, "<-", r.source);
  console.log(`to copy old -> Warsh: ${copies.length}`);

  if (!APPLY) { console.log("dry run; pass --apply to copy and rewrite."); return; }

  const client = new S3Client({
    region: "auto", endpoint: process.env.R2_ENDPOINT,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
  });
  let done = 0; const failed: string[] = [];
  await parallel(copies, 8, async (r) => {
    try {
      const res = await fetch(`${OLD_HOST}/${r.key}`);
      if (!res.ok) throw new Error(`GET ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const file = join(BACKUP_DIR, r.key);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, buf);
      const ext = r.key.split(".").pop()!.toLowerCase();
      await client.send(new PutObjectCommand({
        Bucket: BUCKET, Key: r.key, Body: buf,
        ContentType: res.headers.get("content-type") ?? CONTENT_TYPES[ext] ?? "application/octet-stream",
        CacheControl: "public, max-age=31536000, immutable",
      }));
      done++;
      if (done % 100 === 0) console.log(`  copied ${done}/${copies.length}`);
    } catch (e) { failed.push(`${r.key}: ${(e as Error).message}`); }
  });
  console.log(`copied ${done}, failed ${failed.length}`);
  for (const f of failed) console.log("  ", f);
  if (failed.length) { console.log("stopping before rewrite: fix the failures first."); return; }

  for (const c of await textColumns()) {
    const isJson = c.data_type === "json" || c.data_type === "jsonb";
    const expr = isJson
      ? `replace("${c.column_name}"::text, '${OLD_HOST}', '${NEW_HOST}')::${c.data_type}`
      : `replace("${c.column_name}", '${OLD_HOST}', '${NEW_HOST}')`;
    const n = await prisma.$executeRawUnsafe(
      `update "${c.table_name}" set "${c.column_name}" = ${expr} where "${c.column_name}"::text like '%${OLD_HOST}%'`,
    );
    if (n > 0) console.log(`rewrote ${n} rows in ${c.table_name}.${c.column_name}`);
  }

  let files = 0;
  for (const f of readdirSync(FIXTURES).filter((n) => n.endsWith(".json"))) {
    const p = join(FIXTURES, f); const text = readFileSync(p, "utf8");
    if (!text.includes(OLD_HOST)) continue;
    writeFileSync(p, text.split(OLD_HOST).join(NEW_HOST)); files++;
  }
  console.log(`rewrote ${files} fixture files`);

  const left = (await collectRefs()).filter((r) => !r.source.startsWith("catalog"));
  console.log(`references still naming the old host: ${left.length}`);
}

main().finally(() => prisma.$disconnect());
