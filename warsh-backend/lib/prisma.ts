import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? ""
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
