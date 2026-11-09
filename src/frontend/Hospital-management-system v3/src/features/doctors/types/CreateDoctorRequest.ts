// export interface CreateDoctorRequest {
//   name: string;
//   departmentId: string;
//   specialty: string;
//   status: 'Active' | 'Inactive';
//   userID:string;
// }
export interface CreateDoctorRequest {
  id?: string;
  departmentID: string;
  specialization: string;
  status: 'Active' | 'Inactive';
  userID: string;
}
