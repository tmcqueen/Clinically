import { describe, it, expect } from "vitest";
import * as users from "../db/users";
import * as appointments from "../db/appointments";
import * as visitDefinitions from "../db/visit-definitions";

describe("Database Schema", () => {
  describe("users table", () => {
    it("should have correct columns", () => {
      expect(users.users.id).toBeDefined();
      expect(users.users.role).toBeDefined();
      expect(users.users.name).toBeDefined();
      expect(users.users.email).toBeDefined();
      expect(users.users.createdAt).toBeDefined();
      expect(users.users.updatedAt).toBeDefined();
    });
  });

  describe("appointments table", () => {
    it("should have correct columns", () => {
      expect(appointments.appointments.id).toBeDefined();
      expect(appointments.appointments.patientRecordId).toBeDefined();
      expect(appointments.appointments.clinicianId).toBeDefined();
      expect(appointments.appointments.visitDefinitionId).toBeDefined();
      expect(appointments.appointments.scheduledStart).toBeDefined();
      expect(appointments.appointments.scheduledEnd).toBeDefined();
      expect(appointments.appointments.status).toBeDefined();
    });
  });

  describe("visitDefinitions table", () => {
    it("should have correct columns", () => {
      expect(visitDefinitions.visitDefinitions.id).toBeDefined();
      expect(visitDefinitions.visitDefinitions.name).toBeDefined();
      expect(visitDefinitions.visitDefinitions.schema).toBeDefined();
      expect(visitDefinitions.visitDefinitions.defaultDurationMinutes).toBeDefined();
    });
  });
});
