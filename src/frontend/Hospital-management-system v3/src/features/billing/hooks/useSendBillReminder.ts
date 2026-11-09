import { useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billingService';
import type { ApiError } from '@/src/core/Errors/ApiError';

export function useSendBillReminder() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (billId) => billingService.sendReminder(billId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

export const useSendBillReminderMutation = useSendBillReminder;
