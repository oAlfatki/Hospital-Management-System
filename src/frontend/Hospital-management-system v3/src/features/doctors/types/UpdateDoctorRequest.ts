export interface UpdateDoctorRequest {
  doctorId: string;
  name?: string;
  departmentId?: string;
  specialty?: string;
  contactNumber?: string;
  email?: string;
  status?: 'Active' | 'Inactive';
}
