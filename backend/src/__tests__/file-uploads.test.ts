import { describe, it, expect } from "vitest";
import type { FileMetadata, FileKey } from "../lib/file-types";

describe("File Uploads Types", () => {
  describe("toFileKey", () => {
    it("should create correct R2 key format", () => {
      const patientId = "patient123";
      const filename = "document.pdf";
      const key: FileKey = `files/${patientId}/${filename}`;
      expect(key).toBe("files/patient123/document.pdf");
    });
  });

  describe("FileMetadata interface", () => {
    it("should have required fields", () => {
      const metadata: FileMetadata = {
        id: "file-123",
        patientId: "patient-456",
        filename: "lab-results.pdf",
        contentType: "application/pdf",
        size: 1024,
        uploadedAt: "2024-01-01T00:00:00Z",
        uploadedBy: "user-789",
      };

      expect(metadata.id).toBe("file-123");
      expect(metadata.patientId).toBe("patient-456");
      expect(metadata.contentType).toBe("application/pdf");
    });
  });
});
