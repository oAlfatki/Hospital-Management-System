import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { NotificationUpdateRequest } from '../types/NotificationUpdateRequest';
export function useUpdateNotification() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: NotificationUpdateRequest }) => notificationService.update(id, request),
    onSuccess: async () => { await Promise.all(['notifications', 'audit_logs'].map(key => client.invalidateQueries({ queryKey: [key] }))); },
  });
}
