require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

function fail(message) {
  console.error(`Urdu audit failed: ${message}`);
  process.exit(1);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function auditLocalizedNodes(value, pathLabel, issues) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => auditLocalizedNodes(item, `${pathLabel}[${index}]`, issues));
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  if (Object.prototype.hasOwnProperty.call(value, "en") && hasText(value.en) && !hasText(value.ur)) {
    issues.push(`${pathLabel} has .en content but no .ur translation`);
  }

  for (const [key, child] of Object.entries(value)) {
    auditLocalizedNodes(child, `${pathLabel}.${key}`, issues);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    fail("DATABASE_URL is not set.");
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const issues = [];

    const [chapters, lessons, vocabularyWords] = await Promise.all([
      prisma.chapter.findMany({
        orderBy: { order: "asc" },
        select: { id: true, order: true, title: true, titleUr: true, description: true, descriptionUr: true },
      }),
      prisma.lesson.findMany({
        orderBy: [{ chapter: { order: "asc" } }, { order: "asc" }],
        select: { id: true, title: true, titleUr: true },
      }),
      prisma.vocabularyWord.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, arabic: true, translationEn: true, translationUr: true, quranicExample: true },
      }),
    ]);

    for (const chapter of chapters) {
      if (hasText(chapter.title) && !hasText(chapter.titleUr)) {
        issues.push(`chapter ${chapter.order} is missing titleUr`);
      }
      if (hasText(chapter.description) && !hasText(chapter.descriptionUr)) {
        issues.push(`chapter ${chapter.order} is missing descriptionUr`);
      }
    }

    for (const lesson of lessons) {
      if (hasText(lesson.title) && !hasText(lesson.titleUr)) {
        issues.push(`lesson ${lesson.id} is missing titleUr`);
      }
    }

    for (const word of vocabularyWords) {
      if (hasText(word.translationEn) && !hasText(word.translationUr)) {
        issues.push(`vocabulary word ${word.id} (${word.arabic}) is missing translationUr`);
      }

      const example = word.quranicExample;
      if (isPlainObject(example) && hasText(example.translationEn) && !hasText(example.translationUr)) {
        issues.push(`vocabulary word ${word.id} quranicExample is missing translationUr`);
      }
    }

    const fixturesDir = path.join(__dirname, "..", "prisma", "fixtures");
    for (const entry of fs.readdirSync(fixturesDir)) {
      if (!entry.endsWith(".json")) continue;
      const fullPath = path.join(fixturesDir, entry);
      const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      auditLocalizedNodes(parsed, entry, issues);
    }

    if (issues.length > 0) {
      fail(`found ${issues.length} issue(s):\n- ${issues.join("\n- ")}`);
    }

    console.log(
      `Urdu audit passed: ${chapters.length} chapters, ${lessons.length} lessons, ${vocabularyWords.length} vocabulary words, fixtures checked.`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
