import axiosInstance from '../../../core/config/axios';
import { ENDPOINTS } from '../../../core/constants';
import type { BillResponse } from '../types/BillResponse';
import type { CreateBillRequest } from '../types/CreateBillRequest';
import type { RecordPaymentRequest } from '../types/RecordPaymentRequest';

export const billingApi = {
  async getAll(): Promise<BillResponse[]> {
    // Backend now returns array directly (RESTful)
    const response = await axiosInstance.get<BillResponse[]>(ENDPOINTS.BILLS);
    return response.data;
  },

  async create(request: CreateBillRequest): Promise<BillResponse> {
    const response = await axiosInstance.post<any>(
      ENDPOINTS.BILLS,
      request
    );
    return response.data;
  },

  async recordPayment(request: RecordPaymentRequest): Promise<BillResponse> {
    // POST /api/billing/{billId} with payment amount — Backend handles via update
    const response = await axiosInstance.put<any>(
      `${ENDPOINTS.BILLS}/${request.billId}`,
      { partialPaymentAmount: request.amountToPay, status: 'Paid' }
    );
    return response.data;
  },

  async sendReminder(billId: string): Promise<void> {
    // No dedicated reminder endpoint in Backend — fire-and-forget notification
    await axiosInstance.post(`/api/notifications`, {
      patientID: billId,
      userID: 'system',
      type: 'Email',
      message: `Payment reminder for bill ${billId}`,
      status: 'Pending',
    }).catch(() => {
      // Non-critical — ignore if fails
    });
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${ENDPOINTS.BILLS}/${id}`);
  },
};
