import { useQuery } from '@tanstack/react-query';
import { billingService } from '../services/billingService';
import type { Bill } from '../types/billing.types';

export function useBills() {
  return useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: () => billingService.getAll(),
  });
}
