import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { useLanguage } from '@/src/core/providers';
import toast from 'react-hot-toast';
export function useDeleteNotification() {
  const client = useQueryClient();
  const { t } = useLanguage();
  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: async () => {
      await Promise.all(['notifications', 'audit_logs'].map(key => client.invalidateQueries({ queryKey: [key] })));
      toast.success(t('deleteSucceeded'));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
