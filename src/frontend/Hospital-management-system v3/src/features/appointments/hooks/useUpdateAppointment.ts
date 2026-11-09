import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import type { CreateAppointmentRequest } from '../types/CreateAppointmentRequest';
export function useUpdateAppointment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: CreateAppointmentRequest }) => appointmentService.update(id, request),
    onSuccess: async () => { await Promise.all(['appointments', 'dashboard', 'audit_logs'].map(key => client.invalidateQueries({ queryKey: [key] }))); },
  });
}
