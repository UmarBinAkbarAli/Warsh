import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const total = await prisma.vocabularyWord.count();
const missing = await prisma.vocabularyWord.count({ where: { audioUrl: null } });
console.log(`Total words: ${total}`);
console.log(`Missing audio: ${missing}`);
console.log(`Already have audio: ${total - missing}`);
await prisma.$disconnect();
