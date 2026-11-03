import { ServiceItem } from './billing.types';

export interface ICreateBillFormInput {
  patientId: string;
  services: ServiceItem[];
  taxPercent: number;
  discountAmount: number;
  dueDate: string;
}

export interface IRecordPaymentFormInput {
  billId: string;
  amountToPay: number;
}
