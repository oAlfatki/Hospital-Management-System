import { DataTable } from "../../../core/components/ui/DataTable";
import type { Patient } from "../types/Patient";
import { PatientTableHeader } from "./PatientTableHeader";
import { PatientTableRow } from "./PatientTableRow";

interface PatientTableProps {
  patients: Patient[];
  pagination?: React.ReactNode;
  onEdit: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  deleting?: boolean;
  canEdit?: boolean;
}

export function PatientTable({
  patients,
  pagination,
  onEdit, onDelete, deleting, canEdit,
}: PatientTableProps) {
  return (
    <DataTable pagination={pagination}>
      <PatientTableHeader />
      <tbody>
        {patients.map((patient) => (
          <PatientTableRow
            key={patient.patientId}
            patient={patient}
            onEdit={onEdit} onDelete={onDelete} deleting={deleting} canEdit={canEdit}
          />
        ))}
      </tbody>
    </DataTable>
  );
}