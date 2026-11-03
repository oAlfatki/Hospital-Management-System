import type { UserRole } from './UserRole';

export interface User {
  userId: string;
  name: string;
  role: UserRole;
  email: string;
  contactNumber?: string;
  status: 'Active' | 'Inactive';
  department?: string;
  createdOn: string;
  updatedOn: string;
}
