require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const SKIPPED_BY_PLACEMENT = "SKIPPED_BY_PLACEMENT";

// Marks every published lesson that a single account has no Progress row for as
// SKIPPED_BY_PLACEMENT, so an account that was previously unlocked end-to-end
// stays unlocked after new lessons are added to already-passed chapters.
// It only inserts missing rows: existing progress (COMPLETED or otherwise) is
// never rewritten, and no other user's rows are touched.
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

async function main() {
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is not set.");

  const args = parseArgs(process.argv.slice(2));
  const email = args.email;
  const userId = args["user-id"];
  const apply = args.apply === "true";

  if (!email && !userId) fail("Pass --email <email> or --user-id <id>.");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email },
      select: { id: true, email: true },
    });
    if (!user) fail(`No user found for ${userId ? `id ${userId}` : `email ${email}`}.`);

    const lessons = await prisma.lesson.findMany({
      where: { status: "PUBLISHED", chapter: { status: "PUBLISHED" } },
      select: { id: true, title: true, chapter: { select: { order: true } } },
      orderBy: [{ chapter: { order: "asc" } }, { order: "asc" }],
    });
    const existing = await prisma.progress.findMany({
      where: { userId: user.id },
      select: { lessonId: true },
    });
    const known = new Set(existing.map((row) => row.lessonId));
    const missing = lessons.filter((lesson) => !known.has(lesson.id));

    console.log(`User: ${user.email} (${user.id})`);
    console.log(`Published lessons: ${lessons.length}, existing progress rows: ${existing.length}, missing: ${missing.length}`);
    for (const lesson of missing) {
      console.log(`  + Ch${lesson.chapter.order} ${lesson.title}`);
    }

    if (missing.length === 0) {
      console.log("Nothing to backfill.");
      return;
    }

    if (!apply) {
      console.log("\nDry run. Re-run with --apply to insert these rows.");
      return;
    }

    const result = await prisma.progress.createMany({
      data: missing.map((lesson) => ({
        userId: user.id,
        lessonId: lesson.id,
        completed: false,
        status: SKIPPED_BY_PLACEMENT,
        attempts: 0,
        xpEarned: 0,
      })),
      skipDuplicates: true,
    });
    console.log(`\nInserted ${result.count} skipped-by-placement rows for ${user.email}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
