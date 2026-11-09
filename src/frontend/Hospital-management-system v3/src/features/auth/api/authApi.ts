import axiosInstance from '@/src/core/config/axios';
import { ENDPOINTS } from '@/src/core/constants';
import type { UserResponse } from '@/src/features/users/types/UserResponse';

export const authApi = {
  async getSession(): Promise<UserResponse> { return (await axiosInstance.get<UserResponse>('/api/auth/session')).data; },
  async logout(): Promise<void> { await axiosInstance.post('/api/auth/logout'); },
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post<{ success: boolean; user?: UserResponse; error?: string }>(
      ENDPOINTS.AUTH_LOGIN,
      { email, password }
    );
    return response.data;
  },
};
