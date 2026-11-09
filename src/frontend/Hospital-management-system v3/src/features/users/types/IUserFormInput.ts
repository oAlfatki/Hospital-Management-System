import type { UserRole } from './UserRole';

export interface IUserFormInput {
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  contactNumber?: string;
  department?: string;
  status: 'Active' | 'Inactive';
}
