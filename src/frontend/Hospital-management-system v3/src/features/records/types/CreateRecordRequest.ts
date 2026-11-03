export interface CreateRecordRequest {
  patientId: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string;
  status: 'Active' | 'Archived';
}
