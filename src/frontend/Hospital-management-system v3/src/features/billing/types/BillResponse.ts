import type { ServiceItem, PaymentStatusType } from './billing.types';

export interface BillResponse {
  billId: string;
  patientId: string;
  services: ServiceItem[];
  subtotal: number;
  taxPercent: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  pendingDue: number;
  status: PaymentStatusType;
  dueDate: string;
  invoiceGenerated: boolean;
  createdBy: string;
  createdOn: string;
  updatedOn: string;
}
