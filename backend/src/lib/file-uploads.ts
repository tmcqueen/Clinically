import type { Context } from "hono";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { FileMetadata, FileKey } from "./file-types";

export class FileUploadsService {
  constructor(private bucket: R2Bucket) {}

  async upload(
    patientId: string,
    filename: string,
    content: ArrayBuffer,
    contentType: string,
    uploadedBy: string
  ): Promise<FileMetadata> {
    const id = crypto.randomUUID();
    const key: FileKey = `files/${patientId}/${id}-${filename}`;

    await this.bucket.put(key, content, {
      httpMetadata: {
        contentType,
      },
      customMetadata: {
        patientId,
        uploadedBy,
      },
    });

    const metadata: FileMetadata = {
      id,
      patientId,
      filename,
      contentType,
      size: content.byteLength,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
    };

    return metadata;
  }

  async get(key: string): Promise<R2Object | null> {
    return await this.bucket.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async list(patientId: string): Promise<R2Object[]> {
    const objects = await this.bucket.list({
      prefix: `files/${patientId}/`,
    });
    return objects.objects;
  }
}

export function getFileUploadsService(c: Context): FileUploadsService {
  return new FileUploadsService(c.env.FILE_UPLOADS);
}
