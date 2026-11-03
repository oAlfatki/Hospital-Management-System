export interface IRecordFormInput {
  patientId: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string;
  status: 'Active' | 'Archived';
}

export interface IUpdateRecordFormInput {
  diagnosis: string;
  treatment: string;
  prescriptions: string;
  status: 'Active' | 'Archived';
}
