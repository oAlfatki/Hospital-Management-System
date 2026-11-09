export interface DepartmentResponse {
  departmentId: string;
  name: string;
  headOfDepartment?: string;
  description?: string;
  createdOn?: string | null;
  updatedOn?: string | null;
}
