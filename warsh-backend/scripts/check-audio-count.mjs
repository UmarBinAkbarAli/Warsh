import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const total = await prisma.vocabularyWord.count();
const missing = await prisma.vocabularyWord.count({ where: { audioUrl: null } });
console.log(`Total words: ${total}`);
console.log(`Missing audio: ${missing}`);
console.log(`Already have audio: ${total - missing}`);
await prisma.$disconnect();
