import type { CreateDoctorRequest } from './CreateDoctorRequest';
export interface UpdateDoctorRequest extends CreateDoctorRequest {
  doctorId: string;
}
