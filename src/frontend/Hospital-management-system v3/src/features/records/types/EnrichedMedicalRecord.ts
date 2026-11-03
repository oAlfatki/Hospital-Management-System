import { MedicalRecord } from './records.types';

export interface EnrichedMedicalRecord extends MedicalRecord {
  patientName: string;
  contactNumber: string;
}
