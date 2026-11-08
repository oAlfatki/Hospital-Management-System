import { DataTable } from "../../../core/components/ui/DataTable";
import type { Patients } from "../types/Patient";
import { PatientTableHeader } from "./PatientTableHeader";
import { PatientTableRow } from "./PatientTableRow";

interface PatientTableProps {
  patients: Patients[];
  pagination?: React.ReactNode;
  onEdit: (patient: Patients) => void;
}

export function PatientTable({
  patients,
  pagination,
  onEdit,
}: PatientTableProps) {
  return (
    <DataTable pagination={pagination}>
      <PatientTableHeader />
      <tbody>
        {patients.map((patient) => (
          <PatientTableRow
            key={patient.patientId}
            patient={patient}
            onEdit={onEdit}
          />
        ))}
      </tbody>
    </DataTable>
  );
}