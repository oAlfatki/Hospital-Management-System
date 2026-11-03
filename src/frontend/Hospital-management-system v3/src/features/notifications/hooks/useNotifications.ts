import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { NotificationLog } from '../types/notifications.types';

export const useNotifications = () => {
  return useQuery<NotificationLog[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll(),
  });
};
