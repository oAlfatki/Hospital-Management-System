import { Bill } from './billing.types';

export interface EnrichedBill extends Bill {
  patientName: string;
  contactNumber: string;
}
