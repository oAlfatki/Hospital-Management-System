export interface Doctor {
  doctorId: string;
  name: string;
  departmentId: string;
  specialty: string;
  // contactNumber?: string;
  // email: string;
  userID:string;
  status: 'Active' | 'Inactive';
  createdOn: string;
  updatedOn: string;
}
