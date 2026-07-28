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
    url: datasourceUrl
  }
});
