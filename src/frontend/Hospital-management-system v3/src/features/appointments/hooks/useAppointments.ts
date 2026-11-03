import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types/appointments.types';

export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => appointmentService.getAll(),
  });
}
