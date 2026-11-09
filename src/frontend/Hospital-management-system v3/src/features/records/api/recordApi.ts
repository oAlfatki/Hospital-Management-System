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
    const response = await axiosInstance.post<RecordResponse>(
      ENDPOINTS.MEDICAL_RECORDS,
      request
    );
    return response.data;
  },

  async update(request: UpdateRecordRequest): Promise<RecordResponse> {
    const { recordId, ...body } = request;
    const response = await axiosInstance.put<RecordResponse>(
      `${ENDPOINTS.MEDICAL_RECORDS}/${recordId}`,
      body
    );
    return response.data;
  },

};
