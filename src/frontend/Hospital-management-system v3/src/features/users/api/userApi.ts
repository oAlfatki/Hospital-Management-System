import axiosInstance from '../../../core/config/axios';
import type { UserResponse } from '../types/UserResponse';
import type { CreateUserRequest } from '../types/CreateUserRequest';
import type { UpdateUserRequest } from '../types/UpdateUserRequest';

export const userApi = {
  async delete(id: string): Promise<void> { await axiosInstance.delete(`/api/auth/${id}`); },
  async getAll(): Promise<UserResponse[]> {
    const response = await axiosInstance.get<UserResponse[]>('/api/auth/users');
    return response.data;
  },

  async create(request: CreateUserRequest): Promise<UserResponse> {
    const response = await axiosInstance.post<UserResponse>('/api/auth/register', request);
    return response.data;
  },

  async update(request: UpdateUserRequest): Promise<UserResponse> {
    const { userId, ...body } = request;
    const response = await axiosInstance.put<UserResponse>(`/api/auth/${userId}`, body);
    return response.data;
  },
};
