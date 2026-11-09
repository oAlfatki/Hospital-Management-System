import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import type { UpdateDoctorRequest } from '../types/UpdateDoctorRequest';

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateDoctorRequest) => doctorService.updateDoctor(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['doctors-list'] });
    },
  });
}
