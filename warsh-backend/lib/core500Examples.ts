import { z } from "zod";

export const coreExampleSchema = z.object({
  surahNumber: z.number().int().min(1).max(114), ayahNumber: z.number().int().positive(),
  surahName: z.string().trim().min(1), arabic: z.string().trim().min(1),
  translationEn: z.string().trim().min(1), translationUr: z.string().trim().min(1),
  wordPosition: z.number().int().positive(), surface: z.string().trim().min(1),
  corpusPosition: z.number().int().positive(),
  matchKind: z.enum(["exact", "inflected", "prefix"]), source: z.string().url().refine(value => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && url.hostname === "corpus.quran.com" && !url.port && !url.username && !url.password && url.pathname === "/wordmorphology.jsp";
    } catch { return false; }
  }, "A Quranic Arabic Corpus occurrence link is required."),
}).strict();
export const coreExampleSetSchema = z.array(coreExampleSchema).length(3).superRefine((examples, ctx) => {
  if (new Set(examples.map(e => `${e.surahNumber}:${e.ayahNumber}`)).size !== 3) ctx.addIssue({ code: "custom", message: "Three different ayahs are required." });
  examples.forEach((e, i) => {
    if (e.arabic.split(/\s+/)[e.wordPosition - 1] !== e.surface) ctx.addIssue({ code: "custom", path: [i, "surface"], message: "Highlighted surface must equal the canonical word at that position." });
    let location: string | null = null;
    try { location = new URL(e.source).searchParams.get("location"); } catch { /* Already rejected by the URL schema. */ }
    if (location !== `(${e.surahNumber}:${e.ayahNumber}:${e.corpusPosition})`) ctx.addIssue({ code: "custom", path: [i, "source"], message: "Corpus source location must match the occurrence." });
  });
});
export type CoreExample = z.infer<typeof coreExampleSchema>;
function cleanTranslation(text: string) {
  return text.replace(/<sup[^>]*>.*?<\/sup>/gi, "").replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}
export async function canonicalCoreAyah(surahNumber: number, ayahNumber: number) {
  const response = await fetch(`https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${ayahNumber}?language=en&translations=20,234&fields=text_imlaei`, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Quran Foundation returned ${response.status} for ${surahNumber}:${ayahNumber}`);
  const { verse } = await response.json();
  const en = verse?.translations?.find((t: { resource_id: number }) => t.resource_id === 20)?.text;
  const ur = verse?.translations?.find((t: { resource_id: number }) => t.resource_id === 234)?.text;
  if (!verse?.text_imlaei || !en || !ur || verse.verse_key !== `${surahNumber}:${ayahNumber}`) throw new Error("Canonical ayah is incomplete.");
  return { arabic: verse.text_imlaei as string, translationEn: cleanTranslation(en), translationUr: cleanTranslation(ur) };
}
