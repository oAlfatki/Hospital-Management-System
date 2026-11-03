import { patientApi } from "../api/patientApi";
import { PatientMapper } from "../mappers/patientMapper";
import type { CreatePatientRequest } from "../types/CreatePatientRequest";
import type { Patient } from "../types/Patient";
import type { UpdatePatientRequest } from "../types/UpdatePatientRequest";

export const patientService = {
  async getAll(): Promise<Patient[]> {
    const responses = await patientApi.getAll();
    // Backend returns PatientDTO array — map to domain Patient
    return responses.map((r: any) => ({
      patientId: r.iD ?? r.patientId ?? r.id ?? "",
      name: r.name ?? r.personID ?? "",
      dateOfBirth: r.dateOfBirth ?? "",
      gender: r.gender ?? "Other",
      contactNumber: r.contactNumber ?? "",
      email: r.email,
      address: r.address,
      medicalHistory: r.medicalHistory,
      status: r.status === true || r.status === "Active" ? "Active" : "Inactive",
      createdBy: r.createdBy ?? "",
      createdOn: r.createdOn ?? new Date().toISOString(),
      updatedOn: r.updatedOn ?? new Date().toISOString(),
    }));
  },

  async create(patientRequest: CreatePatientRequest): Promise<Patient> {
    const response = await patientApi.create(patientRequest);
    return PatientMapper.toDomain(response);
  },

  async update(updatePatientRequest: UpdatePatientRequest): Promise<Patient> {
    const response = await patientApi.update(updatePatientRequest);
    return PatientMapper.toDomain(response);
  },

  async delete(id: string): Promise<void> {
    await patientApi.delete(id);
  },
};
