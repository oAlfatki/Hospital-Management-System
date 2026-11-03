import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types/appointments.types';
import type { CreateAppointmentRequest } from '../types/CreateAppointmentRequest';
import type { ApiError } from '@/src/core/Errors/ApiError';

export function useScheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation<Appointment, ApiError, CreateAppointmentRequest>({
    mutationFn: (request) => appointmentService.schedule(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });
}

export const useScheduleAppointmentMutation = useScheduleAppointment;
