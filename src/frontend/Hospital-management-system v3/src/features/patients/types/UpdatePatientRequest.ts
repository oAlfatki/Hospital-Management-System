export interface UpdatePatientRequest {
  patientId: string;

  name: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";

  contactNumber: string;
  email: string;
  address?: string;
  medicalHistory?: string;

  status: "Active" | "Inactive" | "Deceased";
}