import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    { letter: "ا", transliteration: "Alif", meaning: "A" },
    { letter: "ب", transliteration: "Ba", meaning: "B" },
    { letter: "ت", transliteration: "Ta", meaning: "T" },
    { letter: "ث", transliteration: "Tha", meaning: "Th" },
    { letter: "ج", transliteration: "Jeem", meaning: "J" },
    { letter: "ح", transliteration: "Ha", meaning: "H" },
    { letter: "خ", transliteration: "Kha", meaning: "Kh" },
    { letter: "د", transliteration: "Dal", meaning: "D" },
    { letter: "ذ", transliteration: "Dhal", meaning: "Dh" },
    { letter: "ر", transliteration: "Ra", meaning: "R" }
  ];

  for (let index = 0; index < letters.length; index += 1) {
    const letter = letters[index];
    await prisma.lesson.create({
      data: {
        chapterId: chapter.id,
        order: index + 1,
        title: `Letter ${letter.transliteration}`,
        titleAr: `درس ${letter.letter}`,
        type: index % 2 === 0 ? "FLASHCARD" : "FILL_BLANK",
        xpReward: 10,
        content: index % 2 === 0
          ? {
              question: `${letter.letter} — ${letter.transliteration}`,
              answer: letter.meaning,
              example: `مثال: ${letter.letter}...`
            }
          : {
              question: `Choose the correct letter for ${letter.meaning}`,
              options: letters.slice(0, 4).map((option) => option.letter),
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
