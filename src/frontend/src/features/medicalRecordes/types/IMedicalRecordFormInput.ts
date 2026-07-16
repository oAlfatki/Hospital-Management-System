export interface IMedicalRecordFormInput {
  patientId: string;
  diagnosis: string;
  treatment: string | undefined;
  prescriptions: string | undefined;
  status: string;
}