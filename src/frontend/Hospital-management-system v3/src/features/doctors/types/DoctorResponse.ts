export interface DoctorResponse {
  doctorId: string;
  name: string;
  departmentId: string;
  specialty: string;
  contactNumber?: string;
  email: string;
  status: 'Active' | 'Inactive';
  createdOn?: string;
  updatedOn?: string;
}
