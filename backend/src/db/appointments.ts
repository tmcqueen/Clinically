import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey(),
  patientRecordId: text("patient_record_id").notNull(),
  clinicianId: text("clinician_id").notNull(),
  visitDefinitionId: text("visit_definition_id").notNull(),
  scheduledStart: integer("scheduled_start", { mode: "timestamp" }).notNull(),
  scheduledEnd: integer("scheduled_end", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
