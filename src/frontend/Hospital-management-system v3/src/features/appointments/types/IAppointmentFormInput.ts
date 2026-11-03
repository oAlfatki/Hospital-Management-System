export interface IScheduleAppointmentFormInput {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
}

export interface IRescheduleAppointmentFormInput {
  appointmentDate: string;
  appointmentTime: string;
}
