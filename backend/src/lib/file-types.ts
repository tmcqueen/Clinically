export interface FileMetadata {
  id: string;
  patientId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export type FileKey = `files/${string}/${string}`;

export function toFileKey(patientId: string, filename: string): FileKey {
  const timestamp = Date.now();
  return `files/${patientId}/${timestamp}-${filename}`;
}
