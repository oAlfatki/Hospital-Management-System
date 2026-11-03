import type { UserRole } from './UserRole';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  contactNumber?: string;
  department?: string;
  status: 'Active' | 'Inactive';
}
