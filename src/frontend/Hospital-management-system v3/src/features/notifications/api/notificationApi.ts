import axiosInstance from '../../../core/config/axios';
import { ENDPOINTS } from '../../../core/constants';
import type { NotificationLog } from '../types/notifications.types';

export const notificationApi = {
  async getAll(): Promise<NotificationLog[]> {
    const response = await axiosInstance.get<NotificationLog[]>(ENDPOINTS.NOTIFICATIONS);
    return response.data;
  },


};
