require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const PROGRESS_STATUS = {
  COMPLETED: "COMPLETED",
  SKIPPED_BY_PLACEMENT: "SKIPPED_BY_PLACEMENT",
};

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
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    fail("dev-unlock-through refuses to run when NODE_ENV or VERCEL_ENV is production.");
  }

  if (!process.env.DATABASE_URL) {
    fail("DATABASE_URL is not set.");
  }

  const args = parseArgs(process.argv.slice(2));
  const email = args.email;
  const userId = args["user-id"];
  const throughChapter = Number(args.chapter);
  const rawStatus = (args.status || "skipped").toLowerCase();

  if (!email && !userId) {
    fail("Pass --email <email> or --user-id <id>.");
  }

  if (!Number.isInteger(throughChapter) || throughChapter < 1) {
    fail("Pass --chapter <positive integer>.");
  }

  const status =
    rawStatus === "completed"
      ? PROGRESS_STATUS.COMPLETED
      : rawStatus === "skipped"
        ? PROGRESS_STATUS.SKIPPED_BY_PLACEMENT
        : null;

  if (!status) {
    fail("--status must be either skipped or completed. Default is skipped.");
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email },
      select: { id: true, email: true },
    });

    if (!user) {
      fail(`No user found for ${userId ? `id ${userId}` : `email ${email}`}.`);
    }

    const lessons = await prisma.lesson.findMany({
      where: { chapter: { order: { lte: throughChapter } } },
      select: {
        id: true,
        xpReward: true,
        chapter: { select: { order: true } },
      },
      orderBy: [{ chapter: { order: "asc" } }, { order: "asc" }],
    });

    if (lessons.length === 0) {
      fail(`No lessons found through chapter ${throughChapter}. Run npm run db:seed first if content was just added.`);
    }

    const completedAt = status === PROGRESS_STATUS.COMPLETED ? new Date() : null;

    await prisma.$transaction(
      lessons.map((lesson) =>
        prisma.progress.upsert({
          where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
          create: {
            userId: user.id,
            lessonId: lesson.id,
            completed: status === PROGRESS_STATUS.COMPLETED,
            status,
            attempts: status === PROGRESS_STATUS.COMPLETED ? 1 : 0,
            xpEarned: status === PROGRESS_STATUS.COMPLETED ? lesson.xpReward : 0,
            completedAt,
          },
          update: {
            completed: status === PROGRESS_STATUS.COMPLETED,
            status,
            attempts: status === PROGRESS_STATUS.COMPLETED ? 1 : 0,
            xpEarned: status === PROGRESS_STATUS.COMPLETED ? lesson.xpReward : 0,
            completedAt,
          },
        })
      )
    );

    const statusLabel = status === PROGRESS_STATUS.COMPLETED ? "completed" : "skipped by placement";
    console.log(`Unlocked through Chapter ${throughChapter} for ${user.email}.`);
    console.log(`Updated ${lessons.length} lesson progress rows as ${statusLabel}.`);
    console.log(`Next chapter available: Chapter ${throughChapter + 1}, unless DEV_UNLOCK_ALL already unlocks everything.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
