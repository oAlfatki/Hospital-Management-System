import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordService } from '../services/recordService';
import { useLanguage } from '@/src/core/providers';
import toast from 'react-hot-toast';
export function useDeleteRecord() {
  const client = useQueryClient();
  const { t } = useLanguage();
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) => recordService.delete(id, version),
    onSuccess: async () => {
      await Promise.all(['medical_records', 'audit_logs'].map(key => client.invalidateQueries({ queryKey: [key] })));
      toast.success(t('deleteSucceeded'));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
