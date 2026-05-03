import type { Config } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString ?? "",
  },
  strict: true,
  verbose: true,
} satisfies Config;
