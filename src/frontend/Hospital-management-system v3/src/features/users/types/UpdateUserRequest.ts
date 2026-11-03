import type { UserRole } from './UserRole';

export interface UpdateUserRequest {
  userId: string;
  name?: string;
  email?: string;
  role?: UserRole;
  contactNumber?: string;
  department?: string;
  status?: 'Active' | 'Inactive';
}
