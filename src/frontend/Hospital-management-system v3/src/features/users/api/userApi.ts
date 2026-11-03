import axiosInstance from '../../../core/config/axios';
import type { UserResponse } from '../types/UserResponse';
import type { CreateUserRequest } from '../types/CreateUserRequest';
import type { UpdateUserRequest } from '../types/UpdateUserRequest';

// Users are managed via /api/auth endpoints in this Backend
export const userApi = {
  async getAll(): Promise<UserResponse[]> {
    const response = await axiosInstance.get<UserResponse[]>('/api/auth/users');
    return response.data;
  },

  async create(request: CreateUserRequest): Promise<UserResponse> {
    const response = await axiosInstance.post<any>('/api/auth/register', request);
    return response.data;
  },

  async update(request: UpdateUserRequest): Promise<UserResponse> {
    const response = await axiosInstance.put<any>(`/api/auth/${request.userId}`, request);
    return response.data;
  },
};
