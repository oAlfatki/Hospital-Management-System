import { useMemo, useState } from "react";
import type { Patients } from "../types/Patient";

export type PatientStatusType =
  | "All"
  | "Active"
  | "Inactive"
  | "Deceased";

export function usePatientFilters(patients: Patients[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<PatientStatusType>("All");

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        patient.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.patientId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.contactNumber.includes(searchTerm);

      const matchesStatus =
        statusFilter === "All"
          ? true
          : patient.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, statusFilter]);

  return {
    searchTerm,
    statusFilter,

    setSearchTerm,
    setStatusFilter,

    filteredPatients,
  };
}