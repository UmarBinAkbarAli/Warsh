import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateTtsMp3 } from "../lib/tts";
import { uploadAudioToR2, vocabWordAudioKey } from "../lib/r2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const BATCH_DELAY_MS = 300; // stay under OpenAI TTS rate limits

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const words = await prisma.vocabularyWord.findMany({
    where: { audioUrl: null },
    select: { id: true, arabic: true, arabicPlain: true },
    orderBy: { sortOrder: "asc" },
  });

  console.log(`Found ${words.length} words without audio. Starting generation...\n`);

  let done = 0;
  let failed = 0;

  for (const word of words) {
    try {
      const audioBuffer = await generateTtsMp3(word.arabic);
      const key = vocabWordAudioKey(word.id);
      const audioUrl = await uploadAudioToR2(key, audioBuffer);

      await prisma.vocabularyWord.update({
        where: { id: word.id },
        data: { audioUrl },
      });

      done++;
      console.log(`[${done}/${words.length}] ✓  ${word.arabic} (${word.arabicPlain})`);
    } catch (err) {
      failed++;
      console.error(`[FAIL] ${word.arabic} — ${err instanceof Error ? err.message : err}`);
    }

    if (done + failed < words.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`\nDone. ${done} generated, ${failed} failed.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
