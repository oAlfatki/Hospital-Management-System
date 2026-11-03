import axiosInstance from '../../../core/config/axios';
import { ENDPOINTS } from '../../../core/constants';
import type { RecordResponse } from '../types/RecordResponse';
import type { CreateRecordRequest } from '../types/CreateRecordRequest';
import type { UpdateRecordRequest } from '../types/UpdateRecordRequest';

export const recordApi = {
  async getAll(): Promise<RecordResponse[]> {
    const response = await axiosInstance.get<RecordResponse[]>(ENDPOINTS.MEDICAL_RECORDS);
    return response.data;
  },

  async create(request: CreateRecordRequest): Promise<RecordResponse> {
    // Backend accepts the DTO directly and returns { status, response, isSuccess }
    const response = await axiosInstance.post<any>(
      ENDPOINTS.MEDICAL_RECORDS,
      request
    );
    return response.data;
  },

  // FIX: Update now uses the correct RESTful URL with recordId in the path
  async update(request: UpdateRecordRequest): Promise<RecordResponse> {
    const response = await axiosInstance.put<any>(
      `${ENDPOINTS.MEDICAL_RECORDS}/${request.recordId}`,
      request
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${ENDPOINTS.MEDICAL_RECORDS}/${id}`);
  },
};
