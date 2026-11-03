import { useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billingService';
import type { Bill } from '../types/billing.types';
import type { CreateBillRequest } from '../types/CreateBillRequest';
import type { ApiError } from '@/src/core/Errors/ApiError';

export function useCreateBill() {
  const queryClient = useQueryClient();

  return useMutation<Bill, ApiError, CreateBillRequest>({
    mutationFn: (request) => billingService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

export const useCreateBillMutation = useCreateBill;
