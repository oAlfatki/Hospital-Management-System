import { doctorApi } from '../api/doctorApi';
import { DoctorMapper } from '../mappers/doctorMapper';
import type { Doctor } from '../types/Doctor';
import type { Department } from '../types/Department';
import type { CreateDoctorRequest } from '../types/CreateDoctorRequest';
import type { UpdateDoctorRequest } from '../types/UpdateDoctorRequest';

export const doctorService = {
  deleteDepartment: (id: string): Promise<void> => doctorApi.deleteDepartment(id),
  async updateDepartment(id: string, request: import('../types/IDepartmentFormInput').IDepartmentFormInput): Promise<Department> {
    return DoctorMapper.toDepartmentDomain(await doctorApi.updateDepartment(id, request));
  },
  async getDoctors(): Promise<Doctor[]> {
    const responses = await doctorApi.getAllDoctors();
    return DoctorMapper.toDomainList(responses);
  },

  async getDepartments(): Promise<Department[]> {
    const responses = await doctorApi.getAllDepartments();
    return DoctorMapper.toDepartmentDomainList(responses);
  },

  async createDoctor(request: CreateDoctorRequest): Promise<Doctor> {
    const response = await doctorApi.createDoctor(request);
    return DoctorMapper.toDomain(response);
  },

  async updateDoctor(request: UpdateDoctorRequest): Promise<Doctor> {
    const response = await doctorApi.updateDoctor(request);
    return DoctorMapper.toDomain(response);
  },

  async deleteDoctor(id: string): Promise<void> {
    await doctorApi.deleteDoctor(id);
  },

  async createDepartment(request: Omit<Department, 'departmentId' | 'createdOn' | 'updatedOn'>): Promise<Department> {
    const response = await doctorApi.createDepartment(request);
    return DoctorMapper.toDepartmentDomain(response);
  },
};
