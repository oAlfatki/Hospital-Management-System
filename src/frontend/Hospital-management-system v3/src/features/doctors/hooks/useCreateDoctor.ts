import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import type { CreateDoctorRequest } from '../types/CreateDoctorRequest';

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateDoctorRequest) => doctorService.createDoctor(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors-list'] });
    },
  });
}
