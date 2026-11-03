export interface UpdateRecordRequest {
  recordId: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string;
  status: 'Active' | 'Archived';
}
