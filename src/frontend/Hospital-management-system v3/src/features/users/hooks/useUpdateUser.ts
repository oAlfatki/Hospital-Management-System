import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { UpdateUserRequest } from '../types/UpdateUserRequest';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateUserRequest) => userService.update(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    },
  });
}
