require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || ""
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.progress.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.user.deleteMany();

  const chapter = await prisma.chapter.create({
    data: {
      order: 1,
      title: "Alphabet",
      titleAr: "الأبجدية",
      description: "Learn the first 10 Arabic letters with flashcards and fill-in-the-blank practice.",
      worldMapX: 0.1,
      worldMapY: 0.1,
      isLocked: false
    }
  });

  const letters = [
    { letter: "ا", transliteration: "Alif", meaning: "A", example: "أسد" },
    { letter: "ب", transliteration: "Ba", meaning: "B", example: "بيت" },
    { letter: "ت", transliteration: "Ta", meaning: "T", example: "تمر" },
    { letter: "ث", transliteration: "Tha", meaning: "Th", example: "ثوب" },
    { letter: "ج", transliteration: "Jeem", meaning: "J", example: "جمل" },
    { letter: "ح", transliteration: "Ha", meaning: "H", example: "حصان" },
    { letter: "خ", transliteration: "Kha", meaning: "Kh", example: "خبز" },
    { letter: "د", transliteration: "Dal", meaning: "D", example: "دار" },
    { letter: "ذ", transliteration: "Dhal", meaning: "Dh", example: "ذهب" },
    { letter: "ر", transliteration: "Ra", meaning: "R", example: "رجل" }
  ];

  for (const [index, letter] of letters.entries()) {
    const options = letters
      .slice(Math.max(0, index - 1), Math.max(4, index + 3))
      .slice(0, 4)
      .map((option) => option.letter);

    if (!options.includes(letter.letter)) {
      options[0] = letter.letter;
    }

    await prisma.lesson.create({
      data: {
        chapterId: chapter.id,
        order: index + 1,
        title: `Letter ${letter.transliteration}`,
        titleAr: `درس ${letter.letter}`,
        type: index % 2 === 0 ? "FLASHCARD" : "FILL_BLANK",
        xpReward: 10,
        content:
          index % 2 === 0
            ? {
                question: `${letter.letter} - ${letter.transliteration}`,
                answer: letter.meaning,
                example: `Example: ${letter.example}`
              }
            : {
                question: `Choose the correct Arabic letter for ${letter.meaning}`,
                options,
                answer: letter.letter
              }
      }
    });
  }

  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
