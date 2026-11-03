import { doctorApi } from '../api/doctorApi';
import { DoctorMapper } from '../mappers/doctorMapper';
import type { Doctor } from '../types/Doctor';
import type { Department } from '../types/Department';
import type { CreateDoctorRequest } from '../types/CreateDoctorRequest';
import type { UpdateDoctorRequest } from '../types/UpdateDoctorRequest';

export const doctorService = {
  async getDoctors(): Promise<Doctor[]> {
    const responses = await doctorApi.getAllDoctors();
    // Backend returns DoctorDTO array — map to domain shape
    return (responses as any[]).map((r) => ({
      doctorId: r.iD ?? r.doctorId ?? r.id ?? "",
      name: r.name ?? r.userID ?? "",
      departmentId: r.departmentID ?? r.departmentId ?? "",
      specialty: r.specialization ?? r.specialty ?? "",
      contactNumber: r.contactNumber,
      email: r.email ?? "",
      status: r.status === true || r.status === "Active" ? "Active" : "Inactive",
      createdOn: r.createdOn ?? new Date().toISOString(),
      updatedOn: r.updatedOn ?? new Date().toISOString(),
    }));
  },

  async getDepartments(): Promise<Department[]> {
    const responses = await doctorApi.getAllDepartments();
    // Backend returns DepartmentDTO array
    return (responses as any[]).map((r) => ({
      departmentId: r.iD ?? r.departmentId ?? r.id ?? "",
      name: r.name ?? "",
      headOfDepartment: r.headOfDepartment,
      description: r.description,
      createdOn: r.createdOn ?? new Date().toISOString(),
      updatedOn: r.updatedOn ?? new Date().toISOString(),
    }));
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
