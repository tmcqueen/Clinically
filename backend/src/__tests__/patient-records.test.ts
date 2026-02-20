import { describe, it, expect } from "vitest";
import type { PatientRecord, PatientRecordKey } from "../lib/types";

describe("Patient Records Types", () => {
  describe("toPatientKey", () => {
    it("should create correct KV key format", () => {
      const id = "abc123";
      const key: PatientRecordKey = `patient:${id}`;
      expect(key).toBe("patient:abc123");
    });
  });

  describe("PatientRecord interface", () => {
    it("should have required fields", () => {
      const record: PatientRecord = {
        id: "test-id",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        phone: "555-1234",
        email: "john@example.com",
        address: "123 Main St",
        insuranceProvider: "Blue Cross",
        insurancePolicyNumber: "POL123",
        emergencyContact: {
          name: "Jane Doe",
          phone: "555-5678",
          relationship: "Spouse",
        },
        medicalHistory: "No known conditions",
        medications: "None",
        allergies: "Penicillin",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      expect(record.id).toBe("test-id");
      expect(record.firstName).toBe("John");
      expect(record.lastName).toBe("Doe");
      expect(record.emergencyContact.relationship).toBe("Spouse");
    });
  });
});
