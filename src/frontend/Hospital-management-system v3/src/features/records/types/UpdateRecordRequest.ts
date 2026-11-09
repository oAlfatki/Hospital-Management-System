export interface UpdateRecordRequest {
  recordId: string;
  version: number;
  diagnosis: string;
  treatment: string;
  prescriptions: string;
  status: 'Active' | 'Archived';
}
