import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import { useLanguage } from '@/src/core/providers';
import toast from 'react-hot-toast';
export function useDeleteDoctor() {
  const client = useQueryClient();
  const { t } = useLanguage();
  return useMutation({
    mutationFn: (id: string) => doctorService.deleteDoctor(id),
    onSuccess: async () => {
      await Promise.all(['doctors-list', 'departments-list', 'dashboard', 'audit_logs'].map(key => client.invalidateQueries({ queryKey: [key] })));
      toast.success(t('deleteSucceeded'));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
