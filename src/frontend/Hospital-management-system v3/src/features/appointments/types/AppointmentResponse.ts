import type { AppointmentStatusType } from './appointments.types';

export interface AppointmentResponse {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  status: AppointmentStatusType;
  notificationSent: boolean;
  createdBy: string;
  createdOn: string | null;
  updatedOn: string | null;
}
