import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const visitDefinitions = sqliteTable("visit_definitions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  schema: text("schema").notNull(),
  defaultDurationMinutes: integer("default_duration_minutes").notNull(),
  color: text("color"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type VisitDefinition = typeof visitDefinitions.$inferSelect;
export type NewVisitDefinition = typeof visitDefinitions.$inferInsert;
