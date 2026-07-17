/**
 * Release guardrail: HEAD-checks every media URL referenced by the lesson
 * fixtures (audio_url + image_url) and fails if any is unreachable.
 *
 * This is what should have caught the ayah 404s and the missing janna image
 * before release. Run it in CI / pre-release.
 *
 * Usage (from warsh-backend/):
 *   node scripts/check-fixture-media.cjs [--audio] [--images] [--quran-only]
 *
 * With no flags it checks both audio and images. Exit code is non-zero if any
 * URL returns a non-2xx status.
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const CHECK_AUDIO = args.includes("--audio") || (!args.includes("--images"));
const CHECK_IMAGES = args.includes("--images") || (!args.includes("--audio"));
const QURAN_ONLY = args.includes("--quran-only");
const CONCURRENCY = 20;

const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");

const urls = new Map(); // url -> "audio" | "image"

function collect(node) {
  if (Array.isArray(node)) return node.forEach(collect);
  if (!node || typeof node !== "object") return;
  if (typeof node.audio_url === "string") urls.set(node.audio_url, "audio");
  if (typeof node.image_url === "string") urls.set(node.image_url, "image");
  for (const k of Object.keys(node)) collect(node[k]);
}

for (const f of fs.readdirSync(FIXTURES_DIR).filter((n) => n.endsWith(".json"))) {
  collect(JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, f), "utf8")));
}

let list = [...urls.entries()]
  .filter(([, kind]) => (kind === "audio" ? CHECK_AUDIO : CHECK_IMAGES));
if (QURAN_ONLY) list = list.filter(([u]) => u.includes("/audio/quran/") || u.includes("everyayah.com"));

async function head(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status;
  } catch (err) {
    return `ERR ${err instanceof Error ? err.message : err}`;
  }
}

async function main() {
  console.log(`Checking ${list.length} unique media URL(s)...\n`);
  const failures = [];
  const queue = [...list];
  let checked = 0;

  async function worker() {
    while (queue.length) {
      const [url, kind] = queue.shift();
      const status = await head(url);
      checked++;
      if (status !== 200) {
        failures.push({ url, kind, status });
        console.log(`  ✗ ${status}  [${kind}]  ${url}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log("\n" + "─".repeat(60));
  console.log(`Checked: ${checked}   OK: ${checked - failures.length}   Failed: ${failures.length}`);
  console.log("─".repeat(60));
  if (failures.length) process.exit(1);
}

main();
