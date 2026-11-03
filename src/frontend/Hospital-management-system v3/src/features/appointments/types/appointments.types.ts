export type AppointmentStatusType = 'Scheduled' | 'Rescheduled' | 'Cancelled';

export interface Appointment {
  appointmentId: string; // format: APP-YYYYMMDD-XXXX
  patientId: string;
  doctorId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  durationMinutes: number; // e.g. 15, 30, 45, 60
  status: AppointmentStatusType;
  notificationSent: boolean;
  createdBy: string; // User ID who scheduled
  createdOn: string;
  updatedOn: string;
}
