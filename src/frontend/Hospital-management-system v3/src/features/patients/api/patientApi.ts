import axiosInstance from "../../../core/config/axios";
import type { CreatePatientRequest } from "../types/CreatePatientRequest";
import type { PatientResponse } from "../types/PatientResponse";
import type { UpdatePatientRequest } from "../types/UpdatePatientRequest";

export const patientApi = {
  async getAll(): Promise<PatientResponse[]> {
    const response = await axiosInstance.get<PatientResponse[]>("/api/patients");
    return response.data;
  },

  async getById(id: string): Promise<PatientResponse> {
    const response = await axiosInstance.get<PatientResponse>(`/api/patients/${id}`);
    return response.data;
  },

  async create(request: CreatePatientRequest): Promise<PatientResponse> {
    const response = await axiosInstance.post<PatientResponse>(
      "/api/patients",
      request,
    );
    return response.data;
  },

  async update(updatePatientRequest: UpdatePatientRequest): Promise<PatientResponse> {
    const { patientId, ...body } = updatePatientRequest;
    const response = await axiosInstance.put<PatientResponse>(
      `/api/patients/${patientId}`,
      body,
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/api/patients/${id}`);
  },
};
