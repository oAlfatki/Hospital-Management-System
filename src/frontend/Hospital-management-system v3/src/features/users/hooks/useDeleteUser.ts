import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { useLanguage } from '@/src/core/providers';
import toast from 'react-hot-toast';
export function useDeleteUser() {
  const client = useQueryClient();
  const { t } = useLanguage();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: async () => {
      await Promise.all(['users-list', 'dashboard', 'audit_logs'].map(key => client.invalidateQueries({ queryKey: [key] })));
      toast.success(t('deleteSucceeded'));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
