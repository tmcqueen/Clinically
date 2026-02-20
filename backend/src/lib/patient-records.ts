import type { Context } from "hono";
import type { KVNamespace } from "@cloudflare/workers-types";
import type { PatientRecord, PatientRecordKey } from "./types";

export class PatientRecordsService {
  constructor(private kv: KVNamespace) {}

  async get(id: string): Promise<PatientRecord | null> {
    const key: PatientRecordKey = `patient:${id}`;
    const result = await this.kv.get(key, "json");
    return result as PatientRecord | null;
  }

  async put(id: string, record: PatientRecord): Promise<void> {
    const key: PatientRecordKey = `patient:${id}`;
    await this.kv.put(key, JSON.stringify(record));
  }

  async delete(id: string): Promise<void> {
    const key: PatientRecordKey = `patient:${id}`;
    await this.kv.delete(key);
  }

  async list(prefix?: string): Promise<PatientRecord[]> {
    const list = await this.kv.list({
      prefix: prefix || "patient:",
    });
    
    const records: PatientRecord[] = [];
    for (const key of list.keys) {
      const result = await this.kv.get(key.name, "json");
      if (result) {
        records.push(result as PatientRecord);
      }
    }
    return records;
  }
}

export function getPatientRecordsService(c: Context): PatientRecordsService {
  return new PatientRecordsService(c.env.PATIENT_RECORDS);
}
