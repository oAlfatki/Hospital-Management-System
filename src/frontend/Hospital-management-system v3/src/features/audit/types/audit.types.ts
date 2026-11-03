export type AuditEntity =
  | 'Patient'
  | 'Appointment'
  | 'Billing'
  | 'MedicalRecord'
  | 'User'
  | 'Doctor'
  | 'Department'
  | 'Notification';

export type AuditAction =
  | 'Create'
  | 'Update'
  | 'Delete'
  | 'Access'
  | 'Login'
  | 'Reschedule'
  | 'Cancel'
  | 'Logout';

export interface AuditLog {
  auditId: string;
  userId: string;
  userName?: string;
  entity: AuditEntity;
  action: AuditAction;
  timestamp: string;
  details?: string;
}
