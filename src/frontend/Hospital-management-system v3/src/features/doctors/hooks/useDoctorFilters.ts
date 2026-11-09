import { useState } from 'react';
import type { Doctor } from '../types/Doctor';
import type { Department } from '../types/Department';
export function useDoctorFilters(doctors: Doctor[], departments: Department[]) {
  const [search, setSearch] = useState('');
  const term = search.trim().toLocaleLowerCase();
  const filteredDoctors = doctors.filter(doc => [doc.doctorId, doc.name, doc.specialty, doc.email, doc.contactNumber, departments.find(d => d.departmentId === doc.departmentId)?.name].some(v => v?.toLocaleLowerCase().includes(term)));
  const filteredDepartments = departments.filter(dept => [dept.departmentId, dept.name, dept.description, doctors.find(d => d.doctorId === dept.headOfDepartment)?.name].some(v => v?.toLocaleLowerCase().includes(term)));
  return { search, setSearch, filteredDoctors, filteredDepartments };
}
