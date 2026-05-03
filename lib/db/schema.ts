import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * Single-row table holding the global shared counter.
 *
 * The `id` column always equals 'default' for the canonical row; we model it
 * as a primary key with a default value so an upsert in `seed.ts` (or a route
 * handler) can deterministically target the same row without race conditions.
 */
export const counters = pgTable("counters", {
  id: varchar("id", { length: 64 }).primaryKey().notNull().default("default"),
  value: integer("value").notNull().default(0),
});

export type Counter = typeof counters.$inferSelect;
export type NewCounter = typeof counters.$inferInsert;

/**
 * The id of the singleton counter row. All counter route handlers should read
 * and write against this id.
 */
export const DEFAULT_COUNTER_ID = "default";
