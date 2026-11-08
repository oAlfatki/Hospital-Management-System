import type { CreatePatientRequest } from "../types/CreatePatientRequest";
import type { IPatientFormInput  } from "../types/IRegisterPatientFormInput";
import type { Patients } from "../types/Patient";
import type { PatientResponse } from "../types/PatientResponse";
import type { UpdatePatientRequest } from "../types/UpdatePatientRequest";

export const PatientMapper = {
  toDomain(response: PatientResponse): Patients {
    return {
      patientId: response.ID,
      name: response.Name,
      dateOfBirth: response.DateOfBirth,
      gender: response.Gender,
      contactNumber: response.ContactNumber,
      email: response.Email,
      address: response.Address,
      medicalHistory: response.MedicalHistory,
      status: response.Status,
      createdBy: response.createdBy,
      createdOn: response.createdOn,
      updatedOn: response.updatedOn,
    };
  },

  toDomainList(responses: PatientResponse[]): Patients[] {
    return responses.map(this.toDomain);
  },

  toCreateRequest(form: IPatientFormInput): CreatePatientRequest {
    return {
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      contactNumber: form.contactNumber.trim(),
      email: form.email || undefined,
      address: form.address || undefined,
      medicalHistory: form.medicalHistory || undefined,
      status: form.status,
    };
  },

  toUpdateRequest(
    patientId: string,
    form: IPatientFormInput
  ): UpdatePatientRequest {
    return {
      patientId,
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      contactNumber: form.contactNumber.trim(),
      email: form.email || undefined,
      address: form.address || undefined,
      medicalHistory: form.medicalHistory || undefined,
      status: form.status,
    };
  },

  toFormValues(patient: Patients): IPatientFormInput {
    return {
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      email: patient.email ?? "",
      address: patient.address ?? "",
      medicalHistory: patient.medicalHistory ?? "",
      status: patient.status,
    };
  },
};