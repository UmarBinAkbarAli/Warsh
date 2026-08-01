/**
 * Audits lesson hook/reveal ayahs against Quran Foundation's canonical Imlaei
 * text. With --write, confirmed mismatches are replaced as one unit: Arabic,
 * English translation, and Urdu translation. Existing surah/ayah metadata and
 * recitation URLs remain authoritative and unchanged.
 *
 * Usage (from warsh-backend/):
 *   node scripts/audit-ayah-text.cjs
 *   node scripts/audit-ayah-text.cjs --write
 */

const fs = require("fs");
const path = require("path");

const WRITE = process.argv.includes("--write");
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");
const QURAN_API = "https://api.quran.com/api/v4";
const EN_TRANSLATION_ID = 20; // Saheeh International
const UR_TRANSLATION_ID = 234; // Fatah Muhammad Jalandhari
const CONCURRENCY = 12;

function normalizedWords(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640\u06dd]/g, "")
    .replace(/[\u0671\u0623\u0625\u0622]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .split(/[^\u0621-\u064a]+/)
    .filter(Boolean);
}

function equivalentWord(left, right) {
  return left === right || left.replace(/ا/g, "") === right.replace(/ا/g, "");
}

function isCanonicalExcerpt(candidate, canonical) {
  const excerptWords = normalizedWords(candidate);
  const canonicalWords = normalizedWords(canonical);
  if (!excerptWords.length || excerptWords.length > canonicalWords.length) return false;

  outer: for (let start = 0; start <= canonicalWords.length - excerptWords.length; start++) {
    for (let index = 0; index < excerptWords.length; index++) {
      if (!equivalentWord(canonicalWords[start + index], excerptWords[index])) continue outer;
    }
    return true;
  }
  return false;
}

function cleanTranslation(value) {
  return value
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchCanonical(verseKey) {
  const url = `${QURAN_API}/verses/by_key/${verseKey}?language=en&translations=${EN_TRANSLATION_ID},${UR_TRANSLATION_ID}&fields=text_imlaei`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Quran API returned ${response.status} for ${verseKey}`);
  const verse = (await response.json()).verse;
  const translations = new Map(
    (verse.translations ?? []).map((translation) => [translation.resource_id, cleanTranslation(translation.text)]),
  );
  const en = translations.get(EN_TRANSLATION_ID);
  const ur = translations.get(UR_TRANSLATION_ID);
  if (!verse.text_imlaei || !en || !ur) throw new Error(`Incomplete canonical content for ${verseKey}`);
  return { ar: verse.text_imlaei, en, ur };
}

async function mapWithConcurrency(items, worker) {
  const queue = [...items];
  const results = new Map();
  async function run() {
    while (queue.length) {
      const item = queue.shift();
      results.set(item, await worker(item));
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, run));
  return results;
}

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = openIndex; index < source.length; index++) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) return index;
  }
  throw new Error("Unterminated JSON object");
}

function replaceStringProperty(block, key, value) {
  const pattern = new RegExp(`("${key}"\\s*:\\s*)"(?:\\\\.|[^"\\\\])*"`);
  if (!pattern.test(block)) throw new Error(`Missing ${key} property in ayah block`);
  return block.replace(pattern, `$1${JSON.stringify(value)}`);
}

function updateSection(source, sectionName, canonical) {
  const sectionMarker = `  "${sectionName}": {`;
  const sectionStart = source.indexOf(sectionMarker);
  if (sectionStart < 0) throw new Error(`Missing ${sectionName} section`);
  const ayahMarker = '    "ayah": {';
  const ayahStart = source.indexOf(ayahMarker, sectionStart);
  if (ayahStart < 0) throw new Error(`Missing ${sectionName}.ayah section`);
  const braceStart = source.indexOf("{", ayahStart);
  const ayahEnd = findMatchingBrace(source, braceStart);
  let block = source.slice(ayahStart, ayahEnd + 1);
  block = replaceStringProperty(block, "ar", canonical.ar);
  block = replaceStringProperty(block, "en", canonical.en);
  block = replaceStringProperty(block, "ur", canonical.ur);
  return source.slice(0, ayahStart) + block + source.slice(ayahEnd + 1);
}

async function main() {
  const files = fs.readdirSync(FIXTURES_DIR).filter((name) => name.endsWith(".json")).sort();
  const fixtures = files.map((file) => ({
    file,
    data: JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, file), "utf8")),
  }));
  const verseKeys = new Set();
  for (const { data } of fixtures) {
    for (const section of ["hook", "reveal"]) {
      const ayah = data[section]?.ayah;
      if (Number.isInteger(ayah?.surah) && Number.isInteger(ayah?.ayah) && typeof ayah.ar === "string") {
        verseKeys.add(`${ayah.surah}:${ayah.ayah}`);
      }
    }
  }

  const canonicalByKey = await mapWithConcurrency([...verseKeys], fetchCanonical);
  const issues = [];
  const labelIssues = [];
  let filesChanged = 0;

  for (const { file, data } of fixtures) {
    let source = fs.readFileSync(path.join(FIXTURES_DIR, file), "utf8");
    let changed = false;
    for (const section of ["hook", "reveal"]) {
      const ayah = data[section]?.ayah;
      if (!Number.isInteger(ayah?.surah) || !Number.isInteger(ayah?.ayah) || typeof ayah.ar !== "string") continue;
      const verseKey = `${ayah.surah}:${ayah.ayah}`;
      const labelReference = String(ayah.label ?? "").match(/(\d+)\s*:\s*(\d+)/);
      if (!labelReference || Number(labelReference[1]) !== ayah.surah || Number(labelReference[2]) !== ayah.ayah) {
        labelIssues.push({ file, section, verseKey, label: ayah.label });
      }
      const canonical = canonicalByKey.get(verseKey);
      if (isCanonicalExcerpt(ayah.ar, canonical.ar)) continue;

      issues.push({ file, section, verseKey });
      if (WRITE) {
        source = updateSection(source, section, canonical);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(path.join(FIXTURES_DIR, file), source, "utf8");
      filesChanged++;
    }
  }

  for (const issue of issues) {
    console.log(`  [${WRITE ? "FIXED" : "MISMATCH"}] ${issue.file} ${issue.section}.ayah ${issue.verseKey}`);
  }
  for (const issue of labelIssues) {
    console.log(`  [LABEL MISMATCH] ${issue.file} ${issue.section}.ayah ${issue.verseKey} label=${issue.label}`);
  }
  console.log("\n" + "-".repeat(60));
  console.log(`Ayah entries checked: ${fixtures.reduce((sum, { data }) => sum + [data.hook?.ayah, data.reveal?.ayah].filter((ayah) => Number.isInteger(ayah?.surah) && Number.isInteger(ayah?.ayah)).length, 0)}`);
  console.log(`Ayah issues ${WRITE ? "fixed" : "found"}: ${issues.length}`);
  console.log(`Label/reference issues found: ${labelIssues.length}`);
  console.log(`Files changed: ${filesChanged}`);
  console.log("-".repeat(60));
  if ((!WRITE && issues.length) || labelIssues.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
