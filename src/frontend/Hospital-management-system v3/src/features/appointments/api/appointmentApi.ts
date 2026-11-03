import axiosInstance from '../../../core/config/axios';
import { ENDPOINTS } from '../../../core/constants';
import type { AppointmentResponse } from '../types/AppointmentResponse';
import type { CreateAppointmentRequest } from '../types/CreateAppointmentRequest';
import type { RescheduleAppointmentRequest } from '../types/RescheduleAppointmentRequest';
import type { AppointmentStatusType } from '../types/appointments.types';

export const appointmentApi = {
  async getAll(): Promise<AppointmentResponse[]> {
    const response = await axiosInstance.get<AppointmentResponse[]>(ENDPOINTS.APPOINTMENTS);
    return response.data;
  },

  async schedule(request: CreateAppointmentRequest): Promise<AppointmentResponse> {
    // Backend now returns { status, response, isSuccess } — not { success, appointment }
    const response = await axiosInstance.post<any>(
      ENDPOINTS.APPOINTMENTS,
      request
    );
    return response.data;
  },

  // FIX: Backend has no /appointments/status or /appointments/reschedule sub-routes.
  // updateStatus uses PUT /{appointmentId} with updated status in body.
  async updateStatus(appointmentId: string, newStatus: AppointmentStatusType): Promise<AppointmentResponse> {
    const response = await axiosInstance.put<any>(
      `${ENDPOINTS.APPOINTMENTS}/${appointmentId}`,
      { status: newStatus }
    );
    return response.data;
  },

  async reschedule(request: RescheduleAppointmentRequest): Promise<AppointmentResponse> {
    const response = await axiosInstance.put<any>(
      `${ENDPOINTS.APPOINTMENTS}/${request.appointmentId}`,
      { date: request.newDate, time: request.newTime }
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${ENDPOINTS.APPOINTMENTS}/${id}`);
  },
};
