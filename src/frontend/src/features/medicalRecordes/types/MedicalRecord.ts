import type { RecordVersion } from "./RecordVersion";

export interface MedicalRecord {
  recordId: string;
  patientId: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string;
  status: 'Active' | 'Archived';
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
  version: number;
  history: RecordVersion[];
}