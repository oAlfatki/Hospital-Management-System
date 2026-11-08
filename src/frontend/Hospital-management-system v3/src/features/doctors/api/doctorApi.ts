import axiosInstance from '../../../core/config/axios';
import type { DoctorResponse } from '../types/DoctorResponse';
import type { DepartmentResponse } from '../types/DepartmentResponse';
import type { CreateDoctorRequest } from '../types/CreateDoctorRequest';
import type { UpdateDoctorRequest } from '../types/UpdateDoctorRequest';

export const doctorApi = {
  // Backend now returns array directly (RESTful)
  async getAllDoctors(): Promise<DoctorResponse[]> {
    const response = await axiosInstance.get<DoctorResponse[]>('/api/doctors');
    return response.data;
  },

  async getAllDepartments(): Promise<DepartmentResponse[]> {
    const response = await axiosInstance.get<DepartmentResponse[]>('/api/departments');
    return response.data;
  },

  async createDoctor(request: CreateDoctorRequest): Promise<DoctorResponse> {
    // Backend returns { status, response, isSuccess } — not { doctor }
    // const response = await axiosInstance.post<any>('/api/doctors', request);
     const response = await axiosInstance.post<any>(
    '/api/doctors',
    { doctor: request }
  );
    return response.data;
  },

  async updateDoctor(request: UpdateDoctorRequest): Promise<DoctorResponse> {
    const response = await axiosInstance.put<any>(`/api/doctors/${request.doctorId}`, request);
    return response.data;
  },

  async deleteDoctor(id: string): Promise<void> {
    await axiosInstance.delete(`/api/doctors/${id}`);
  },

  async createDepartment(request: Omit<DepartmentResponse, 'departmentId' | 'createdOn' | 'updatedOn'>): Promise<DepartmentResponse> {
    const response = await axiosInstance.post<any>('/api/departments', request);
    return response.data;
  },

  async updateDepartment(id: string, request: Partial<DepartmentResponse>): Promise<DepartmentResponse> {
    const response = await axiosInstance.put<any>(`/api/departments/${id}`, request);
    return response.data;
  },

  async deleteDepartment(id: string): Promise<void> {
    await axiosInstance.delete(`/api/departments/${id}`);
  },
};
