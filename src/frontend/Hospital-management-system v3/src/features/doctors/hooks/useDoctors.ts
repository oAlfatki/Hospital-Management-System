import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import type { Doctor } from '../types/Doctor';

export function useDoctors() {
  return useQuery<Doctor[]>({
    queryKey: ['doctors-list'],
    queryFn: () => doctorService.getDoctors(),
  });
}
