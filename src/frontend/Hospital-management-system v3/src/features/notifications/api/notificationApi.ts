import type { NotificationUpdateRequest } from '../types/NotificationUpdateRequest';
import axiosInstance from '../../../core/config/axios';
import { ENDPOINTS } from '../../../core/constants';
import type { NotificationLog } from '../types/notifications.types';

export const notificationApi = {
  async update(id: string, request: NotificationUpdateRequest): Promise<NotificationLog> { return (await axiosInstance.put<NotificationLog>(`${ENDPOINTS.NOTIFICATIONS}/${id}`, request)).data; },
  async delete(id: string): Promise<void> { await axiosInstance.delete(`${ENDPOINTS.NOTIFICATIONS}/${id}`); },
  async getAll(): Promise<NotificationLog[]> {
    const response = await axiosInstance.get<NotificationLog[]>(ENDPOINTS.NOTIFICATIONS);
    return response.data;
  },


};
