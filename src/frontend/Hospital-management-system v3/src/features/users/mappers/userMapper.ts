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
      createdOn: response.createdOn || new Date().toISOString(),
      updatedOn: response.updatedOn || new Date().toISOString(),
    };
  },

  toDomainList(responses: (UserResponse | User)[]): User[] {
    return responses.map((r) => this.toDomain(r));
  },

  toCreateRequest(form: IUserFormInput): CreateUserRequest {
    return {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      contactNumber: form.contactNumber?.trim() || undefined,
      department: form.department?.trim() || undefined,
      status: form.status,
    };
  },

  toUpdateRequest(userId: string, form: Partial<IUserFormInput>): UpdateUserRequest {
    return {
      userId,
      ...(form.name && { name: form.name.trim() }),
      ...(form.email && { email: form.email.trim() }),
      ...(form.role && { role: form.role }),
      ...(form.contactNumber !== undefined && { contactNumber: form.contactNumber.trim() }),
      ...(form.department !== undefined && { department: form.department.trim() }),
      ...(form.status && { status: form.status }),
    };
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
