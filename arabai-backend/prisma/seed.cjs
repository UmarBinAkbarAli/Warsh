require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || ""
});

const prisma = new PrismaClient({ adapter });

const chapters = [
  {
    order: 1,
    title: "Alphabet",
    titleAr: "\u0627\u0644\u0623\u0628\u062c\u062f\u064a\u0629",
    description: "Learn the first Arabic letters with flashcards and recognition practice.",
    worldMapX: 0.1,
    worldMapY: 0.1,
    isLocked: false,
    lessons: [
      { title: "Letter Alif", titleAr: "\u062f\u0631\u0633 \u0627", type: "FLASHCARD", content: { question: "\u0627 - Alif", answer: "A long aa sound", example: "Example: \u0623\u0633\u062f (asad)" } },
      { title: "Letter Ba", titleAr: "\u062f\u0631\u0633 \u0628", type: "FILL_BLANK", content: { question: "Choose the Arabic letter for B", options: ["\u0628", "\u062a", "\u062b", "\u0646"], answer: "\u0628" } },
      { title: "Letter Ta", titleAr: "\u062f\u0631\u0633 \u062a", type: "FLASHCARD", content: { question: "\u062a - Ta", answer: "T sound", example: "Example: \u062a\u0645\u0631 (tamr)" } },
      { title: "Letter Jeem", titleAr: "\u062f\u0631\u0633 \u062c", type: "FILL_BLANK", content: { question: "Choose the Arabic letter for J", options: ["\u062c", "\u062d", "\u062e", "\u062f"], answer: "\u062c" } }
    ]
  },
  {
    order: 2,
    title: "Joining Letters",
    titleAr: "\u0648\u0635\u0644 \u0627\u0644\u062d\u0631\u0648\u0641",
    description: "See how Arabic letters change shape at the beginning, middle, and end of words.",
    worldMapX: 0.25,
    worldMapY: 0.22,
    isLocked: true,
    lessons: [
      { title: "Ba Forms", titleAr: "\u0623\u0634\u0643\u0627\u0644 \u0628", type: "FLASHCARD", content: { question: "\u0628\u0640 \u0640\u0628\u0640 \u0640\u0628", answer: "Ba changes shape when joined", example: "\u0628\u0627\u0628 (baab)" } },
      { title: "Ta Forms", titleAr: "\u0623\u0634\u0643\u0627\u0644 \u062a", type: "FILL_BLANK", content: { question: "Which joined form starts a word?", options: ["\u062a\u0640", "\u0640\u062a", "\u0627", "\u0648"], answer: "\u062a\u0640" } },
      { title: "Read a Joined Word", titleAr: "\u0642\u0631\u0627\u0621\u0629 \u0643\u0644\u0645\u0629", type: "FLASHCARD", content: { question: "\u0628\u064a\u062a", answer: "bayt - house", example: "Ba joins with ya and ta" } }
    ]
  },
  {
    order: 3,
    title: "Short Vowels",
    titleAr: "\u0627\u0644\u062d\u0631\u0643\u0627\u062a",
    description: "Practice fatha, kasra, and damma so you can sound out simple Arabic words.",
    worldMapX: 0.45,
    worldMapY: 0.34,
    isLocked: true,
    lessons: [
      { title: "Fatha", titleAr: "\u0627\u0644\u0641\u062a\u062d\u0629", type: "FLASHCARD", content: { question: "\u0628\u064e", answer: "ba", example: "Fatha gives a short a sound" } },
      { title: "Kasra", titleAr: "\u0627\u0644\u0643\u0633\u0631\u0629", type: "FILL_BLANK", content: { question: "Which sound is \u0628\u0650?", options: ["bi", "ba", "bu", "bii"], answer: "bi" } },
      { title: "Damma", titleAr: "\u0627\u0644\u0636\u0645\u0629", type: "FLASHCARD", content: { question: "\u0628\u064f", answer: "bu", example: "Damma gives a short u sound" } }
    ]
  },
  {
    order: 4,
    title: "First Quran Words",
    titleAr: "\u0643\u0644\u0645\u0627\u062a \u0642\u0631\u0622\u0646\u064a\u0629",
    description: "Learn common words that appear often in Quranic Arabic.",
    worldMapX: 0.65,
    worldMapY: 0.5,
    isLocked: true,
    lessons: [
      { title: "Allah", titleAr: "\u0627\u0644\u0644\u0647", type: "FLASHCARD", content: { question: "\u0627\u0644\u0644\u0647", answer: "Allah", example: "The name of God" } },
      { title: "Rabb", titleAr: "\u0631\u0628", type: "FILL_BLANK", content: { question: "What does \u0631\u0628 mean?", options: ["Lord", "Book", "House", "Pen"], answer: "Lord" } },
      { title: "Kitab", titleAr: "\u0643\u062a\u0627\u0628", type: "FLASHCARD", content: { question: "\u0643\u062a\u0627\u0628", answer: "book", example: "kitab means book" } }
    ]
  },
  {
    order: 5,
    title: "Daily Phrases",
    titleAr: "\u0639\u0628\u0627\u0631\u0627\u062a \u064a\u0648\u0645\u064a\u0629",
    description: "Use simple Arabic greetings and polite phrases in everyday practice.",
    worldMapX: 0.82,
    worldMapY: 0.68,
    isLocked: true,
    lessons: [
      { title: "Peace Greeting", titleAr: "\u0627\u0644\u0633\u0644\u0627\u0645", type: "FLASHCARD", content: { question: "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064a\u0643\u0645", answer: "Peace be upon you", example: "as-salamu alaykum" } },
      { title: "Thank You", titleAr: "\u0634\u0643\u0631\u0627", type: "FILL_BLANK", content: { question: "What does \u0634\u0643\u0631\u0627 mean?", options: ["Thank you", "Goodbye", "House", "Water"], answer: "Thank you" } },
      { title: "Yes and No", titleAr: "\u0646\u0639\u0645 \u0648 \u0644\u0627", type: "FLASHCARD", content: { question: "\u0646\u0639\u0645 / \u0644\u0627", answer: "yes / no", example: "na'am / laa" } }
    ]
  }
];

async function main() {
  await prisma.progress.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.user.deleteMany();

  for (const chapterData of chapters) {
    const { lessons, ...chapterFields } = chapterData;
    const chapter = await prisma.chapter.create({ data: chapterFields });

    for (const [index, lesson] of lessons.entries()) {
      await prisma.lesson.create({
        data: {
          chapterId: chapter.id,
          order: index + 1,
          title: lesson.title,
          titleAr: lesson.titleAr,
          type: lesson.type,
          xpReward: 10,
          content: lesson.content
        }
      });
    }
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
