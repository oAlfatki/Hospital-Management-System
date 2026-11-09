import { useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billingService';
import { useLanguage } from '@/src/core/providers';
import toast from 'react-hot-toast';
export function useDeleteBill() {
  const client = useQueryClient();
  const { t } = useLanguage();
  return useMutation({
    mutationFn: (id: string) => billingService.delete(id),
    onSuccess: async () => {
      await Promise.all(['bills', 'dashboard', 'audit_logs'].map(key => client.invalidateQueries({ queryKey: [key] })));
      toast.success(t('deleteSucceeded'));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
