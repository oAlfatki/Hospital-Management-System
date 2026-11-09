import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../services/patientService';
import { useLanguage } from '@/src/core/providers';
import toast from 'react-hot-toast';
export function useDeletePatient() {
  const client = useQueryClient();
  const { t } = useLanguage();
  return useMutation({
    mutationFn: (id: string) => patientService.delete(id),
    onSuccess: async () => {
      await Promise.all(['patients', 'dashboard', 'audit_logs'].map(key => client.invalidateQueries({ queryKey: [key] })));
      toast.success(t('deleteSucceeded'));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
