import { patientApi } from "../api/patientApi";
import { PatientMapper } from "../mappers/patientMapper";
import type { CreatePatientRequest } from "../types/CreatePatientRequest";
import type { Patient } from "../types/Patient";
import type { UpdatePatientRequest } from "../types/UpdatePatientRequest";

export const patientService = {
  async getAll(pageNumber: number, pageSize: number) {
    return await patientApi.getAll(pageNumber, pageSize);
  },

  async create(patientRequest: CreatePatientRequest): Promise<Patient> {
    const response = await patientApi.create(patientRequest);

    return PatientMapper.toDomain(response);
  },

  async update(updatePatientRequest: UpdatePatientRequest) {
    const response = await patientApi.update(updatePatientRequest);
    
    return PatientMapper.toDomain(response);
  },
};
