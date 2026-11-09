export interface ServiceItem {
  serviceName: string;
  cost: number;
}

export type PaymentStatusType = 'Paid' | 'Pending' | 'Overdue' | 'Cancelled' | 'Pending Insurance';

export interface Bill {
  billId: string; // INV-YYYYMMDD-XXXX
  patientId: string;
  services: ServiceItem[];
  subtotal: number;
  taxPercent: number; // e.g. 5 for 5%
  discountAmount: number; // raw value
  totalAmount: number; // subtotal + tax - discount
  paidAmount: number; // running total paid
  pendingDue: number; // totalAmount - paidAmount
  status: PaymentStatusType;
  paymentDate?: string;
  dueDate: string; // YYYY-MM-DD
  invoiceGenerated: boolean;
  createdBy: string;
  createdOn: string;
  updatedOn: string;
}
