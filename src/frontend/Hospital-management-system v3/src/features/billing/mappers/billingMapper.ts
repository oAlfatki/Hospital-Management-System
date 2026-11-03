import type { Bill, ServiceItem } from '../types/billing.types';
import type { BillResponse } from '../types/BillResponse';
import type { CreateBillRequest } from '../types/CreateBillRequest';
import type { RecordPaymentRequest } from '../types/RecordPaymentRequest';
import type { ICreateBillFormInput, IRecordPaymentFormInput } from '../types/IBillFormInput';

export const BillingMapper = {
  toDomain(res: BillResponse | Bill): Bill {
    return {
      billId: res.billId,
      patientId: res.patientId,
      services: res.services,
      subtotal: res.subtotal,
      taxPercent: res.taxPercent,
      discountAmount: res.discountAmount,
      totalAmount: res.totalAmount,
      paidAmount: res.paidAmount,
      pendingDue: res.pendingDue,
      status: res.status,
      dueDate: res.dueDate,
      invoiceGenerated: res.invoiceGenerated,
      createdBy: res.createdBy,
      createdOn: res.createdOn,
      updatedOn: res.updatedOn,
    };
  },

  toDomainList(bills: (BillResponse | Bill)[]): Bill[] {
    return bills.map((b) => this.toDomain(b));
  },

  toCreateRequest(form: ICreateBillFormInput): CreateBillRequest {
    return {
      patientId: form.patientId,
      services: form.services,
      taxPercent: Number(form.taxPercent) || 0,
      discountAmount: Number(form.discountAmount) || 0,
      dueDate: form.dueDate,
    };
  },

  toRecordPaymentRequest(form: IRecordPaymentFormInput): RecordPaymentRequest {
    return {
      billId: form.billId,
      amountToPay: Number(form.amountToPay) || 0,
    };
  },

  calculateTotal(services: ServiceItem[], taxPercent: number, discountAmount: number) {
    const subtotal = services.reduce((acc, item) => acc + (item.cost || 0), 0);
    const tax = (subtotal * (taxPercent || 0)) / 100;
    const totalAmount = Math.max(0, subtotal + tax - (discountAmount || 0));
    return { subtotal, tax, totalAmount };
  },
};
