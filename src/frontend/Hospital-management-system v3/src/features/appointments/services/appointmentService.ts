import { appointmentApi } from '../api/appointmentApi';
import { AppointmentMapper } from '../mappers/appointmentMapper';
import type { Appointment, AppointmentStatusType } from '../types/appointments.types';
import type { CreateAppointmentRequest } from '../types/CreateAppointmentRequest';
import type { RescheduleAppointmentRequest } from '../types/RescheduleAppointmentRequest';

export const appointmentService = {
  delete: (id: string): Promise<void> => appointmentApi.delete(id),
  async update(id: string, request: CreateAppointmentRequest): Promise<Appointment> {
    return AppointmentMapper.toDomain(await appointmentApi.update(id, request));
  },
  async getAll(): Promise<Appointment[]> {
    const responses = await appointmentApi.getAll();
    return AppointmentMapper.toDomainList(responses);
  },

  async schedule(request: CreateAppointmentRequest): Promise<Appointment> {
    const response = await appointmentApi.schedule(request);
    return AppointmentMapper.toDomain(response);
  },

  async updateStatus(appointmentId: string, newStatus: AppointmentStatusType): Promise<Appointment> {
    const response = await appointmentApi.updateStatus(appointmentId, newStatus);
    return AppointmentMapper.toDomain(response);
  },

  async reschedule(request: RescheduleAppointmentRequest): Promise<Appointment> {
    const response = await appointmentApi.reschedule(request);
    return AppointmentMapper.toDomain(response);
  },
};
