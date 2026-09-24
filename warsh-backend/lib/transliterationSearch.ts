import { Prisma, type PrismaClient } from "@prisma/client";

// Learners type Roman spellings ("rahma", "rahmah", "salaah") while stored
// transliterations are scholarly ("raḥma", "ṣalāh"). Both sides are folded the
// same way: accents dropped, ʿ/ʾ/apostrophes/hyphens/spaces removed, ee/oo read
// as i/u, doubled letters collapsed, and a final "ah" read as "a".
// foldTransliteration and FOLDED_TRANSLITERATION_SQL must stay in step.

const ACCENTED = "āáàâīíìîūúùûḥṣṭḍẓḏṯġšḳẖ";
const PLAIN = "aaaaiiiiuuuuhstdzdtgskh";

export function foldTransliteration(value: string): string {
  let folded = value.toLowerCase();
  for (let i = 0; i < ACCENTED.length; i++) folded = folded.split(ACCENTED[i]).join(PLAIN[i]);
  return folded
    .replace(/[^a-z]/g, "")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/(.)\1+/g, "$1")
    .replace(/ah$/, "a");
}

const FOLDED_TRANSLITERATION_SQL = Prisma.sql`
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(translate(lower("transliteration"), ${ACCENTED}, ${PLAIN}), '[^a-z]', '', 'g'),
          'ee', 'i', 'g'),
        'oo', 'u', 'g'),
      '(.)\\1+', '\\1', 'g'),
    'ah$', 'a')`;

/** Ids of published words whose folded transliteration contains the folded query. */
export async function findWordIdsByTransliteration(
  db: PrismaClient,
  search: string,
): Promise<string[]> {
  const folded = foldTransliteration(search);
  if (folded.length < 2) return [];
  const rows = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "VocabularyWord"
    WHERE "status" = 'PUBLISHED'
      AND strpos(${FOLDED_TRANSLITERATION_SQL}, ${folded}) > 0`);
  return rows.map((row) => row.id);
}
