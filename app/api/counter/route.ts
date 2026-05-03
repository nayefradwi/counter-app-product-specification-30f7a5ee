import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { counters, DEFAULT_COUNTER_ID } from "@/lib/db/schema";

/**
 * GET /api/counter
 *
 * Returns the current value of the singleton `default` counter row. To make
 * the endpoint resilient when the database has just been provisioned (or the
 * seed script hasn't been run yet), we perform an idempotent upsert before
 * the read so the row is guaranteed to exist.
 *
 * Response: `{ value: number }` with status 200, or
 *           `{ error: "Failed to fetch counter" }` with status 500.
 */
export async function GET() {
  try {
    // (1) Ensure the default counter row exists. `onConflictDoNothing` makes
    //     this a no-op when the row is already present, so concurrent calls
    //     and repeated invocations are safe.
    await db
      .insert(counters)
      .values({ id: DEFAULT_COUNTER_ID, value: 0 })
      .onConflictDoNothing({ target: counters.id });

    // (2) Read the canonical row.
    const [row] = await db
      .select()
      .from(counters)
      .where(eq(counters.id, DEFAULT_COUNTER_ID))
      .limit(1);

    if (!row) {
      // Extremely unlikely after the upsert above, but treat a missing row
      // as a server-side failure rather than returning an undefined value.
      throw new Error("default counter row missing after upsert");
    }

    // (3) Shape the response narrowly — never leak the internal id.
    return Response.json({ value: row.value }, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[GET /api/counter] failed to fetch counter", err);
    return Response.json(
      { error: "Failed to fetch counter" },
      { status: 500 },
    );
  }
}
