import axiosInstance from '@/src/core/config/axios';
import { ENDPOINTS } from '@/src/core/constants';
import type { User } from '@/src/features/users/types/User';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post<{ success: boolean; user?: User; error?: string }>(
      ENDPOINTS.AUTH_LOGIN,
      { email, password }
    );
    return response.data;
  },
};
