/**
 * Repoints every Quran ayah `audio_url` in the lesson fixtures to the
 * open-source Mishary Alafasy recitation on everyayah.com — the same source the
 * onboarding preview already streams (Alafasy_128kbps/SSSAAA.mp3).
 *
 * Why: the previous `…r2.dev/audio/quran/*-mishary.mp3` URLs all return 404, so
 * ayah playback was silently falling back to generated TTS. Ayah recitation must
 * be an authentic human reciter. The R2 `audio/quran/…` path is reserved for the
 * future premium reciter set; until then we use the open-source recording.
 *
 * Ayah number is taken from the object's numeric `surah`/`ayah` fields. A handful
 * of legacy objects only encode the reference in their filename slug, so those are
 * covered by SLUG_OVERRIDES below.
 *
 * Usage (from warsh-backend/):
 *   node scripts/repoint-ayah-audio-to-everyayah.cjs [--dry-run]
 *
 * After running: re-seed the DB with  npm run db:seed
 */

const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");
const RECITER_BASE = "https://everyayah.com/data/Alafasy_128kbps";

// Legacy objects whose only reference is the filename slug → [surah, ayah].
const SLUG_OVERRIDES = {
  "al-baqarah-196": [2, 196],
  "al-layl-001": [92, 1],
  "al-kahf-022": [18, 22],
  "al-a'raf-189": [7, 189],
  "al-hadid-001": [57, 1],
  "ali-imran-159": [3, 159],
  "al-ancbiya-87": [21, 87],
  "al-maida-2": [5, 2],
  "ali-imran-102": [3, 102],
  "al-sharh-5": [94, 5],
  "ali-imran-109": [3, 109],
};

const pad3 = (n) => String(n).padStart(3, "0");
const everyayahUrl = (surah, ayah) => `${RECITER_BASE}/${pad3(surah)}${pad3(ayah)}.mp3`;
const slugOf = (url) => url.split("/").pop().replace(/-mishary/, "").replace(/\.mp3$/, "");

let filesChanged = 0;
let urlsRewritten = 0;
const unresolved = [];

function repoint(obj) {
  if (Array.isArray(obj)) return obj.forEach(repoint);
  if (!obj || typeof obj !== "object") return;

  if (typeof obj.audio_url === "string" && obj.audio_url.includes("/audio/quran/")) {
    let surah = Number.isFinite(obj.surah) ? obj.surah : undefined;
    let ayah = Number.isFinite(obj.ayah) ? obj.ayah : undefined;

    if (surah === undefined || ayah === undefined) {
      const override = SLUG_OVERRIDES[slugOf(obj.audio_url)];
      if (override) [surah, ayah] = override;
    }

    if (surah === undefined || ayah === undefined) {
      unresolved.push(obj.audio_url);
    } else {
      const next = everyayahUrl(surah, ayah);
      if (obj.audio_url !== next) {
        obj.audio_url = next;
        urlsRewritten++;
      }
    }
  }

  for (const key of Object.keys(obj)) repoint(obj[key]);
}

if (DRY_RUN) console.log("DRY RUN — no files will be written.\n");

for (const filename of fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".json"))) {
  const filepath = path.join(FIXTURES_DIR, filename);
  const before = fs.readFileSync(filepath, "utf8");
  const data = JSON.parse(before);
  const rewrittenBefore = urlsRewritten;

  repoint(data);

  if (urlsRewritten > rewrittenBefore) {
    filesChanged++;
    const after = JSON.stringify(data, null, 2) + "\n";
    if (!DRY_RUN) fs.writeFileSync(filepath, after, "utf8");
    console.log(`  [${DRY_RUN ? "WOULD PATCH" : "PATCH"}] ${filename} — ${urlsRewritten - rewrittenBefore} ayah URL(s)`);
  }
}

console.log("\n" + "─".repeat(60));
console.log(`Files changed:   ${filesChanged}`);
console.log(`Ayah URLs fixed: ${urlsRewritten}`);
console.log(`Unresolved:      ${unresolved.length}`);
console.log("─".repeat(60));
if (unresolved.length) {
  console.log("\nUnresolved (no surah/ayah and no slug override):");
  unresolved.forEach((u) => console.log("  " + u));
  process.exitCode = 1;
}
if (!DRY_RUN && urlsRewritten > 0) {
  console.log("\nNext step: run  npm run db:seed  to push changes to the DB.");
}
