export interface IDoctorFormInput {
  name: string;
  departmentId: string;
  specialty: string;
  // contactNumber: string;
  // email: string;
  userID:string;
  status: 'Active' | 'Inactive';
}
