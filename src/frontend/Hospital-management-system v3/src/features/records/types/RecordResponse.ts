import type { RecordVersion } from './records.types';

export interface RecordResponse {
  recordId: string;
  patientId: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string;
  status: 'Active' | 'Archived';
  createdBy: string;
  createdOn: string | null;
  updatedBy: string;
  updatedOn: string | null;
  version: number;
  history: RecordVersion[];
}
