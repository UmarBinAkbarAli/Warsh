import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readIntEnv } from "./env";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// node-postgres defaults to 10 connections per pool. A lambda serves one
// request at a time, so nine of those only ever sit idle — but they are held
// open against Neon's pooler by every warm instance at once, which is how
// /api/progress ended up failing with "Too many database connections opened".
// Three is enough for the routes that fan out with Promise.all and small enough
// that a burst of instances stays well inside Neon's ceiling. Requests queue for
// a connection rather than racing to open one, and give up rather than hanging
// past the function's own deadline. DATABASE_POOL_MAX overrides the three;
// anything that is not a small positive integer is ignored, not trusted.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
  max: readIntEnv("DATABASE_POOL_MAX", 3, { min: 1, max: 20, scope: "[prisma]" }),
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

// Cached in production too. Next.js can evaluate this module once per server
// bundle, and every extra evaluation used to open its own pool against the same
// database from the same instance.
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

globalForPrisma.prisma = prisma;
