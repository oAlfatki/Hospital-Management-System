import { useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billingService';
import type { CreateBillRequest } from '../types/CreateBillRequest';
export function useUpdateBill() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: CreateBillRequest }) => billingService.update(id, request),
    onSuccess: async () => { await Promise.all(['bills', 'dashboard', 'audit_logs'].map(key => client.invalidateQueries({ queryKey: [key] }))); },
  });
}
