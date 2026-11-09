import axiosInstance from '../../../core/config/axios';
import type { DoctorResponse } from '../types/DoctorResponse';
import type { DepartmentResponse } from '../types/DepartmentResponse';
import type { CreateDoctorRequest } from '../types/CreateDoctorRequest';
import type { UpdateDoctorRequest } from '../types/UpdateDoctorRequest';

export const doctorApi = {
  async getAllDoctors(): Promise<DoctorResponse[]> {
    const response = await axiosInstance.get<DoctorResponse[]>('/api/doctors');
    return response.data;
  },

  async getAllDepartments(): Promise<DepartmentResponse[]> {
    const response = await axiosInstance.get<DepartmentResponse[]>('/api/departments');
    return response.data;
  },

  async createDoctor(request: CreateDoctorRequest): Promise<DoctorResponse> {
    const response = await axiosInstance.post<DoctorResponse>('/api/doctors', request);
    return response.data;
  },

  async updateDoctor(request: UpdateDoctorRequest): Promise<DoctorResponse> {
    const { doctorId, ...body } = request;
    const response = await axiosInstance.put<DoctorResponse>(`/api/doctors/${doctorId}`, body);
    return response.data;
  },

  async deleteDoctor(id: string): Promise<void> {
    await axiosInstance.delete(`/api/doctors/${id}`);
  },

  async createDepartment(request: Omit<DepartmentResponse, 'departmentId' | 'createdOn' | 'updatedOn'>): Promise<DepartmentResponse> {
    const response = await axiosInstance.post<DepartmentResponse>('/api/departments', request);
    return response.data;
  },

  async updateDepartment(id: string, request: Partial<DepartmentResponse>): Promise<DepartmentResponse> {
    const response = await axiosInstance.put<DepartmentResponse>(`/api/departments/${id}`, request);
    return response.data;
  },

  async deleteDepartment(id: string): Promise<void> {
    await axiosInstance.delete(`/api/departments/${id}`);
  },
};
