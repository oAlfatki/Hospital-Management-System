import type { User } from '../types/User';
import type { UserResponse } from '../types/UserResponse';
import type { CreateUserRequest } from '../types/CreateUserRequest';
import type { UpdateUserRequest } from '../types/UpdateUserRequest';
import type { IUserFormInput } from '../types/IUserFormInput';

export const UserMapper = {
  toDomain(response: UserResponse | User): User {
    return {
      userId: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
      contactNumber: response.contactNumber,
      department: response.department,
      status: response.status,
      createdOn: response.createdOn || '',
      updatedOn: response.updatedOn || '',
    };
  },

  toDomainList(responses: (UserResponse | User)[]): User[] {
    return responses.map((r) => this.toDomain(r));
  },

  toCreateRequest(form: IUserFormInput): CreateUserRequest {
    return {
      password: form.password || undefined,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      contactNumber: form.contactNumber?.trim() || undefined,
      department: form.department?.trim() || undefined,
      status: form.status,
    };
  },

  toUpdateRequest(userId: string, form: IUserFormInput): UpdateUserRequest {
    return { userId, ...this.toCreateRequest(form) };
  },

  toFormValues(user: User): IUserFormInput {
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      contactNumber: user.contactNumber || '',
      department: user.department || '',
      status: user.status,
    };
  },
};
