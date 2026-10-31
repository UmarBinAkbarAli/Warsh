/**
 * Runs Warsh Studio's automatic lesson checks (lib/lessonChecks.ts) over the
 * fixture mirror and prints what the review screen would flag.
 *
 *   npx tsx scripts/check-lessons.ts               # summary per lesson
 *   npx tsx scripts/check-lessons.ts --chapter=2   # one chapter, every problem
 *   npx tsx scripts/check-lessons.ts --codes       # totals per problem type
 */
import fs from "fs";
import path from "path";
import { checkLesson, summarizeProblems, type VocabIntro } from "../lib/lessonChecks";

const dir = path.join(__dirname, "../prisma/fixtures");
const chapterArg = process.argv.find((a) => a.startsWith("--chapter="))?.split("=")[1];
const codesOnly = process.argv.includes("--codes");

const lessons = fs
  .readdirSync(dir)
  .filter((f) => /^chapter-\d+-lesson-\d+/.test(f))
  .map((file) => {
    const [, ch, ls] = file.match(/^chapter-(\d+)-lesson-(\d+)/)!;
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    return { file, id: file, chapter: Number(ch), lesson: Number(ls), content, template: String(content.template ?? "STANDARD") };
  });

const intros: VocabIntro[] = lessons.flatMap((l) =>
  (Array.isArray(l.content.discover_cards) ? l.content.discover_cards : [])
    .map((c: { introduces_vocab?: { ar_plain?: string } }) => c?.introduces_vocab?.ar_plain)
    .filter(Boolean)
    .map((plain: string) => ({ plain, lessonId: l.id, chapter: l.chapter, lesson: l.lesson, review: l.template === "REVIEW" })),
);

const totals = new Map<string, number>();
let flagged = 0;
for (const l of lessons) {
  if (chapterArg && l.chapter !== Number(chapterArg)) continue;
  const problems = checkLesson(l.content, { lessonId: l.id, chapter: l.chapter, lesson: l.lesson, template: l.template, intros });
  for (const p of problems) totals.set(p.code, (totals.get(p.code) ?? 0) + 1);
  if (problems.length) flagged += 1;
  if (codesOnly) continue;
  if (chapterArg) {
    console.log(`\n${l.file} — ${problems.length}`);
    for (const p of problems) console.log(`  ${p.where}: ${p.text}${p.fix ? `  [fix: ${p.fix.label}]` : ""}`);
  } else if (problems.length) {
    console.log(`${l.file}: ${problems.length} · ${summarizeProblems(problems)}`);
  }
}
console.log(`\n${flagged} lesson(s) with problems`);
console.log([...totals.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}: ${n}`).join("\n"));
