import { userApi } from '../api/userApi';
import { UserMapper } from '../mappers/userMapper';
import type { User } from '../types/User';
import type { CreateUserRequest } from '../types/CreateUserRequest';
import type { UpdateUserRequest } from '../types/UpdateUserRequest';

export const userService = {
  delete: (id: string): Promise<void> => userApi.delete(id),
  async getAll(): Promise<User[]> {
    const responses = await userApi.getAll();
    return UserMapper.toDomainList(responses);
  },

  async create(request: CreateUserRequest): Promise<User> {
    const response = await userApi.create(request);
    return UserMapper.toDomain(response);
  },

  async update(request: UpdateUserRequest): Promise<User> {
    const response = await userApi.update(request);
    return UserMapper.toDomain(response);
  },
};
