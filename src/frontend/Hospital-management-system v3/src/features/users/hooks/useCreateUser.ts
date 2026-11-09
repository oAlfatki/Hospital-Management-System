import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { CreateUserRequest } from '../types/CreateUserRequest';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateUserRequest) => userService.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    },
  });
}
