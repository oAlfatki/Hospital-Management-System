import { Pencil } from "lucide-react";
import type { Patients } from "../types/Patient";


interface PatientRowActionsProps {
  patient: Patients;
  onEdit: (patient: Patients) => void;
}

export function PatientRowActions({
  patient,
  onEdit,
}: PatientRowActionsProps) {
  return (
    <button
      type="button"
      onClick={() => onEdit(patient)}
      className="
        inline-flex
        items-center
        justify-center
        rounded-md
        p-2
        text-text-muted
        transition-colors
        hover:bg-surface-hover
        hover:text-brand
      "
    >
      <Pencil className="h-4 w-4" />
    </button>
  );
}