import axiosInstance from '../../../core/config/axios';
import { ENDPOINTS } from '../../../core/constants';
import type { AuditLogResponse } from '../types/AuditLogResponse';

export const auditApi = {
  async getAll(): Promise<AuditLogResponse[]> {
    const response = await axiosInstance.get<AuditLogResponse[]>(ENDPOINTS.AUDIT_LOGS);
    return response.data;
  },
};
