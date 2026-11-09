export interface PatientResponse {
  patientId: string;
  name: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  contactNumber: string;
  email?: string;
  medicalHistory?: string;
  address?: string;
  status: "Active" | "Inactive" | "Deceased";
  createdBy: string;
  createdOn: string | null;
  updatedOn: string | null;
}