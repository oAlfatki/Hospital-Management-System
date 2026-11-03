import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { User } from '../types/User';

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users-list'],
    queryFn: () => userService.getAll(),
  });
}
