import { useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billingService';
import type { Bill } from '../types/billing.types';
import type { RecordPaymentRequest } from '../types/RecordPaymentRequest';
import type { ApiError } from '@/src/core/Errors/ApiError';

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation<Bill, ApiError, RecordPaymentRequest>({
    mutationFn: (request) => billingService.recordPayment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

export const useRecordPaymentMutation = useRecordPayment;
