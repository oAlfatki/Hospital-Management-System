import type { NotificationUpdateRequest } from '../types/NotificationUpdateRequest';
import { notificationApi } from '../api/notificationApi';
import { NotificationMapper } from '../mappers/notificationMapper';
import type { NotificationLog } from '../types/notifications.types';

export const notificationService = {
  async update(id: string, request: NotificationUpdateRequest): Promise<NotificationLog> { return NotificationMapper.toDomain(await notificationApi.update(id, request)); },
  delete: (id: string): Promise<void> => notificationApi.delete(id),
  async getAll(): Promise<NotificationLog[]> {
    const responses = await notificationApi.getAll();
    return NotificationMapper.toDomainList(responses);
  },
};
