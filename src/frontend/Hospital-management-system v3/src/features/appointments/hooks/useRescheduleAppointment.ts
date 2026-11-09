import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types/appointments.types';
import type { RescheduleAppointmentRequest } from '../types/RescheduleAppointmentRequest';
import type { ApiError } from '@/src/core/Errors/ApiError';

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation<Appointment, ApiError, RescheduleAppointmentRequest>({
    mutationFn: (request) => appointmentService.reschedule(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

export const useRescheduleAppointmentMutation = useRescheduleAppointment;
