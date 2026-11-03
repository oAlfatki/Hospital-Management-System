export type UserRole = 'Admin' | 'Doctor' | 'Nurse' | 'Accounts' | 'Management';

export interface User {
  userId: string; // unique system-generated identifier; cannot be edited
  name: string; // Full name
  role: UserRole;
  email: string; // Unique login email
  contactNumber?: string;
  status: 'Active' | 'Inactive';
  department?: string;
  createdOn: string;
  updatedOn: string;
}

export interface AuditLog {
  auditId: string; // Unique system-generated identifier
  userId: string; // References the user who performed the action
  userName?: string; // Cache user name for convenience
  entity: 'Patient' | 'Appointment' | 'Billing' | 'MedicalRecord' | 'User' | 'Doctor' | 'Department' | 'Notification';
  action: 'Create' | 'Update' | 'Delete' | 'Access' | 'Login' | 'Reschedule' | 'Cancel' | 'Logout';
  timestamp: string;
  details?: string; // Optional description of changes or actions
}
