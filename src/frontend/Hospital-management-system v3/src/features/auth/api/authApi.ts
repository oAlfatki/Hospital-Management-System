import axiosInstance from '@/src/core/config/axios';
import { ENDPOINTS } from '@/src/core/constants';
import type { User } from '@/src/features/users/types/User';

export const authApi = {
  login: async (name: string, password: string) => {
    console.log("start call api");
    const response = await axiosInstance.post<{ success: boolean; user?: User; error?: string }>(
      ENDPOINTS.AUTH_LOGIN,
      { name, password  }
    );


    console.log(response);

    return response.data;
  },
};
