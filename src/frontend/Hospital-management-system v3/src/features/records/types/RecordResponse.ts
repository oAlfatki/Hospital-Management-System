import type { RecordVersion } from './records.types';

export interface RecordResponse {
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
