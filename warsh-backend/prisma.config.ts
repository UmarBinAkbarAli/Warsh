import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma client generation only needs a syntactically valid datasource URL.
// Runtime deployments and database commands still receive DATABASE_URL from
// their environment; the local placeholder is never a production connection.
const datasourceUrl =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/warsh_build";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.cjs"
  },
  datasource: {
    url: datasourceUrl,
    // Only needed by `prisma migrate diff/dev`, which builds a throwaway copy of
    // the schema to compare against. Left undefined in deployments, which never
    // run migrations against a shadow database.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL
  }
});
