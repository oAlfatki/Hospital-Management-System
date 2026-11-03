import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import type { Appointment, AppointmentStatusType } from '../types/appointments.types';
import type { ApiError } from '@/src/core/Errors/ApiError';

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation<Appointment, ApiError, { appointmentId: string; newStatus: AppointmentStatusType }>({
    mutationFn: ({ appointmentId, newStatus }) =>
      appointmentService.updateStatus(appointmentId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

export const useUpdateAppointmentStatusMutation = useUpdateAppointmentStatus;
