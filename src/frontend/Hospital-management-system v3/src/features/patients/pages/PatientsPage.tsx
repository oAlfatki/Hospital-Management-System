import { useDeletePatient } from '../hooks/useDeletePatient';
import { useAuth } from '@/src/core/providers';
import { Plus } from "lucide-react";
import { Button } from "../../../core/components/ui/Button";
import { useLanguage } from "../../../core/providers/LanguageProvider";
import { usePatients } from "../hooks/usePatients";
import { Paginator } from "../../../core/components/ui/Paginator";
import { PatientDialog } from "../components/PatientDialog";
import { LoadingState } from "../../../core/components/ui/LoadingState";
import { ErrorState } from "../../../core/components/ui/ErrorState";
import { PageHeader } from "../../../core/components/ui/PageHeader";
import { FilterBar } from "../../../core/components/ui/FilterBar";
import { SearchInput } from "../../../core/components/ui/SearchInput";
import { PatientStatusFilter } from "../components/PatientStatusFilter";
import { PatientTable } from "../components/PatientTable";
import { usePatientFilters } from "../hooks/usePatientFilters";
import { usePatientPagination } from "../hooks/usePatientPagination";
import { usePatientDialog } from "../hooks/usePatientDialog";
import { usePatientForm } from "../hooks/usePatientForm";

export const PatientsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const canEdit = !!user && ['Admin', 'Doctor', 'Nurse', 'Management'].includes(user.role);
  const deletion = useDeletePatient();

  // Filter patients by search and status

  // Dialog states
  const dialog = usePatientDialog();

  const pagination = usePatientPagination();

  const { data: patients = [], isLoading, error } = usePatients();
  const filters = usePatientFilters(patients);
  const totalCount = filters.filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pagination.pageSize));
  const pageNumber = Math.min(pagination.page, totalPages);
  const visiblePatients = filters.filteredPatients.slice((pageNumber - 1) * pagination.pageSize, pageNumber * pagination.pageSize);

  const patientForm = usePatientForm({
    mode: dialog.mode,
    selectedPatient: dialog.selectedPatient,
    page: pagination.page,
    pageSize: pagination.pageSize,
    onSuccess: dialog.closeDialog,
  });

  if (isLoading) {
    return <LoadingState message={t("commonLoading")} />;
  }

  if (error) {
    return <ErrorState message={t("commonSomethingWentWrong")} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <PageHeader
        title={t("patientDirectory")}
        description={t("patientDirectoryDesc")}
      >
        {canEdit && <Button
          onClick={() => { patientForm.resetForm(); dialog.openRegisterDialog(); }}
          className="h-10 gap-2 px-5 bg-brand hover:bg-brand-dark text-white shadow-card transition-all duration-normal"
        >
          <Plus className="h-4 w-4" />
          {t("registerPatient")}
        </Button>}
      </PageHeader>

      {/* Directory Search & Filter Controls */}

      <FilterBar>
        <SearchInput
          value={filters.searchTerm}
          onChange={filters.setSearchTerm}
          placeholder={t("searchPatientsPlaceholder")}
        />
        <PatientStatusFilter
          value={filters.statusFilter}
          onChange={filters.setStatusFilter}
        />
      </FilterBar>

      {/* Directory Listing Table */}
      {
        <PatientTable
          patients={visiblePatients}
          canEdit={canEdit} deleting={deletion.isPending}
          onDelete={user?.role === 'Admin' ? patient => deletion.mutate(patient.patientId) : undefined}
          onEdit={patient => { patientForm.loadPatient(patient); dialog.openEditDialog(patient); }}
          pagination={
            <Paginator
              page={pageNumber ?? 1}
              pageCount={totalPages ?? 1}
              total={totalCount ?? 1}
              isLoading={isLoading}
              onClickPrev={() => pagination.setPage(Math.max(1, pageNumber - 1))}
              onClickNext={() => pagination.setPage(Math.min(totalPages, pageNumber + 1))}
            />
          }
        />
      }

      <PatientDialog
        mode={dialog.mode}
        isOpen={
          dialog.mode === "create" ? dialog.isRegisterOpen : dialog.isEditOpen
        }
        form={patientForm.form}
        onSubmit={patientForm.onSubmit}
        isSubmitting={patientForm.isSubmitting}
        onClose={dialog.closeDialog}
      />
    </div>
  );
};
