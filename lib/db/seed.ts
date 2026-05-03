import { db } from "./index";
import { counters, DEFAULT_COUNTER_ID } from "./schema";

/**
 * Ensures the singleton `default` counter row exists.
 *
 * Uses an upsert (`insert ... on conflict do nothing`) so this is safe to call
 * from route handlers, build-time hooks, or one-off scripts without risking
 * duplicate-key errors or clobbering an already-incremented counter.
 *
 * Returns the resulting (or pre-existing) row.
 */
export async function ensureDefaultCounter() {
  await db
    .insert(counters)
    .values({ id: DEFAULT_COUNTER_ID, value: 0 })
    .onConflictDoNothing({ target: counters.id });

  const [row] = await db.select().from(counters);
  return row;
}

// Allow `npx tsx lib/db/seed.ts` (or `node --import tsx lib/db/seed.ts`) to
// run this as a standalone script.
if (require.main === module) {
  ensureDefaultCounter()
    .then((row) => {
      // eslint-disable-next-line no-console
      console.log("[seed] default counter ensured:", row);
      process.exit(0);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[seed] failed to ensure default counter", err);
      process.exit(1);
    });
}
