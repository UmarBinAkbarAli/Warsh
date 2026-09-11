require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const COMPLETED = "COMPLETED";
const SKIPPED_BY_PLACEMENT = "SKIPPED_BY_PLACEMENT";

/**
 * Keeps a published batch of new lessons from re-locking learners who had
 * already finished the chapter it lands in.
 *
 * `lib/course.ts` recomputes progression live: a chapter is satisfied only when
 * every currently published lesson in it is COMPLETED or SKIPPED_BY_PLACEMENT,
 * and the first unsatisfied chapter locks everything after it. Publishing a
 * ninth lesson into a chapter someone finished at eight drops them to 8/9 and
 * collapses their map, without deleting a single row.
 *
 * This inserts SKIPPED_BY_PLACEMENT rows for the new lessons, but only for
 * users who had satisfied every lesson that chapter held *before* the batch.
 * That status satisfies progression without counting as completion, so the
 * chapter honestly reads 8/9, the learner keeps their place, and the new
 * lesson stays available to them.
 *
 * Deliberately narrow, unlike scripts/backfill-skipped-progress.cjs, which
 * marks every missing lesson in the course for a single account and is only
 * safe on a test user.
 *
 *   npm run content:backfill-new-lessons -- --lesson-ids ch06-l09,ch06-l10
 *   npm run content:backfill-new-lessons -- --chapter 6 --published-after 2026-09-11
 *
 * Dry run unless --apply is passed. Re-running is safe.
 */
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

async function resolveBatchLessons(prisma, args) {
  const explicitIds = args["lesson-ids"];
  if (explicitIds && explicitIds !== "true") {
    const ids = explicitIds.split(",").map((value) => value.trim()).filter(Boolean);
    if (ids.length === 0) fail("--lesson-ids was empty.");

    const lessons = await prisma.lesson.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, status: true, chapterId: true },
    });

    const found = new Set(lessons.map((lesson) => lesson.id));
    const missing = ids.filter((id) => !found.has(id));
    if (missing.length > 0) fail(`No lesson found for: ${missing.join(", ")}`);

    const unpublished = lessons.filter((lesson) => lesson.status !== "PUBLISHED");
    if (unpublished.length > 0) {
      fail(
        `These lessons are not PUBLISHED yet, so they are not re-locking anyone: ${unpublished
          .map((lesson) => lesson.id)
          .join(", ")}. Publish the batch first, then run this.`,
      );
    }
    return lessons;
  }

  const chapterOrder = args.chapter;
  const publishedAfter = args["published-after"];
  if (!chapterOrder || chapterOrder === "true") {
    fail("Pass --lesson-ids <a,b,c>, or --chapter <order> with --published-after <date>.");
  }
  if (!publishedAfter || publishedAfter === "true") {
    fail("--chapter also needs --published-after <ISO date> to identify the batch.");
  }

  const since = new Date(publishedAfter);
  if (Number.isNaN(since.getTime())) fail(`--published-after is not a date: ${publishedAfter}`);

  const chapter = await prisma.chapter.findUnique({
    where: { order: Number(chapterOrder) },
    select: { id: true },
  });
  if (!chapter) fail(`No chapter with order ${chapterOrder}.`);

  return prisma.lesson.findMany({
    where: { chapterId: chapter.id, status: "PUBLISHED", publishedAt: { gte: since } },
    select: { id: true, title: true, status: true, chapterId: true },
  });
}

async function main() {
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is not set.");

  const args = parseArgs(process.argv.slice(2));
  const apply = args.apply === "true";

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const batch = await resolveBatchLessons(prisma, args);
    if (batch.length === 0) {
      console.log("No lessons matched. Nothing to do.");
      return;
    }

    const batchIds = new Set(batch.map((lesson) => lesson.id));
    const chapterIds = Array.from(new Set(batch.map((lesson) => lesson.chapterId)));

    const chapters = await prisma.chapter.findMany({
      where: { id: { in: chapterIds } },
      select: {
        id: true,
        order: true,
        title: true,
        status: true,
        lessons: {
          where: { status: "PUBLISHED" },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    const pending = [];

    for (const chapter of chapters) {
      const newLessons = chapter.lessons.filter((lesson) => batchIds.has(lesson.id));
      const priorLessons = chapter.lessons.filter((lesson) => !batchIds.has(lesson.id));

      console.log(`\nChapter ${chapter.order} — ${chapter.title}`);
      console.log(`  published lessons: ${chapter.lessons.length} (${priorLessons.length} existing, ${newLessons.length} new)`);

      if (chapter.status !== "PUBLISHED") {
        console.log("  SKIP: chapter is not published, so no learner is blocked by it.");
        continue;
      }
      if (priorLessons.length === 0) {
        console.log("  SKIP: every published lesson here is in the batch — nobody had completed this chapter.");
        continue;
      }

      const priorIds = priorLessons.map((lesson) => lesson.id);

      // A learner counts as having satisfied a prior lesson when it is
      // COMPLETED or SKIPPED_BY_PLACEMENT. Legacy rows can carry completed=true
      // with a stale status, and lib/course.ts treats those as COMPLETED, so
      // match that fallback here rather than reading status alone.
      const satisfied = await prisma.progress.groupBy({
        by: ["userId"],
        where: {
          lessonId: { in: priorIds },
          OR: [{ status: { in: [COMPLETED, SKIPPED_BY_PLACEMENT] } }, { completed: true }],
        },
        _count: { lessonId: true },
      });

      // The (userId, lessonId) unique constraint means one row per lesson, so a
      // full count is a fully satisfied chapter.
      const eligibleUserIds = satisfied
        .filter((row) => row._count.lessonId === priorIds.length)
        .map((row) => row.userId);

      console.log(`  learners who had finished this chapter: ${eligibleUserIds.length}`);
      if (eligibleUserIds.length === 0) continue;

      const existing = await prisma.progress.findMany({
        where: { userId: { in: eligibleUserIds }, lessonId: { in: newLessons.map((l) => l.id) } },
        select: { userId: true, lessonId: true },
      });
      const alreadyHas = new Set(existing.map((row) => `${row.userId}:${row.lessonId}`));

      for (const userId of eligibleUserIds) {
        for (const lesson of newLessons) {
          if (alreadyHas.has(`${userId}:${lesson.id}`)) continue;
          pending.push({ userId, lessonId: lesson.id });
        }
      }

      for (const lesson of newLessons) {
        const count = eligibleUserIds.filter((userId) => !alreadyHas.has(`${userId}:${lesson.id}`)).length;
        console.log(`    + ${lesson.id} — ${lesson.title}: ${count} row(s)`);
      }
    }

    console.log(`\nRows to insert: ${pending.length}`);
    if (pending.length === 0) {
      console.log("Nothing to backfill.");
      return;
    }

    if (!apply) {
      console.log("\nDry run. Re-run with --apply to insert these rows.");
      return;
    }

    const result = await prisma.progress.createMany({
      data: pending.map((row) => ({
        userId: row.userId,
        lessonId: row.lessonId,
        completed: false,
        status: SKIPPED_BY_PLACEMENT,
        attempts: 0,
        xpEarned: 0,
      })),
      skipDuplicates: true,
    });
    console.log(`\nInserted ${result.count} skipped-by-placement row(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
