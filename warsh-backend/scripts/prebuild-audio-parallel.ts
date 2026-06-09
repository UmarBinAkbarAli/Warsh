import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateTtsMp3 } from "../lib/tts";
import { uploadAudioToR2, vocabWordAudioKey } from "../lib/r2";

const CONCURRENCY = 10;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

let done = 0;
let failed = 0;
let total = 0;

async function processWord(word: { id: string; arabic: string; arabicPlain: string }) {
  try {
    const audioBuffer = await generateTtsMp3(word.arabic);
    const key = vocabWordAudioKey(word.id);
    const audioUrl = await uploadAudioToR2(key, audioBuffer);
    await prisma.vocabularyWord.update({ where: { id: word.id }, data: { audioUrl } });
    done++;
    console.log(`[${done + failed}/${total}] ✓  ${word.arabic} (${word.arabicPlain})`);
  } catch (err) {
    failed++;
    console.error(`[${done + failed}/${total}] ✗  ${word.arabic} — ${err instanceof Error ? err.message : err}`);
  }
}

async function runPool(words: { id: string; arabic: string; arabicPlain: string }[]) {
  total = words.length;
  const queue = [...words];

  async function worker() {
    while (queue.length > 0) {
      const word = queue.shift();
      if (word) await processWord(word);
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
}

async function main() {
  const words = await prisma.vocabularyWord.findMany({
    where: { audioUrl: null },
    select: { id: true, arabic: true, arabicPlain: true },
    orderBy: { sortOrder: "asc" },
  });

  console.log(`Found ${words.length} words without audio. Running ${CONCURRENCY} parallel workers...\n`);

  if (words.length === 0) {
    console.log("All words already have audio. Nothing to do.");
    await prisma.$disconnect();
    return;
  }

  const start = Date.now();
  await runPool(words);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`\nDone in ${elapsed}s. ✓ ${done} generated, ✗ ${failed} failed.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

