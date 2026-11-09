import { DeleteButton } from '@/src/core/components/ui/DeleteButton';
import { Pencil } from "lucide-react";
import type { Patient } from "../types/Patient";


interface PatientRowActionsProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  deleting?: boolean;
  canEdit?: boolean;
}

export function PatientRowActions({
  patient,
  onEdit, onDelete, deleting, canEdit = true,
}: PatientRowActionsProps) {
  return (
    <>
    {canEdit && <button
      type="button"
      aria-label="Edit patient"
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
    </button>}
    {onDelete && <DeleteButton name={patient.name} label="Delete patient" disabled={deleting} onDelete={() => onDelete(patient)} />}
    </>
  );
}