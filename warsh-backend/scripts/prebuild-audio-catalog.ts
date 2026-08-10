/**
 * Materialize all fixed learner-facing Arabic audio before deployment.
 *
 * Runtime routes are lookup-only. This admin script is the only place allowed
 * to call the speech provider for catalogue and vocabulary assets.
 *
 *   npm run audio:prebuild-catalog -- --dry-run
 *   npm run audio:prebuild-catalog -- --fixtures-only
 *   npm run audio:prebuild-catalog
 */
import fs from "fs";
import path from "path";
import { catalogAudioKey, normalizeCatalogAudioText } from "../lib/audioCatalog";
import { generateTtsMp3 } from "../lib/tts";
import { getR2PublicUrl, listR2Keys, r2KeyExists, uploadAudioToR2, vocabWordAudioKey } from "../lib/r2";

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");
const FIXTURES_ONLY = process.argv.includes("--fixtures-only");
const AUDIT = process.argv.includes("--audit");
const ONLY_KEYS = new Set(
  process.argv.filter((arg) => arg.startsWith("--key=")).map((arg) => arg.slice("--key=".length)),
);
const CONCURRENCY = 8;
const FIXTURES_DIR = path.join(__dirname, "../prisma/fixtures");

type CatalogItem = { text: string; key: string; sources: Set<string> };
type VocabularyItem = { id: string; arabic: string; audioUrl: string | null };

const catalogue = new Map<string, CatalogItem>();
let prismaClient: (typeof import("../lib/prisma"))["prisma"] | null = null;

async function getPrisma() {
  if (!prismaClient) prismaClient = (await import("../lib/prisma")).prisma;
  return prismaClient;
}

function addCatalogueText(text: unknown, source: string) {
  if (typeof text !== "string") return;
  const normalized = normalizeCatalogAudioText(text);
  if (!normalized) return;
  const key = catalogAudioKey(normalized);
  const existing = catalogue.get(key);
  if (existing) existing.sources.add(source);
  else catalogue.set(key, { text: normalized, key, sources: new Set([source]) });
}

function discoverAudioText(card: Record<string, any>): string | undefined {
  if (card.type === "GRAMMAR_NOTE") return card.title?.ar;
  if (card.type === "SENTENCE") return card.text?.ar;
  return card.text?.ar ?? card.concept?.ar ?? card.examples?.[0]?.ar;
}

function exerciseAudioText(exercise: Record<string, any>): string | undefined {
  switch (exercise.type) {
    case "TAP_TRANSLATION":
      return exercise.direction === "en_to_ar" ? undefined : exercise.prompt?.ar;
    case "TRUE_FALSE": return exercise.statement?.ar_example?.ar;
    case "FILL_BLANK": return exercise.sentence_ar;
    case "SHADOW_REPEAT": return exercise.phrase?.ar;
    case "HARAKAH_PLACEMENT": return exercise.word_unvowelled;
    case "IDENTIFY_ROOT": return exercise.word?.ar;
    // Quran fragments require exact human audio, never synthesized catalogue audio.
    case "MATCH_AYAH": return undefined;
    default: return undefined;
  }
}

function collectFixtures() {
  for (const filename of fs.readdirSync(FIXTURES_DIR).filter((name) => name.endsWith(".json"))) {
    const lesson = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), "utf8"));
    for (const [index, card] of (lesson.discover_cards ?? []).entries()) {
      if (!card.audio_url) addCatalogueText(discoverAudioText(card), `${filename}:discover:${index}`);
    }
    for (const [index, exercise] of (lesson.exercises ?? []).entries()) {
      if (!exercise.audio_url) addCatalogueText(exerciseAudioText(exercise), `${filename}:exercise:${index}`);
    }
  }
}

async function collectDatabaseAudio(): Promise<VocabularyItem[]> {
  const prisma = await getPrisma();
  const [words, surahs] = await Promise.all([
    prisma.vocabularyWord.findMany({
      select: { id: true, arabic: true, audioUrl: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.tadabburSurah.findMany({ select: { id: true, ayatData: true } }),
  ]);

  for (const surah of surahs) {
    const ayat = Array.isArray(surah.ayatData) ? surah.ayatData : [];
    for (const [ayahIndex, ayah] of ayat.entries()) {
      const wordsInAyah = Array.isArray((ayah as any)?.words) ? (ayah as any).words : [];
      for (const [wordIndex, word] of wordsInAyah.entries()) {
        addCatalogueText((word as any)?.arabic, `tadabbur:${surah.id}:${ayahIndex}:${wordIndex}`);
      }
    }
  }

  return words;
}

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>, concurrency = CONCURRENCY) {
  const queue = [...items];
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const item = queue.shift();
      if (item) await worker(item);
    }
  }));
}

function errorDetails(error: unknown): string {
  if (error instanceof Error) {
    const fields = error as Error & { status?: number; code?: string; type?: string };
    return JSON.stringify({ message: fields.message, status: fields.status, code: fields.code, type: fields.type });
  }
  try { return JSON.stringify(error); } catch { return String(error); }
}

async function main() {
  collectFixtures();
  const vocabulary = FIXTURES_ONLY || (DRY_RUN && !process.env.DATABASE_URL)
    ? []
    : await collectDatabaseAudio();

  const catalogItems = [...catalogue.values()].filter((item) => ONLY_KEYS.size === 0 || ONLY_KEYS.has(item.key));
  const vocabularyItems = ONLY_KEYS.size === 0 ? vocabulary : [];
  const totalCharacters = catalogItems.reduce((sum, item) => sum + item.text.length, 0)
    + vocabularyItems.reduce((sum, word) => sum + word.arabic.length, 0);

  console.log(`Catalogue: ${catalogItems.length} unique fixed Arabic clips.`);
  console.log(`Vocabulary: ${vocabularyItems.length} stable word clips.`);
  console.log(`One-time generation input: ${totalCharacters} characters.`);

  if (DRY_RUN) {
    console.log("Dry run complete; no R2 objects or database rows were changed.");
    return;
  }

  if (AUDIT) {
    const targets = [
      ...catalogItems.map((item) => ({ key: item.key, label: item.text })),
      ...vocabularyItems.map((word) => ({ key: vocabWordAudioKey(word.id), label: word.arabic })),
    ];
    const [catalogueKeys, vocabularyKeys] = await Promise.all([
      listR2Keys("audio/catalog/v1/"),
      listR2Keys("audio/words/"),
    ]);
    const available = new Set([...catalogueKeys, ...vocabularyKeys]);
    const missing = targets.filter((target) => !available.has(target.key));
    for (const target of missing) console.error(`[missing-audio] ${target.key} ← ${target.label}`);
    console.log(`R2 coverage: ${targets.length - missing.length}/${targets.length}; missing: ${missing.length}.`);
    if (missing.length) process.exitCode = 1;
    return;
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let catalogueProcessed = 0;
  let vocabularyProcessed = 0;

  await runPool(catalogItems, async (item) => {
    try {
      if (!FORCE && await r2KeyExists(item.key)) {
        skipped++;
        return;
      }
      await uploadAudioToR2(item.key, await generateTtsMp3(item.text));
      generated++;
    } catch (error) {
      failed++;
      console.error(`[audio-catalog] ${item.key} ← ${item.text} (${[...item.sources][0]}): ${errorDetails(error)}`);
    } finally {
      catalogueProcessed++;
      if (catalogueProcessed % 100 === 0 || catalogueProcessed === catalogItems.length) {
        console.log(`Catalogue progress: ${catalogueProcessed}/${catalogItems.length}`);
      }
    }
  });

  await runPool(vocabularyItems, async (word) => {
    const key = vocabWordAudioKey(word.id);
    try {
      if (FORCE || !(await r2KeyExists(key))) {
        await uploadAudioToR2(key, await generateTtsMp3(word.arabic));
        generated++;
      } else {
        skipped++;
      }
      const audioUrl = getR2PublicUrl(key);
      if (word.audioUrl !== audioUrl) {
        const prisma = await getPrisma();
        await prisma.vocabularyWord.update({ where: { id: word.id }, data: { audioUrl } });
      }
    } catch (error) {
      failed++;
      console.error(`[vocabulary-audio] ${word.id} ← ${word.arabic}: ${errorDetails(error)}`);
    } finally {
      vocabularyProcessed++;
      if (vocabularyProcessed % 100 === 0 || vocabularyProcessed === vocabularyItems.length) {
        console.log(`Vocabulary progress: ${vocabularyProcessed}/${vocabularyItems.length}`);
      }
    }
  });

  console.log(`Generated: ${generated}; already present: ${skipped}; failed: ${failed}.`);
  if (failed) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prismaClient) await prismaClient.$disconnect();
  });
