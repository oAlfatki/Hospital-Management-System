import type { Doctor } from '../types/Doctor';
import type { Department } from '../types/Department';
import type { DoctorResponse } from '../types/DoctorResponse';
import type { DepartmentResponse } from '../types/DepartmentResponse';
import type { CreateDoctorRequest } from '../types/CreateDoctorRequest';
import type { UpdateDoctorRequest } from '../types/UpdateDoctorRequest';
import type { IDoctorFormInput } from '../types/IDoctorFormInput';
import type { IDepartmentFormInput } from '../types/IDepartmentFormInput';

export const DoctorMapper = {
  toDomain(doc: DoctorResponse | Doctor): Doctor {
    return {
      doctorId: doc.doctorId,
      name: doc.name,
      departmentId: doc.departmentId,
      specialty: doc.specialty,
      contactNumber: doc.contactNumber,
      email: doc.email,
      status: doc.status,
      createdOn: doc.createdOn || '',
      updatedOn: doc.updatedOn || '',
    };
  },

  toDomainList(docs: (DoctorResponse | Doctor)[]): Doctor[] {
    return docs.map((d) => this.toDomain(d));
  },

  toDepartmentDomain(dept: DepartmentResponse | Department): Department {
    return {
      departmentId: dept.departmentId,
      name: dept.name,
      headOfDepartment: dept.headOfDepartment,
      description: dept.description,
      createdOn: dept.createdOn || '',
      updatedOn: dept.updatedOn || '',
    };
  },

  toDepartmentDomainList(depts: (DepartmentResponse | Department)[]): Department[] {
    return depts.map((d) => this.toDepartmentDomain(d));
  },

  toCreateRequest(form: IDoctorFormInput): CreateDoctorRequest {
    return {
      name: form.name.trim(),
      departmentId: form.departmentId,
      specialty: form.specialty.trim(),
      contactNumber: form.contactNumber.trim(),
      email: form.email.trim(),
      status: form.status,
    };
  },

  toUpdateRequest(doctorId: string, form: IDoctorFormInput): UpdateDoctorRequest {
    return { doctorId, ...this.toCreateRequest(form) };
  },

  toDoctorFormValues(doctor: Doctor): IDoctorFormInput {
    return {
      name: doctor.name,
      departmentId: doctor.departmentId,
      specialty: doctor.specialty,
      contactNumber: doctor.contactNumber || '',
      email: doctor.email,
      status: doctor.status,
    };
  },

  toDepartmentFormValues(dept: Department): IDepartmentFormInput {
    return {
      name: dept.name,
      headOfDepartment: dept.headOfDepartment || '',
      description: dept.description || '',
    };
  },
};
