import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Context } from "hono";

export type Database = DrizzleD1Database<Record<string, never>>;

export function getDb(c: Context): Database {
  return drizzle(c.env.DB);
}
