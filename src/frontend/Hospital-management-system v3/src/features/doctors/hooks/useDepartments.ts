import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import type { Department } from '../types/Department';

export function useDepartments() {
  return useQuery<Department[]>({
    queryKey: ['departments-list'],
    queryFn: () => doctorService.getDepartments(),
  });
}
