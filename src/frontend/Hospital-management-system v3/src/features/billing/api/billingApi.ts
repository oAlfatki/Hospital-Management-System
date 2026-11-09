import axios from '../../../core/config/axios';
import { ENDPOINTS } from '../../../core/constants';
import type { BillResponse } from '../types/BillResponse';
import type { CreateBillRequest } from '../types/CreateBillRequest';
import type { RecordPaymentRequest } from '../types/RecordPaymentRequest';
export const billingApi = {
  async getAll(): Promise<BillResponse[]> { return (await axios.get<BillResponse[]>(ENDPOINTS.BILLS)).data; },
  async create(request: CreateBillRequest): Promise<BillResponse> { return (await axios.post<BillResponse>(ENDPOINTS.BILLS, request)).data; },
  async recordPayment(request: RecordPaymentRequest): Promise<BillResponse> { return (await axios.post<BillResponse>(`${ENDPOINTS.BILLS}/${request.billId}/payments`, { amountToPay: request.amountToPay })).data; },
  async sendReminder(id: string): Promise<void> { await axios.post(`${ENDPOINTS.BILLS}/${id}/reminders`); },
  async delete(id: string): Promise<void> { await axios.delete(`${ENDPOINTS.BILLS}/${id}`); },
};
