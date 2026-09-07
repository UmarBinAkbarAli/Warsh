/**
 * Load the Quranic Core 500 into VocabularyWord.
 *
 *   npx tsx -r dotenv/config scripts/load-core-500.ts            # dry run
 *   npx tsx -r dotenv/config scripts/load-core-500.ts --apply    # write
 *
 * Reads the verified source list (`Docs/data/quranic-core-500.json`) and the
 * Warsh-authored glosses (`Docs/data/quranic-core-500-glosses.json`), then:
 *
 *   - matches each of the 500 against existing VocabularyWord rows by EXACT
 *     vowelled Arabic, so we never create a duplicate of a word the curriculum
 *     already teaches — and never merge a near-pair like مِن / مَن;
 *   - a match keeps its existing English/Urdu (a human wrote those and they are
 *     already published) and only gains quranicRank, coreSetNumber, the corpus
 *     frequency and the prefix flag. Where our gloss disagrees it is reported,
 *     not silently applied;
 *   - a miss is created as a DRAFT row carrying our glosses, for review in
 *     Warsh Studio before anything is published.
 *
 * Nothing is published by this script. Run against staging first.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../lib/prisma";
import { setNumberForRank, CORE_WORD_COUNT } from "../lib/core500";

interface SourceWord {
  rank: number;
  arabic: string;
  translit: string;
  meaning: string;
  freq: number;
  pos: string;
  corpus: number | null;
  flags: string[];
}

interface Gloss {
  rank: number;
  headword: string;
  translit: string;
  en: string;
  ur: string;
  isPrefix?: boolean;
  sourceForm?: string;
}

const APPLY = process.argv.includes("--apply");
const DOCS = join(__dirname, "..", "..", "Docs", "data");

const HARAKAT = /[ً-ْٰـ۟-۪ۨ-ۭ]/g;

/**
 * Exact identity: same letters AND the same vowelling, differing only by
 * Unicode composition or tatweel.
 *
 * The vowel marks are the whole word here. مِن ("from") and مَن ("who") are
 * different words, as are عَمِلَ (verb) / عَمَل (noun), كَفَرَ / كُفْر and
 * هَدَى / هُدًى — and the database already holds both members of each pair,
 * correctly glossed. A harakat-insensitive matcher merged them on the first
 * run and would have published rank 14 مَن with the gloss "from". So only an
 * exact match is allowed to merge.
 */
function identity(arabic: string): string {
  return (
    arabic
      .normalize("NFC")
      .split("ـ")
      .join("") // tatweel
      // Sukuun is optional notation: مِنْ and مِن are the same word.
      .split("ْ")
      .join("")
      // A fatha before alif is redundant — the alif already carries it. This
      // is the only difference between the source list's عَذاب and the
      // database's عَذَاب.
      .split("َا")
      .join("ا")
      // Dagger alif is just a written-short long a: the source writes إِلٰه and
      // رَحْمٰن where the database writes إِلَه and رَحْمَن. Same words.
      .split("ٰ")
      .join("َ")
      .trim()
  );
}

/**
 * Letters only, ignoring vowels and alif/ya/ta spelling. Used *solely* to flag
 * a possible duplicate for a human to look at — never to merge.
 */
function skeleton(arabic: string): string {
  let s = arabic.normalize("NFC").replace(HARAKAT, "");
  for (const alif of ["آ", "أ", "إ", "ٱ"]) {
    s = s.split(alif).join("ا");
  }
  return s.split("ى").join("ي").split("ة").join("ه").trim();
}

/** Undiacriticised form we store in arabicPlain, matching the seed convention. */
function toPlain(arabic: string): string {
  return arabic.replace(HARAKAT, "").trim();
}

// Matches the values already in the table (VERB_PAST dominates; plain VERB is
// rare). The 500 are cited in their dictionary past-tense form.
const POS_TO_WORD_TYPE: Record<string, string> = {
  Verb: "VERB_PAST",
  Noun: "NOUN",
  Adjective: "ADJECTIVE",
  "Proper noun": "PROPER_NOUN",
  "Verbal noun": "NOUN",
};

function wordTypeFor(pos: string): string {
  return POS_TO_WORD_TYPE[pos] ?? "PARTICLE";
}

async function main() {
  const source: SourceWord[] = JSON.parse(
    readFileSync(join(DOCS, "quranic-core-500.json"), "utf8"),
  );
  const glossFile = JSON.parse(
    readFileSync(join(DOCS, "quranic-core-500-glosses.json"), "utf8"),
  );
  const glosses: Gloss[] = glossFile.glosses;

  if (source.length !== CORE_WORD_COUNT || glosses.length !== CORE_WORD_COUNT) {
    throw new Error(
      `expected ${CORE_WORD_COUNT} source words and glosses, got ${source.length} and ${glosses.length}`,
    );
  }

  const glossByRank = new Map(glosses.map((g) => [g.rank, g]));
  const existing = await prisma.vocabularyWord.findMany({
    select: { id: true, arabic: true, translationEn: true, translationUr: true, quranicRank: true },
  });

  const byIdentity = new Map<string, (typeof existing)[number]>();
  const bySkeleton = new Map<string, Array<(typeof existing)[number]>>();
  for (const row of existing) {
    const id = identity(row.arabic);
    if (!byIdentity.has(id)) byIdentity.set(id, row);
    const skel = skeleton(row.arabic);
    const bucket = bySkeleton.get(skel);
    if (bucket) bucket.push(row);
    else bySkeleton.set(skel, [row]);
  }

  const toCreate: Array<Record<string, unknown>> = [];
  const toUpdate: Array<{ id: string; data: Record<string, unknown> }> = [];
  const glossConflicts: string[] = [];
  const possibleDuplicates: string[] = [];

  for (const word of source) {
    const gloss = glossByRank.get(word.rank);
    if (!gloss) throw new Error(`no gloss written for rank ${word.rank}`);

    const setNumber = setNumberForRank(word.rank);
    // The corpus count is the one we trust; the source page disagrees on 52.
    const frequency = word.corpus ?? word.freq;
    const match = byIdentity.get(identity(gloss.headword));

    if (match) {
      if (match.quranicRank !== null && match.quranicRank !== word.rank) {
        throw new Error(
          `rank ${word.rank} (${gloss.headword}) matched a row already holding rank ${match.quranicRank}`,
        );
      }
      // Keep the published human gloss; just note where ours differs so a
      // reviewer can decide, rather than overwriting live content.
      if (match.translationEn.toLowerCase() !== gloss.en.toLowerCase()) {
        glossConflicts.push(
          `  rank ${word.rank} ${gloss.headword}: db "${match.translationEn}" vs ours "${gloss.en}"`,
        );
      }
      toUpdate.push({
        id: match.id,
        data: {
          quranicRank: word.rank,
          coreSetNumber: setNumber,
          isCorePrefix: gloss.isPrefix === true,
          frequencyInQuran: frequency,
        },
      });
      continue;
    }

    // No exact match, so this becomes a new row. If a same-letters row exists,
    // say so — it is either a genuine near-pair (both should exist) or a real
    // duplicate for a reviewer to merge in Studio. We do not decide that here.
    const nearby = bySkeleton.get(skeleton(gloss.headword));
    if (nearby && nearby.length > 0) {
      possibleDuplicates.push(
        `  rank ${word.rank} ${gloss.headword} (${gloss.en}) — existing: ` +
          nearby.map((r) => `${r.arabic} "${r.translationEn}"`).join("; "),
      );
    }

    toCreate.push({
      arabic: gloss.headword,
      arabicPlain: toPlain(gloss.headword),
      transliteration: gloss.translit,
      translationEn: gloss.en,
      translationUr: gloss.ur,
      wordType: wordTypeFor(word.pos),
      topicCategories: ["quranic"],
      chapterIntroduced: 1,
      frequencyInQuran: frequency,
      sortOrder: word.rank,
      quranicRank: word.rank,
      coreSetNumber: setNumber,
      isCorePrefix: gloss.isPrefix === true,
      status: "DRAFT",
    });
  }

  console.log(`Quranic Core 500 load${APPLY ? "" : " (dry run)"}`);
  console.log(`  existing vocabulary rows: ${existing.length}`);
  console.log(`  already in the database, will be tagged: ${toUpdate.length}`);
  console.log(`  new DRAFT rows to create:               ${toCreate.length}`);
  console.log(`  glosses differing from the database:    ${glossConflicts.length}`);
  console.log(`  new rows resembling an existing word:   ${possibleDuplicates.length}`);
  if (glossConflicts.length) {
    console.log("\nGloss differences (existing wording is kept — review in Studio):");
    for (const line of glossConflicts) console.log(line);
  }
  if (possibleDuplicates.length) {
    console.log(
      "\nSame letters as an existing word. Check whether each is a genuine" +
        "\nnear-pair (min vs man) or a duplicate to merge in Studio:",
    );
    for (const line of possibleDuplicates) console.log(line);
  }

  if (!APPLY) {
    console.log("\nDry run. Re-run with --apply to write.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const { id, data } of toUpdate) {
      await tx.vocabularyWord.update({ where: { id }, data });
    }
    for (const data of toCreate) {
      await tx.vocabularyWord.create({ data: data as never });
    }
  });

  const tagged = await prisma.vocabularyWord.count({ where: { quranicRank: { not: null } } });
  console.log(`\nDone. Words carrying a quranicRank: ${tagged} (expected ${CORE_WORD_COUNT}).`);
  if (tagged !== CORE_WORD_COUNT) {
    throw new Error(`expected ${CORE_WORD_COUNT} ranked words, found ${tagged}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
