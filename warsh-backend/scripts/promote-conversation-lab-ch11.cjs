/**
 * Scoped promotion of the first Conversation Lab: CL6 Home and Family in
 * Chapter 11 (Docs/proposals/conversation-labs-curriculum-proposal.md, Pen
 * section 25).
 *
 * Creates (or refreshes) ch11-cl06 at display order 6 and moves ch11-l06
 * (review) and ch11-test to orders 7 and 8. Only those three rows are written,
 * and the review and test keep their content — only their order changes. No
 * other lesson and no progress row is touched.
 *
 * Learners who had already finished Chapter 11 would now read 7/8 and have
 * everything after it re-locked. Straight after --apply, run:
 *
 *   npm run content:backfill-new-lessons -- --lesson-ids ch11-cl06 --apply
 *
 * Usage:
 *   npm run content:promote-conversation-lab-ch11
 *   npm run content:promote-conversation-lab-ch11 -- --apply
 */

require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { LessonContentSchema } = require("@warsh/lesson-schema");

const APPLY = process.argv.includes("--apply");
const FIXTURE = path.join(__dirname, "../prisma/fixtures/chapter-11-lesson-06-conversation-lab.json");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const LAB = {
  id: "ch11-cl06",
  order: 6,
  title: "Home and Family — Conversation Lab",
  titleAr: "مَنْ هَذَا؟",
  template: "SPOKEN_PHRASES",
};
const REORDER = [
  { id: "ch11-l06", order: 7 },
  { id: "ch11-test", order: 8 },
];
const EXPECTED_ORDER = ["ch11-l01", "ch11-l02", "ch11-l03", "ch11-l04", "ch11-l05", "ch11-cl06", "ch11-l06", "ch11-test"];

async function main() {
  const content = JSON.parse(fs.readFileSync(FIXTURE, "utf8"));
  const parsed = LessonContentSchema.safeParse(content);
  if (!parsed.success) {
    throw new Error(`Lab fixture fails @warsh/lesson-schema:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  if (!content.spoken_phrases?.lab) throw new Error("Lab fixture has no spoken_phrases.lab block.");

  const chapter = await prisma.chapter.findUnique({ where: { order: 11 }, select: { id: true } });
  if (!chapter) throw new Error("Chapter 11 does not exist.");
  const existing = await prisma.lesson.findMany({
    where: { chapterId: chapter.id },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });
  const unexpected = existing.filter(({ id }) => !EXPECTED_ORDER.includes(id));
  if (unexpected.length) throw new Error(`Unexpected Chapter 11 lesson IDs: ${unexpected.map(({ id }) => id).join(", ")}`);
  for (const { id } of REORDER) {
    if (!existing.some((lesson) => lesson.id === id)) throw new Error(`${id} is missing; promote Chapter 11 first.`);
  }

  const labExists = existing.some(({ id }) => id === LAB.id);
  console.log(`${APPLY ? "Applying" : "Dry run for"} the Chapter 11 Conversation Lab:`);
  console.log(`  ${LAB.order}. ${LAB.id} — ${labExists ? "refresh" : "create"} — ${LAB.title}`);
  for (const { id, order } of REORDER) {
    const from = existing.find((lesson) => lesson.id === id)?.order;
    console.log(`  ${order}. ${id} — order ${from} -> ${order} (content unchanged)`);
  }
  if (!APPLY) {
    console.log("\nNo data changed. Re-run with --apply after reviewing this plan.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    const data = {
      chapterId: chapter.id,
      order: LAB.order,
      title: LAB.title,
      titleUr: content._meta?.titleUr ?? LAB.title,
      titleAr: LAB.titleAr,
      template: LAB.template,
      xpReward: content._meta?.xp_reward ?? 15,
      content,
    };
    await tx.lesson.upsert({
      where: { id: LAB.id },
      update: data,
      create: { id: LAB.id, ...data, status: "PUBLISHED", publishedAt: new Date() },
    });
    for (const { id, order } of REORDER) {
      await tx.lesson.update({ where: { id }, data: { order } });
    }
  }, { timeout: 30000 });

  const verified = await prisma.lesson.findMany({
    where: { chapterId: chapter.id },
    orderBy: { order: "asc" },
    select: { id: true, order: true, status: true },
  });
  const ids = verified.map(({ id }) => id);
  if (ids.join(",") !== EXPECTED_ORDER.join(",") || verified.some((lesson, index) => lesson.order !== index + 1 || lesson.status !== "PUBLISHED")) {
    throw new Error(`Post-promotion verification failed: ${verified.map(({ id, order, status }) => `${order}:${id}:${status}`).join(", ")}`);
  }
  console.log("\nConversation Lab applied and verified. Learner progress rows were not modified.");
  console.log("Next: npm run content:backfill-new-lessons -- --lesson-ids ch11-cl06 --apply");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
