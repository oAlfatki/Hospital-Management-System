export interface PatientResponse {
  ID: string;
  Name: string;
  DateOfBirth: string;
  Gender: "Male" | "Female" | "Other" | "Prefer not to say";
  ContactNumber: string;
  Email?: string;
  MedicalHistory?: string;
  Address?: string;
  Status: "Active" | "Inactive" | "Deceased";
  createdBy: string;
  createdOn: string;
  updatedOn: string;
}