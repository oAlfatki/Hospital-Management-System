import type { ServiceItem } from './billing.types';

export interface CreateBillRequest {
  id?: string;
  patientID: string;
  status: string;
  date: string | null;
  partialPaymentAmount: number | null;
  dueDate: string | null;
  invoice: string;
  grossAmount: number;
  discount: number | null;
  insuranceCoverage: number | null;
  patientResponsibility: number;
}
