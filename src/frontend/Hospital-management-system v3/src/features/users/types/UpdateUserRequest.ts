import type { CreateUserRequest } from './CreateUserRequest';
export interface UpdateUserRequest extends CreateUserRequest {
  userId: string;
}
