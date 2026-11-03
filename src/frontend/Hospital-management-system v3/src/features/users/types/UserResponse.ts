import type { UserRole } from './UserRole';

export interface UserResponse {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  contactNumber?: string;
  department?: string;
  status: 'Active' | 'Inactive';
  createdOn?: string;
  updatedOn?: string;
}
