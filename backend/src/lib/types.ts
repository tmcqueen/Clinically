export interface PatientRecord {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string;
  medications: string;
  allergies: string;
  createdAt: string;
  updatedAt: string;
}

export type PatientRecordKey = `patient:${string}`;

export function toPatientKey(id: string): PatientRecordKey {
  return `patient:${id}`;
}
