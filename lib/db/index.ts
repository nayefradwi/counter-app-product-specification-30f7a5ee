import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Provision a Neon Postgres database via the Vercel Marketplace and expose it as DATABASE_URL.",
  );
}

// Reuse a single postgres client across hot reloads in dev and across
// invocations within the same Vercel runtime instance.
declare global {
  // eslint-disable-next-line no-var
  var __counterAppPostgres: ReturnType<typeof postgres> | undefined;
}

const client =
  global.__counterAppPostgres ??
  postgres(connectionString, {
    // Neon's serverless driver-compatible defaults: a single connection per
    // function instance keeps cold starts cheap.
    max: 1,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  global.__counterAppPostgres = client;
}

export const db = drizzle(client, { schema });
export { schema };
