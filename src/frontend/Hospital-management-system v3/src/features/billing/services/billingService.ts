import { billingApi } from '../api/billingApi';
import { BillingMapper } from '../mappers/billingMapper';
import type { Bill } from '../types/billing.types';
import type { CreateBillRequest } from '../types/CreateBillRequest';
import type { RecordPaymentRequest } from '../types/RecordPaymentRequest';
import type { Patient } from '@/src/features/patients/types/Patient';

export const billingService = {
  delete: (id: string): Promise<void> => billingApi.delete(id),
  async update(id: string, request: CreateBillRequest): Promise<Bill> {
    return BillingMapper.toDomain(await billingApi.update(id, request));
  },
  async getAll(): Promise<Bill[]> {
    const responses = await billingApi.getAll();
    return BillingMapper.toDomainList(responses);
  },

  async create(request: CreateBillRequest): Promise<Bill> {
    const response = await billingApi.create(request);
    return BillingMapper.toDomain(response);
  },

  async recordPayment(request: RecordPaymentRequest): Promise<Bill> {
    const response = await billingApi.recordPayment(request);
    return BillingMapper.toDomain(response);
  },

  async sendReminder(billId: string): Promise<void> {
    await billingApi.sendReminder(billId);
  },

  exportToCSV(bills: Bill[], patientsList: Patient[]): string {
    const headers = ['Invoice ID', 'Patient Name', 'Services', 'Subtotal ($)', 'Tax (%)', 'Discount ($)', 'Total ($)', 'Paid ($)', 'Balance ($)', 'Status', 'Due Date'];
    const rows = bills.map((b) => {
      const patient = patientsList.find((p) => p.patientId === b.patientId);
      const patientName = patient ? patient.name : 'Unknown';
      const servicesStr = b.services.map((s) => `${s.serviceName}: $${s.cost}`).join(' | ');
      return [
        b.billId,
        patientName,
        servicesStr,
        b.subtotal,
        b.taxPercent,
        b.discountAmount,
        b.totalAmount,
        b.paidAmount,
        b.pendingDue,
        b.status,
        b.dueDate,
      ];
    });

    const cell = (value: string | number) => {
      const raw = String(value);
      const text = typeof value === 'string' && /^[=+@\t\r-]/.test(raw) ? "'" + raw : raw;
      return '"' + text.replace(/"/g, '""') + '"';
    };
    return '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
  },
};
