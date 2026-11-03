export interface Doctor {
  doctorId: string; // unique, system-generated, cannot be edited
  name: string;
  departmentId: string; // references Department
  specialty: string; // e.g. Cardiology, Pediatrics
  contactNumber?: string;
  email: string;
  status: 'Active' | 'Inactive';
  createdOn: string;
  updatedOn: string;
}

export interface Department {
  departmentId: string; // unique, system-generated, cannot be edited
  name: string; // e.g., Cardiology, Pediatrics, Emergency
  headOfDepartment?: string; // Doctor ID of an active doctor
  description?: string;
  createdOn: string;
  updatedOn: string;
}
