import { notificationApi } from '../api/notificationApi';
import { NotificationMapper } from '../mappers/notificationMapper';
import type { NotificationLog } from '../types/notifications.types';

export const notificationService = {
  async getAll(): Promise<NotificationLog[]> {
    const responses = await notificationApi.getAll();
    return NotificationMapper.toDomainList(responses);
  },
};
