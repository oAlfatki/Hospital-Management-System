import type { ServiceItem, PaymentStatusType } from './billing.types';

export interface BillResponse {
  billId: string;
  paymentDate?: string | null;
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
  createdOn: string | null;
  updatedOn: string | null;
}
