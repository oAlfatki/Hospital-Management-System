import { useState } from 'react';
import type { Doctor } from '../types/Doctor';

export function useDoctorDialog() {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const openCreateDoctor = () => {
    setMode('create');
    setSelectedDoctor(null);
    setIsDoctorOpen(true);
  };

  const openEditDoctor = (doctor: Doctor) => {
    setMode('edit');
    setSelectedDoctor(doctor);
    setIsDoctorOpen(true);
  };

  const closeDoctorDialog = () => {
    setIsDoctorOpen(false);
    setSelectedDoctor(null);
  };

  const openCreateDepartment = () => {
    setIsDepartmentOpen(true);
  };

  const closeDepartmentDialog = () => {
    setIsDepartmentOpen(false);
  };

  return {
    mode,
    isDoctorOpen,
    isDepartmentOpen,
    selectedDoctor,
    openCreateDoctor,
    openEditDoctor,
    closeDoctorDialog,
    openCreateDepartment,
    closeDepartmentDialog,
  };
}
