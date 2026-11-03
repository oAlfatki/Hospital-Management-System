import axiosInstance from '../../../core/config/axios';
import { ENDPOINTS } from '../../../core/constants';
import type { NotificationLog } from '../types/notifications.types';

export const notificationApi = {
  async getAll(): Promise<NotificationLog[]> {
    const response = await axiosInstance.get<NotificationLog[]>(ENDPOINTS.NOTIFICATIONS);
    return response.data;
  },

  async create(notification: Partial<NotificationLog>): Promise<NotificationLog> {
    const response = await axiosInstance.post<any>(ENDPOINTS.NOTIFICATIONS, notification);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${ENDPOINTS.NOTIFICATIONS}/${id}`);
  },
};
