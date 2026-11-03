import type { Appointment } from '../types/appointments.types';
import type { AppointmentResponse } from '../types/AppointmentResponse';
import type { CreateAppointmentRequest } from '../types/CreateAppointmentRequest';
import type { RescheduleAppointmentRequest } from '../types/RescheduleAppointmentRequest';
import type { IScheduleAppointmentFormInput, IRescheduleAppointmentFormInput } from '../types/IAppointmentFormInput';

export const AppointmentMapper = {
  toDomain(res: AppointmentResponse | Appointment): Appointment {
    return {
      appointmentId: res.appointmentId,
      patientId: res.patientId,
      doctorId: res.doctorId,
      appointmentDate: res.appointmentDate,
      appointmentTime: res.appointmentTime,
      durationMinutes: res.durationMinutes,
      status: res.status,
      notificationSent: res.notificationSent,
      createdBy: res.createdBy,
      createdOn: res.createdOn,
      updatedOn: res.updatedOn,
    };
  },

  toDomainList(appts: (AppointmentResponse | Appointment)[]): Appointment[] {
    return appts.map((a) => this.toDomain(a));
  },

  toCreateRequest(form: IScheduleAppointmentFormInput): CreateAppointmentRequest {
    return {
      patientId: form.patientId,
      doctorId: form.doctorId,
      appointmentDate: form.appointmentDate,
      appointmentTime: form.appointmentTime,
      durationMinutes: Number(form.durationMinutes) || 15,
    };
  },

  toRescheduleRequest(appointmentId: string, form: IRescheduleAppointmentFormInput): RescheduleAppointmentRequest {
    return {
      appointmentId,
      newDate: form.appointmentDate,
      newTime: form.appointmentTime,
    };
  },

  toFormValues(appt: Appointment): IScheduleAppointmentFormInput {
    return {
      patientId: appt.patientId,
      doctorId: appt.doctorId,
      appointmentDate: appt.appointmentDate,
      appointmentTime: appt.appointmentTime,
      durationMinutes: appt.durationMinutes,
    };
  },
};
