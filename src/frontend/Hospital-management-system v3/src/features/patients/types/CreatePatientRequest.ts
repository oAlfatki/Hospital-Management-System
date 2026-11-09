export interface CreatePatientRequest {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  contactNumber: string; // 10 digits
  email: string;
  medicalHistory?: string;
  address?: string;
  status: "Active" | "Inactive" | "Deceased";
}
