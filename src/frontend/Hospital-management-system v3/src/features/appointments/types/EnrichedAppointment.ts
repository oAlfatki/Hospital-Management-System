import { Appointment } from './appointments.types';

export interface EnrichedAppointment extends Appointment {
  patientName: string;
  doctorName: string;
  specialty: string;
}
