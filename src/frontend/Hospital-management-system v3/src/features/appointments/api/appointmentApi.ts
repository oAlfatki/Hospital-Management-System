import axios from '../../../core/config/axios';
import { ENDPOINTS } from '../../../core/constants';
import type { AppointmentResponse } from '../types/AppointmentResponse';
import type { CreateAppointmentRequest } from '../types/CreateAppointmentRequest';
import type { RescheduleAppointmentRequest } from '../types/RescheduleAppointmentRequest';
import type { AppointmentStatusType } from '../types/appointments.types';
export const appointmentApi = {
  async update(id: string, request: CreateAppointmentRequest): Promise<AppointmentResponse> { return (await axios.put<AppointmentResponse>(`${ENDPOINTS.APPOINTMENTS}/${id}`, request)).data; },
  async getAll(): Promise<AppointmentResponse[]> { return (await axios.get<AppointmentResponse[]>(ENDPOINTS.APPOINTMENTS)).data; },
  async schedule(request: CreateAppointmentRequest): Promise<AppointmentResponse> { return (await axios.post<AppointmentResponse>(ENDPOINTS.APPOINTMENTS, request)).data; },
  async updateStatus(id: string, status: AppointmentStatusType): Promise<AppointmentResponse> { return (await axios.patch<AppointmentResponse>(`${ENDPOINTS.APPOINTMENTS}/${id}/status`, { status })).data; },
  async reschedule(request: RescheduleAppointmentRequest): Promise<AppointmentResponse> { return (await axios.patch<AppointmentResponse>(`${ENDPOINTS.APPOINTMENTS}/${request.appointmentId}/reschedule`, { newDate: request.newDate, newTime: request.newTime })).data; },
  async delete(id: string): Promise<void> { await axios.delete(`${ENDPOINTS.APPOINTMENTS}/${id}`); },
};
