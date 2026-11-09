import { patientApi } from "../api/patientApi";
import { PatientMapper } from "../mappers/patientMapper";
import type { CreatePatientRequest } from "../types/CreatePatientRequest";
import type { Patient } from "../types/Patient";
import type { UpdatePatientRequest } from "../types/UpdatePatientRequest";

export const patientService = {
  async getAll(): Promise<Patient[]> {
    const responses = await patientApi.getAll();
    return PatientMapper.toDomainList(responses);
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
