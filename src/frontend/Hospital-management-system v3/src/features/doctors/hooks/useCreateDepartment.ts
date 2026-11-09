import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import type { Department } from '../types/Department';

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: Omit<Department, 'departmentId' | 'createdOn' | 'updatedOn'>) =>
      doctorService.createDepartment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['departments-list'] });
    },
  });
}
