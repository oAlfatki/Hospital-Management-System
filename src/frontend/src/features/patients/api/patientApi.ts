import axiosInstance from "../../../core/config/axios";
import type { Paginated } from "../../../core/types/PaginatedResponse";
import type { CreatePatientRequest } from "../types/CreatePatientRequest";
import type { Patient } from "../types/Patient";
import type { PatientResponse } from "../types/PatientResponse";
import type { UpdatePatientRequest } from "../types/UpdatePatientRequest";

export const patientApi = {
  //PatientPaginationResponse
  async getAll(
    pageNumber: number,
    pageSize: number,
  ): Promise<Paginated<Patient>> {
    const response = await axiosInstance.get<Paginated<Patient>>(
      `/api/patients/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    return response.data;
  },

  async create(request: CreatePatientRequest): Promise<PatientResponse> {
    console.log("START call API"); //https://localhost:7286/api/patients

    const response = await axiosInstance.post<PatientResponse>(
      "/api/patients",
      request,
    );
    console.log(response);
    console.log("END call API");
    return response.data;
  },

  async update(
    updatePatientRequest: UpdatePatientRequest,
  ): Promise<PatientResponse> {
    const response = await axiosInstance.put<PatientResponse>(
      `/api/patients/${updatePatientRequest.patientId}`,
      updatePatientRequest,
    );

    return response.data;
  },
};
