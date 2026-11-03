export interface CreateDoctorRequest {
  name: string;
  departmentId: string;
  specialty: string;
  contactNumber?: string;
  email: string;
  status: 'Active' | 'Inactive';
}
