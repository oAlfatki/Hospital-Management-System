import type { ServiceItem } from './billing.types';

export interface CreateBillRequest {
  patientId: string;
  services: ServiceItem[];
  taxPercent: number;
  discountAmount: number;
  dueDate: string;
}
