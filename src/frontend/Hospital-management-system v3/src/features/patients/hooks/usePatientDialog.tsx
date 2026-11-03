import { useState } from "react";
import type { Patient } from "../types/Patient";

export function usePatientDialog() {
  const [mode, setMode] =
    useState<"create" | "edit">("create");

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [isRegisterOpen, setIsRegisterOpen] =
    useState(false);

  const [isEditOpen, setIsEditOpen] =
    useState(false);

  const openRegisterDialog = () => {
    setMode("create");
    setSelectedPatient(null);
    setIsRegisterOpen(true);
  };

  const openEditDialog = (patient: Patient) => {
    setMode("edit");
    setSelectedPatient(patient);
    setIsEditOpen(true);
  };

  const closeDialog = () => {
    if (mode === "create") {
      setIsRegisterOpen(false);
    } else {
      setIsEditOpen(false);
    }
  };

  return {
    mode,

    selectedPatient,

    isRegisterOpen,

    isEditOpen,

    openRegisterDialog,

    openEditDialog,

    closeDialog,

    setSelectedPatient,
  };
}